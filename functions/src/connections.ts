import { Firestore, Query } from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/v2/https';
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

/**
 * Deletes a connection together with its contacts and messages.
 * Dependents are removed first and the connection last, so a failure midway
 * leaves the connection visible and the operation can simply be retried.
 */
export const deleteConnection = async (
  db: Firestore,
  uid: string,
  data: unknown,
): Promise<{ deletedContacts: number; deletedMessages: number }> => {
  const { connectionId } = parse(connectionIdSchema, data);
  const ref = db.collection('connections').doc(connectionId);

  const connection = await ref.get();
  if (!connection.exists || connection.get('ownerId') !== uid) {
    throw new HttpsError('not-found', 'Conexão não encontrada.');
  }

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
