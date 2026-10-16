import { deleteApp, initializeApp } from 'firebase-admin/app';
import { Firestore, getFirestore, Timestamp } from 'firebase-admin/firestore';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { deleteConnection } from '../src/connections';
import { createContact, deleteContact, updateContact } from '../src/contacts';
import { createMessage, deleteMessage, updateMessage } from '../src/messages';
import { processDueMessages } from '../src/scheduled-messages';

const PROJECT_ID = 'demo-broadcast';
const ALICE = 'alice';
const BOB = 'bob';
const HOUR = 60 * 60 * 1000;

const app = initializeApp({ projectId: PROJECT_ID }, 'handlers-test');
const db: Firestore = getFirestore(app);

const clearFirestore = () =>
  fetch(
    `http://${process.env.FIRESTORE_EMULATOR_HOST}/emulator/v1/projects/` +
      `${PROJECT_ID}/databases/(default)/documents`,
    { method: 'DELETE' },
  );

const createConnectionDoc = async (ownerId: string) => {
  const ref = await db.collection('connections').add({
    ownerId,
    name: `Conexão de ${ownerId}`,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return ref.id;
};

const getMessage = async (id: string) =>
  (await db.collection('messages').doc(id).get()).data();

beforeEach(async () => {
  await clearFirestore();
});

afterAll(async () => {
  await deleteApp(app);
});

describe('contacts', () => {
  it('creates a contact in an owned connection', async () => {
    const connectionId = await createConnectionDoc(ALICE);
    const { id } = await createContact(db, ALICE, {
      connectionId,
      name: '  Maria  ',
      phone: '+5511912345678',
    });
    const contact = (await db.collection('contacts').doc(id).get()).data();
    expect(contact).toMatchObject({
      ownerId: ALICE,
      connectionId,
      name: 'Maria',
      phone: '+5511912345678',
    });
  });

  it('rejects a connection from another client', async () => {
    const connectionId = await createConnectionDoc(BOB);
    await expect(
      createContact(db, ALICE, {
        connectionId,
        name: 'Maria',
        phone: '+5511912345678',
      }),
    ).rejects.toMatchObject({ code: 'not-found' });
  });

  it('rejects invalid phones', async () => {
    const connectionId = await createConnectionDoc(ALICE);
    await expect(
      createContact(db, ALICE, { connectionId, name: 'X', phone: '1234' }),
    ).rejects.toMatchObject({ code: 'invalid-argument' });
  });

  it('rejects a duplicated phone in the same connection', async () => {
    const connectionId = await createConnectionDoc(ALICE);
    const input = { connectionId, name: 'Maria', phone: '+5511912345678' };
    const { id } = await createContact(db, ALICE, input);
    await expect(createContact(db, ALICE, input)).rejects.toMatchObject({
      code: 'already-exists',
    });
    // Updating a contact keeping its own phone is allowed.
    await expect(
      updateContact(db, ALICE, {
        contactId: id,
        name: 'Maria Silva',
        phone: '+5511912345678',
      }),
    ).resolves.toBeUndefined();
  });

  it('allows the same phone in different connections', async () => {
    const first = await createConnectionDoc(ALICE);
    const second = await createConnectionDoc(ALICE);
    const phone = '+5511912345678';
    await createContact(db, ALICE, { connectionId: first, name: 'A', phone });
    await expect(
      createContact(db, ALICE, { connectionId: second, name: 'A', phone }),
    ).resolves.toHaveProperty('id');
  });

  it("blocks updating or deleting another client's contact", async () => {
    const connectionId = await createConnectionDoc(ALICE);
    const { id } = await createContact(db, ALICE, {
      connectionId,
      name: 'Maria',
      phone: '+5511912345678',
    });
    await expect(
      updateContact(db, BOB, {
        contactId: id,
        name: 'Hack',
        phone: '+5511912345678',
      }),
    ).rejects.toMatchObject({ code: 'not-found' });
    await expect(
      deleteContact(db, BOB, { contactId: id }),
    ).rejects.toMatchObject({ code: 'not-found' });
  });

  it('removes a deleted contact from scheduled messages only', async () => {
    const connectionId = await createConnectionDoc(ALICE);
    const phone = (n: number) => `+55119123456${String(n).padStart(2, '0')}`;
    const { id: a } = await createContact(db, ALICE, {
      connectionId,
      name: 'A',
      phone: phone(1),
    });
    const { id: b } = await createContact(db, ALICE, {
      connectionId,
      name: 'B',
      phone: phone(2),
    });
    const future = Date.now() + HOUR;
    const { id: shared } = await createMessage(db, ALICE, {
      connectionId,
      contactIds: [a, b],
      content: 'Para A e B',
      scheduledAt: future,
    });
    const { id: onlyA } = await createMessage(db, ALICE, {
      connectionId,
      contactIds: [a],
      content: 'Só para A',
      scheduledAt: future,
    });
    const { id: sent } = await createMessage(db, ALICE, {
      connectionId,
      contactIds: [a],
      content: 'Enviada',
      scheduledAt: null,
    });

    await deleteContact(db, ALICE, { contactId: a });

    expect((await getMessage(shared))?.contactIds).toEqual([b]);
    expect(await getMessage(onlyA)).toBeUndefined();
    expect((await getMessage(sent))?.contactIds).toEqual([a]);
  });
});

describe('messages', () => {
  const setup = async () => {
    const connectionId = await createConnectionDoc(ALICE);
    const { id: contactId } = await createContact(db, ALICE, {
      connectionId,
      name: 'Maria',
      phone: '+5511912345678',
    });
    return { connectionId, contactId };
  };

  it('sends immediately', async () => {
    const { connectionId, contactId } = await setup();
    const { id } = await createMessage(db, ALICE, {
      connectionId,
      contactIds: [contactId],
      content: 'Olá',
      scheduledAt: null,
    });
    const message = await getMessage(id);
    expect(message?.status).toBe('sent');
    expect(message?.sentAt).toBeInstanceOf(Timestamp);
    expect(message?.scheduledAt).toBeNull();
  });

  it('schedules for the future and rejects past dates', async () => {
    const { connectionId, contactId } = await setup();
    const { id } = await createMessage(db, ALICE, {
      connectionId,
      contactIds: [contactId],
      content: 'Olá',
      scheduledAt: Date.now() + HOUR,
    });
    const message = await getMessage(id);
    expect(message?.status).toBe('scheduled');
    expect(message?.sentAt).toBeNull();

    await expect(
      createMessage(db, ALICE, {
        connectionId,
        contactIds: [contactId],
        content: 'Olá',
        scheduledAt: Date.now() - 1000,
      }),
    ).rejects.toMatchObject({ code: 'invalid-argument' });
  });

  it('rejects recipients from another connection or client', async () => {
    const { connectionId } = await setup();
    const otherConnection = await createConnectionDoc(ALICE);
    const { id: otherContact } = await createContact(db, ALICE, {
      connectionId: otherConnection,
      name: 'Outro',
      phone: '+5511987654321',
    });
    await expect(
      createMessage(db, ALICE, {
        connectionId,
        contactIds: [otherContact],
        content: 'Olá',
        scheduledAt: null,
      }),
    ).rejects.toMatchObject({ code: 'invalid-argument' });

    const bobConnection = await createConnectionDoc(BOB);
    await expect(
      createMessage(db, BOB, {
        connectionId: bobConnection,
        contactIds: [otherContact],
        content: 'Olá',
        scheduledAt: null,
      }),
    ).rejects.toMatchObject({ code: 'invalid-argument' });
  });

  it('edits scheduled messages and can turn them into sent', async () => {
    const { connectionId, contactId } = await setup();
    const { id } = await createMessage(db, ALICE, {
      connectionId,
      contactIds: [contactId],
      content: 'Olá',
      scheduledAt: Date.now() + HOUR,
    });
    await updateMessage(db, ALICE, {
      messageId: id,
      contactIds: [contactId],
      content: 'Editada',
      scheduledAt: null,
    });
    const message = await getMessage(id);
    expect(message).toMatchObject({ content: 'Editada', status: 'sent' });

    await expect(
      updateMessage(db, ALICE, {
        messageId: id,
        contactIds: [contactId],
        content: 'De novo',
        scheduledAt: null,
      }),
    ).rejects.toMatchObject({ code: 'failed-precondition' });
  });

  it('blocks another client from editing or deleting', async () => {
    const { connectionId, contactId } = await setup();
    const { id } = await createMessage(db, ALICE, {
      connectionId,
      contactIds: [contactId],
      content: 'Olá',
      scheduledAt: Date.now() + HOUR,
    });
    await expect(
      updateMessage(db, BOB, {
        messageId: id,
        contactIds: [contactId],
        content: 'Hack',
        scheduledAt: null,
      }),
    ).rejects.toMatchObject({ code: 'not-found' });
    await expect(
      deleteMessage(db, BOB, { messageId: id }),
    ).rejects.toMatchObject({ code: 'not-found' });
    await deleteMessage(db, ALICE, { messageId: id });
    expect(await getMessage(id)).toBeUndefined();
  });
});

describe('deleteConnection', () => {
  it('deletes the connection with its contacts and messages', async () => {
    const connectionId = await createConnectionDoc(ALICE);
    const keptConnection = await createConnectionDoc(ALICE);
    const { id: contactId } = await createContact(db, ALICE, {
      connectionId,
      name: 'Maria',
      phone: '+5511912345678',
    });
    await createContact(db, ALICE, {
      connectionId: keptConnection,
      name: 'Maria',
      phone: '+5511912345678',
    });
    await createMessage(db, ALICE, {
      connectionId,
      contactIds: [contactId],
      content: 'Olá',
      scheduledAt: null,
    });

    await expect(
      deleteConnection(db, BOB, { connectionId }),
    ).rejects.toMatchObject({ code: 'not-found' });

    const result = await deleteConnection(db, ALICE, { connectionId });
    expect(result).toEqual({ deletedContacts: 1, deletedMessages: 1 });
    expect(
      (await db.collection('connections').doc(connectionId).get()).exists,
    ).toBe(false);
    const remaining = await db
      .collection('contacts')
      .where('connectionId', '==', keptConnection)
      .get();
    expect(remaining.size).toBe(1);
  });
});

describe('processDueMessages', () => {
  const insertScheduled = (scheduledAt: number) =>
    db.collection('messages').add({
      ownerId: ALICE,
      connectionId: 'conn',
      contactIds: ['contact'],
      content: 'Olá',
      status: 'scheduled',
      scheduledAt: Timestamp.fromMillis(scheduledAt),
      sentAt: null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

  it('marks only due messages as sent', async () => {
    const due = await insertScheduled(Date.now() - 1000);
    const future = await insertScheduled(Date.now() + HOUR);

    const result = await processDueMessages(db);

    expect(result).toEqual({ sent: 1, skipped: 0, failed: 0 });
    const dueData = (await due.get()).data();
    expect(dueData?.status).toBe('sent');
    expect(dueData?.sentAt).toBeInstanceOf(Timestamp);
    expect((await future.get()).get('status')).toBe('scheduled');
  });

  it('is safe for repeated and concurrent runs', async () => {
    const due = await insertScheduled(Date.now() - 1000);

    const results = await Promise.all([
      processDueMessages(db),
      processDueMessages(db),
    ]);
    const totalSent = results.reduce((sum, r) => sum + r.sent, 0);
    expect(totalSent).toBe(1);
    const firstSentAt = (await due.get()).get('sentAt') as Timestamp;

    expect(await processDueMessages(db)).toEqual({
      sent: 0,
      skipped: 0,
      failed: 0,
    });
    const sentAt = (await due.get()).get('sentAt') as Timestamp;
    expect(sentAt.isEqual(firstSentAt)).toBe(true);
  });

  it('ignores messages deleted before processing', async () => {
    const due = await insertScheduled(Date.now() - 1000);
    await due.delete();
    expect(await processDueMessages(db)).toEqual({
      sent: 0,
      skipped: 0,
      failed: 0,
    });
  });
});
