import {
  collection,
  orderBy,
  query,
  where,
  type DocumentSnapshot,
  type QueryConstraint,
  type Unsubscribe,
} from 'firebase/firestore';
import type { Message, MessageFilter, MessageInput } from '../types';
import { db } from './firebase';
import {
  callable,
  readDoc,
  subscribeToQuery,
  toDate,
  type OnData,
  type OnError,
} from './firestore-utils';

const toMessage = (snapshot: DocumentSnapshot): Message => {
  const data = readDoc(snapshot);
  return {
    id: snapshot.id,
    ownerId: data.ownerId,
    connectionId: data.connectionId,
    contactIds: Array.isArray(data.contactIds) ? data.contactIds : [],
    content: String(data.content ?? ''),
    // Valor inesperado é tratado como enviada, que é somente leitura.
    status: data.status === 'scheduled' ? 'scheduled' : 'sent',
    scheduledAt: toDate(data.scheduledAt),
    sentAt: toDate(data.sentAt),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
};

export const subscribeToMessages = (
  ownerId: string,
  connectionId: string,
  filter: MessageFilter,
  onData: OnData<Message[]>,
  onError: OnError,
): Unsubscribe => {
  const statusConstraint: QueryConstraint[] =
    filter === 'all' ? [] : [where('status', '==', filter)];
  return subscribeToQuery(
    query(
      collection(db, 'messages'),
      where('ownerId', '==', ownerId),
      where('connectionId', '==', connectionId),
      ...statusConstraint,
      orderBy('createdAt', 'desc'),
    ),
    toMessage,
    onData,
    onError,
  );
};

// Dates travel as epoch millis; `null` means "send now".
const toPayload = ({ contactIds, content, scheduledAt }: MessageInput) => ({
  contactIds,
  content: content.trim(),
  scheduledAt: scheduledAt ? scheduledAt.getTime() : null,
});

type MessagePayload = ReturnType<typeof toPayload>;

const createMessageCall = callable<
  MessagePayload & { connectionId: string },
  { id: string }
>('createMessage');
const updateMessageCall = callable<MessagePayload & { messageId: string }>(
  'updateMessage',
);

export const createMessage = (connectionId: string, input: MessageInput) =>
  createMessageCall({ connectionId, ...toPayload(input) });

/** Only scheduled messages can be edited; the backend enforces it. */
export const updateMessage = (messageId: string, input: MessageInput) =>
  updateMessageCall({ messageId, ...toPayload(input) });

/** Removes only the record; it never triggers a new send. */
export const deleteMessage = callable<{ messageId: string }>('deleteMessage');
