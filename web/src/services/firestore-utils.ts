import {
  Timestamp,
  type DocumentData,
  type DocumentSnapshot,
  type FirestoreError,
  type Query,
  type Unsubscribe,
  onSnapshot,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

export type OnData<T> = (data: T) => void;
export type OnError = (error: FirestoreError) => void;

export const toDate = (value: unknown): Date | null =>
  value instanceof Timestamp ? value.toDate() : null;

// Estima timestamps pendentes para documentos recém-gravados já exibirem a data.
export const readDoc = (snapshot: DocumentSnapshot): DocumentData =>
  snapshot.data({ serverTimestamps: 'estimate' }) ?? {};

export const subscribeToQuery = <T>(
  query: Query,
  mapDoc: (snapshot: DocumentSnapshot) => T,
  onData: OnData<T[]>,
  onError: OnError,
): Unsubscribe =>
  onSnapshot(query, snapshot => onData(snapshot.docs.map(mapDoc)), onError);

export const callable =
  <Request, Response = void>(name: string) =>
  async (data: Request): Promise<Response> => {
    const result = await httpsCallable<Request, Response>(
      functions,
      name,
    )(data);
    return result.data;
  };
