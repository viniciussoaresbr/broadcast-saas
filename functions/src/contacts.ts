import { FieldValue, Firestore, Transaction } from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/v2/https';
import { assertOwned, getOwnedConnection } from './lib/ownership';
import { asPayload, parseId, parseName, parsePhone } from './lib/validation';

const assertPhoneAvailable = async (
  db: Firestore,
  tx: Transaction,
  connectionId: string,
  phone: string,
  ignoreContactId?: string,
): Promise<void> => {
  const duplicates = await tx.get(
    db
      .collection('contacts')
      .where('connectionId', '==', connectionId)
      .where('phone', '==', phone),
  );
  const taken = duplicates.docs.some(doc => doc.id !== ignoreContactId);
  if (taken) {
    throw new HttpsError(
      'already-exists',
      'Já existe um contato com este telefone nesta conexão.',
    );
  }
};

export const createContact = async (
  db: Firestore,
  uid: string,
  data: unknown,
): Promise<{ id: string }> => {
  const payload = asPayload(data);
  const connectionId = parseId(payload.connectionId, 'connectionId');
  const name = parseName(payload.name);
  const phone = parsePhone(payload.phone);
  const ref = db.collection('contacts').doc();

  await db.runTransaction(async tx => {
    await getOwnedConnection(db, tx, uid, connectionId);
    await assertPhoneAvailable(db, tx, connectionId, phone);
    tx.create(ref, {
      ownerId: uid,
      connectionId,
      name,
      phone,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });

  return { id: ref.id };
};

export const updateContact = async (
  db: Firestore,
  uid: string,
  data: unknown,
): Promise<void> => {
  const payload = asPayload(data);
  const contactId = parseId(payload.contactId, 'contactId');
  const name = parseName(payload.name);
  const phone = parsePhone(payload.phone);
  const ref = db.collection('contacts').doc(contactId);

  await db.runTransaction(async tx => {
    const contact = assertOwned(
      await tx.get(ref),
      uid,
      'Contato não encontrado.',
    );
    await assertPhoneAvailable(db, tx, contact.connectionId, phone, contactId);
    tx.update(ref, { name, phone, updatedAt: FieldValue.serverTimestamp() });
  });
};

/**
 * Removes the contact from every scheduled message that targets it. A
 * scheduled message left without recipients is deleted. Sent messages are
 * kept untouched as history.
 */
export const deleteContact = async (
  db: Firestore,
  uid: string,
  data: unknown,
): Promise<void> => {
  const payload = asPayload(data);
  const contactId = parseId(payload.contactId, 'contactId');
  const ref = db.collection('contacts').doc(contactId);

  await db.runTransaction(async tx => {
    assertOwned(await tx.get(ref), uid, 'Contato não encontrado.');
    const scheduled = await tx.get(
      db
        .collection('messages')
        .where('contactIds', 'array-contains', contactId)
        .where('status', '==', 'scheduled'),
    );

    scheduled.docs
      .filter(doc => doc.get('ownerId') === uid)
      .forEach(doc => {
        const remaining = (doc.get('contactIds') as string[]).filter(
          id => id !== contactId,
        );
        if (remaining.length === 0) {
          tx.delete(doc.ref);
        } else {
          tx.update(doc.ref, {
            contactIds: remaining,
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
      });

    tx.delete(ref);
  });
};
