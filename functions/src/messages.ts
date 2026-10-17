import { FieldValue, Firestore, Timestamp } from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/v2/https';
import {
  assertContactsInConnection,
  assertOwned,
  getOwnedConnection,
} from './lib/ownership';
import {
  createMessageSchema,
  messageIdSchema,
  parse,
  updateMessageSchema,
} from './lib/validation';

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
  const { connectionId, contactIds, content, scheduledAt } = parse(
    createMessageSchema(now),
    data,
  );
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

// Só agendadas podem ser editadas; `scheduledAt: null` envia na hora.
export const updateMessage = async (
  db: Firestore,
  uid: string,
  data: unknown,
  now = Date.now(),
): Promise<void> => {
  const { messageId, contactIds, content, scheduledAt } = parse(
    updateMessageSchema(now),
    data,
  );
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

// Excluir só remove o registro; nunca dispara um novo envio.
export const deleteMessage = async (
  db: Firestore,
  uid: string,
  data: unknown,
): Promise<void> => {
  const { messageId } = parse(messageIdSchema, data);
  const ref = db.collection('messages').doc(messageId);

  await db.runTransaction(async tx => {
    assertOwned(await tx.get(ref), uid, 'Mensagem não encontrada.');
    tx.delete(ref);
  });
};
