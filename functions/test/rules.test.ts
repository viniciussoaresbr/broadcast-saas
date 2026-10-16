import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

const ALICE = 'alice';
const BOB = 'bob';

let env: RulesTestEnvironment;

const asUser = (uid: string) => env.authenticatedContext(uid).firestore();

const seed = async () =>
  env.withSecurityRulesDisabled(async context => {
    const db = context.firestore();
    const now = new Date();
    await setDoc(doc(db, 'connections/alice-conn'), {
      ownerId: ALICE,
      name: 'Alice',
      createdAt: now,
      updatedAt: now,
    });
    await setDoc(doc(db, 'contacts/alice-contact'), {
      ownerId: ALICE,
      connectionId: 'alice-conn',
      name: 'Contato',
      phone: '+5511912345678',
      createdAt: now,
      updatedAt: now,
    });
    await setDoc(doc(db, 'messages/alice-message'), {
      ownerId: ALICE,
      connectionId: 'alice-conn',
      contactIds: ['alice-contact'],
      content: 'Olá',
      status: 'sent',
      scheduledAt: null,
      sentAt: now,
      createdAt: now,
      updatedAt: now,
    });
  });

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-broadcast',
    firestore: {
      rules: readFileSync(resolve(__dirname, '../../firestore.rules'), 'utf8'),
    },
  });
});

beforeEach(async () => {
  await env.clearFirestore();
  await seed();
});

afterAll(async () => {
  await env.cleanup();
});

describe('connections', () => {
  const validConnection = (ownerId: string) => ({
    ownerId,
    name: 'Minha conexão',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  it('lets the owner create, read and rename a connection', async () => {
    const db = asUser(ALICE);
    const ref = await assertSucceeds(
      addDoc(collection(db, 'connections'), validConnection(ALICE)),
    );
    await assertSucceeds(getDoc(ref));
    await assertSucceeds(
      updateDoc(ref, { name: 'Novo nome', updatedAt: serverTimestamp() }),
    );
  });

  it('rejects creating a connection for another owner', async () => {
    await assertFails(
      addDoc(collection(asUser(ALICE), 'connections'), validConnection(BOB)),
    );
  });

  it('rejects unauthenticated access', async () => {
    const db = env.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, 'connections/alice-conn')));
    await assertFails(
      addDoc(collection(db, 'connections'), validConnection(ALICE)),
    );
  });

  it('rejects invalid names and extra fields', async () => {
    const db = asUser(ALICE);
    await assertFails(
      addDoc(collection(db, 'connections'), {
        ...validConnection(ALICE),
        name: '   ',
      }),
    );
    await assertFails(
      addDoc(collection(db, 'connections'), {
        ...validConnection(ALICE),
        name: 'x'.repeat(61),
      }),
    );
    await assertFails(
      addDoc(collection(db, 'connections'), {
        ...validConnection(ALICE),
        extra: true,
      }),
    );
  });

  it('rejects changing the owner of a connection', async () => {
    await assertFails(
      updateDoc(doc(asUser(ALICE), 'connections/alice-conn'), {
        ownerId: BOB,
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it('does not allow deleting from the client', async () => {
    await assertFails(deleteDoc(doc(asUser(ALICE), 'connections/alice-conn')));
  });

  it('blocks another client from reading or changing it', async () => {
    const db = asUser(BOB);
    await assertFails(getDoc(doc(db, 'connections/alice-conn')));
    await assertFails(
      updateDoc(doc(db, 'connections/alice-conn'), {
        name: 'Hack',
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it('only allows listing with the owner filter', async () => {
    await assertSucceeds(
      getDocs(
        query(
          collection(asUser(ALICE), 'connections'),
          where('ownerId', '==', ALICE),
        ),
      ),
    );
    await assertFails(getDocs(collection(asUser(BOB), 'connections')));
    await assertFails(
      getDocs(
        query(
          collection(asUser(BOB), 'connections'),
          where('ownerId', '==', ALICE),
        ),
      ),
    );
  });
});

describe.each(['contacts', 'messages'])('%s', name => {
  const id = name === 'contacts' ? 'alice-contact' : 'alice-message';

  it('lets the owner read', async () => {
    await assertSucceeds(getDoc(doc(asUser(ALICE), name, id)));
  });

  it('blocks another client from reading', async () => {
    await assertFails(getDoc(doc(asUser(BOB), name, id)));
    await assertFails(
      getDocs(
        query(collection(asUser(BOB), name), where('ownerId', '==', ALICE)),
      ),
    );
  });

  it('blocks direct writes, even by the owner', async () => {
    const db = asUser(ALICE);
    await assertFails(addDoc(collection(db, name), { ownerId: ALICE }));
    await assertFails(updateDoc(doc(db, name, id), { ownerId: ALICE }));
    await assertFails(deleteDoc(doc(db, name, id)));
  });
});
