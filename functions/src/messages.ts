import { FieldValue, Firestore, Timestamp } from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/v2/https';
import {
  assertContactsInConnection,
  assertOwned,
  getOwnedConnection,
} from './lib/ownership';
import {
  asPayload,
  parseContactIds,
  parseContent,
  parseId,
  parseScheduledAt,
} from './lib/validation';

/** Fields that depend on whether the message is sent now or scheduled. */
const deliveryFields = (scheduledAt: number | null) =>
  scheduledAt === null
    ? {
        status: 'sent',
        scheduledAt: null,
        sentAt: FieldValue.serverTimestamp(),
      }
    : {
        status: 'scheduled',
        scheduledAt: Timestamp.fromMillis(scheduledAt),
        sentAt: null,
      };

export const createMessage = async (
  db: Firestore,
  uid: string,
  data: unknown,
  now = Date.now(),
): Promise<{ id: string }> => {
  const payload = asPayload(data);
  const connectionId = parseId(payload.connectionId, 'connectionId');
  const contactIds = parseContactIds(payload.contactIds);
  const content = parseContent(payload.content);
  const scheduledAt = parseScheduledAt(payload.scheduledAt, now);
  const ref = db.collection('messages').doc();

  await db.runTransaction(async tx => {
    await getOwnedConnection(db, tx, uid, connectionId);
    await assertContactsInConnection(db, tx, uid, connectionId, contactIds);
    tx.create(ref, {
      ownerId: uid,
      connectionId,
      contactIds,
      content,
      ...deliveryFields(scheduledAt),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });

  return { id: ref.id };
};

/**
 * Only scheduled messages can be edited. Passing `scheduledAt: null` turns
 * the message into an immediate (simulated) send.
 */
export const updateMessage = async (
  db: Firestore,
  uid: string,
  data: unknown,
  now = Date.now(),
): Promise<void> => {
  const payload = asPayload(data);
  const messageId = parseId(payload.messageId, 'messageId');
  const contactIds = parseContactIds(payload.contactIds);
  const content = parseContent(payload.content);
  const scheduledAt = parseScheduledAt(payload.scheduledAt, now);
  const ref = db.collection('messages').doc(messageId);

  await db.runTransaction(async tx => {
    const message = assertOwned(
      await tx.get(ref),
      uid,
      'Mensagem não encontrada.',
    );
    if (message.status !== 'scheduled') {
      throw new HttpsError(
        'failed-precondition',
        'Mensagens já enviadas não podem ser editadas.',
      );
    }
    await assertContactsInConnection(
      db,
      tx,
      uid,
      message.connectionId,
      contactIds,
    );
    tx.update(ref, {
      contactIds,
      content,
      ...deliveryFields(scheduledAt),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
};

/** Deleting only removes the record; it never triggers a new send. */
export const deleteMessage = async (
  db: Firestore,
  uid: string,
  data: unknown,
): Promise<void> => {
  const payload = asPayload(data);
  const messageId = parseId(payload.messageId, 'messageId');
  const ref = db.collection('messages').doc(messageId);

  await db.runTransaction(async tx => {
    assertOwned(await tx.get(ref), uid, 'Mensagem não encontrada.');
    tx.delete(ref);
  });
};
