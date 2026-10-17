import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import type { Connection } from '../types';
import { db } from './firebase';
import {
  callable,
  readDoc,
  subscribeToQuery,
  toDate,
  type OnData,
  type OnError,
} from './firestore-utils';

const connectionsRef = collection(db, 'connections');

const toConnection = (snapshot: DocumentSnapshot): Connection => {
  const data = readDoc(snapshot);
  return {
    id: snapshot.id,
    ownerId: data.ownerId,
    name: data.name,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
};

export const subscribeToConnections = (
  ownerId: string,
  onData: OnData<Connection[]>,
  onError: OnError,
): Unsubscribe =>
  subscribeToQuery(
    query(
      connectionsRef,
      where('ownerId', '==', ownerId),
      orderBy('createdAt', 'desc'),
    ),
    toConnection,
    onData,
    onError,
  );

// Emite `null` se a conexão não existir; a de outro cliente gera erro de permissão.
export const subscribeToConnection = (
  connectionId: string,
  onData: OnData<Connection | null>,
  onError: OnError,
): Unsubscribe =>
  onSnapshot(
    doc(connectionsRef, connectionId),
    snapshot => onData(snapshot.exists() ? toConnection(snapshot) : null),
    onError,
  );

export const createConnection = async (
  ownerId: string,
  name: string,
): Promise<string> => {
  const created = await addDoc(connectionsRef, {
    ownerId,
    name: name.trim(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return created.id;
};

export const renameConnection = (
  connectionId: string,
  name: string,
): Promise<void> =>
  updateDoc(doc(connectionsRef, connectionId), {
    name: name.trim(),
    updatedAt: serverTimestamp(),
  });

// Roda no backend: remove a conexão com seus contatos e mensagens.
export const deleteConnection = callable<
  { connectionId: string },
  { deletedContacts: number; deletedMessages: number }
>('deleteConnection');
