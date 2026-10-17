import { Firestore, Query } from 'firebase-admin/firestore';
import { assertOwned } from './lib/ownership';
import { connectionIdSchema, parse } from './lib/validation';

const BATCH_SIZE = 400;

const deleteQueryInBatches = async (
  db: Firestore,
  query: Query,
): Promise<number> => {
  const snapshot = await query.limit(BATCH_SIZE).get();
  if (snapshot.empty) return 0;

  const batch = db.batch();
  snapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();

  return snapshot.size + (await deleteQueryInBatches(db, query));
};

// Marca a conexão como `deleting` antes de remover os dependentes, para que
// nada novo seja vinculado a ela;
export const deleteConnection = async (
  db: Firestore,
  uid: string,
  data: unknown,
): Promise<{ deletedContacts: number; deletedMessages: number }> => {
  const { connectionId } = parse(connectionIdSchema, data);
  const ref = db.collection('connections').doc(connectionId);

  await db.runTransaction(async tx => {
    assertOwned(await tx.get(ref), uid, 'Conexão não encontrada.');
    tx.update(ref, { deleting: true });
  });

  const byConnection = (collection: string) =>
    db
      .collection(collection)
      .where('ownerId', '==', uid)
      .where('connectionId', '==', connectionId);

  const deletedMessages = await deleteQueryInBatches(
    db,
    byConnection('messages'),
  );
  const deletedContacts = await deleteQueryInBatches(
    db,
    byConnection('contacts'),
  );
  await ref.delete();

  return { deletedContacts, deletedMessages };
};
