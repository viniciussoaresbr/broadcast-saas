import {
  collection,
  orderBy,
  query,
  where,
  type DocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import type { Contact } from '../types';
import { db } from './firebase';
import {
  callable,
  readDoc,
  subscribeToQuery,
  toDate,
  type OnData,
  type OnError,
} from './firestore-utils';

const toContact = (snapshot: DocumentSnapshot): Contact => {
  const data = readDoc(snapshot);
  return {
    id: snapshot.id,
    ownerId: data.ownerId,
    connectionId: data.connectionId,
    name: data.name,
    phone: data.phone,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
};

export const subscribeToContacts = (
  ownerId: string,
  connectionId: string,
  onData: OnData<Contact[]>,
  onError: OnError,
): Unsubscribe =>
  subscribeToQuery(
    query(
      collection(db, 'contacts'),
      where('ownerId', '==', ownerId),
      where('connectionId', '==', connectionId),
      orderBy('name'),
    ),
    toContact,
    onData,
    onError,
  );

// Writes go through Cloud Functions, which validate ownership and keep the
// phone unique per connection.
export const createContact = callable<
  { connectionId: string; name: string; phone: string },
  { id: string }
>('createContact');

export const updateContact = callable<{
  contactId: string;
  name: string;
  phone: string;
}>('updateContact');

/** Also removes the contact from scheduled messages (sent ones are kept). */
export const deleteContact = callable<{ contactId: string }>('deleteContact');
