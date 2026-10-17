import {
  collection,
  limit,
  orderBy,
  query,
  where,
  type DocumentSnapshot,
  type QueryConstraint,
  type Unsubscribe,
} from 'firebase/firestore';
import type {
  Message,
  MessageFilter,
  MessageInput,
  MessagePage,
} from '../types';
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

// Escuta as `pageSize` mais recentes; um documento a mais indica se há outras.
export const subscribeToMessages = (
  ownerId: string,
  connectionId: string,
  filter: MessageFilter,
  pageSize: number,
  onData: OnData<MessagePage>,
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
      limit(pageSize + 1),
    ),
    toMessage,
    messages =>
      onData({
        items: messages.slice(0, pageSize),
        hasMore: messages.length > pageSize,
      }),
    onError,
  );
};

// Datas trafegam como epoch (ms); `null` significa "enviar agora".
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

// Só agendadas podem ser editadas; o backend garante isso.
export const updateMessage = (messageId: string, input: MessageInput) =>
  updateMessageCall({ messageId, ...toPayload(input) });

// Remove apenas o registro; nunca dispara um novo envio.
export const deleteMessage = callable<{ messageId: string }>('deleteMessage');
