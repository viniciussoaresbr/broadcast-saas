import {
  FieldValue,
  Firestore,
  QueryDocumentSnapshot,
  Timestamp,
} from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';

const PAGE_SIZE = 200;
// Até 2.000 mensagens por execução; o restante fica para a próxima.
const MAX_PAGES_PER_RUN = 10;

type ProcessResult = { sent: number; skipped: number; failed: number };

// Relê a mensagem em transação: execuções repetidas ou concorrentes não a enviam duas vezes.
const markAsSent = async (
  db: Firestore,
  doc: QueryDocumentSnapshot,
  now: Timestamp,
): Promise<boolean> =>
  db.runTransaction(async tx => {
    const current = await tx.get(doc.ref);
    const scheduledAt = current.get('scheduledAt') as Timestamp | null;
    const isDue =
      current.exists &&
      current.get('status') === 'scheduled' &&
      scheduledAt !== null &&
      scheduledAt.toMillis() <= now.toMillis();
    if (!isDue) return false;

    tx.update(doc.ref, {
      status: 'sent',
      sentAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return true;
  });

const processPage = async (
  db: Firestore,
  docs: QueryDocumentSnapshot[],
  now: Timestamp,
): Promise<ProcessResult> => {
  const results = await Promise.allSettled(
    docs.map(doc => markAsSent(db, doc, now)),
  );
  return results.reduce<ProcessResult>(
    (acc, result, index) => {
      if (result.status === 'rejected') {
        logger.error('Failed to process scheduled message', {
          messageId: docs[index].id,
          error: String(result.reason),
        });
        return { ...acc, failed: acc.failed + 1 };
      }
      return result.value
        ? { ...acc, sent: acc.sent + 1 }
        : { ...acc, skipped: acc.skipped + 1 };
    },
    { sent: 0, skipped: 0, failed: 0 },
  );
};

const sumResults = (a: ProcessResult, b: ProcessResult): ProcessResult => ({
  sent: a.sent + b.sent,
  skipped: a.skipped + b.skipped,
  failed: a.failed + b.failed,
});

export const processDueMessages = async (
  db: Firestore,
  now: Timestamp = Timestamp.now(),
  startAfter?: QueryDocumentSnapshot,
  pagesLeft = MAX_PAGES_PER_RUN,
): Promise<ProcessResult> => {
  const baseQuery = db
    .collection('messages')
    .where('status', '==', 'scheduled')
    .where('scheduledAt', '<=', now)
    .orderBy('scheduledAt')
    .limit(PAGE_SIZE);
  const query = startAfter ? baseQuery.startAfter(startAfter) : baseQuery;

  const snapshot = await query.get();
  if (snapshot.empty) return { sent: 0, skipped: 0, failed: 0 };

  const pageResult = await processPage(db, snapshot.docs, now);
  if (snapshot.size < PAGE_SIZE || pagesLeft <= 1) return pageResult;

  const lastDoc = snapshot.docs[snapshot.docs.length - 1];
  return sumResults(
    pageResult,
    await processDueMessages(db, now, lastDoc, pagesLeft - 1),
  );
};
