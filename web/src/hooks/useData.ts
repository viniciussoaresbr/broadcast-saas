import type { Connection, Contact, Message, MessageFilter } from '../types';
import {
  subscribeToConnection,
  subscribeToConnections,
} from '../services/connection-service';
import { subscribeToContacts } from '../services/contact-service';
import { subscribeToMessages } from '../services/message-service';
import { useCurrentUser } from './useAuth';
import { useRealtime } from './useRealtime';

// Every query is scoped by the signed-in user's UID; the security rules
// reject any query that is not.

export const useConnections = () => {
  const { uid } = useCurrentUser();
  return useRealtime<Connection[]>(uid, (onData, onError) =>
    subscribeToConnections(uid, onData, onError),
  );
};

export const useConnection = (connectionId: string) =>
  useRealtime<Connection | null>(connectionId, (onData, onError) =>
    subscribeToConnection(connectionId, onData, onError),
  );

export const useContacts = (connectionId: string) => {
  const { uid } = useCurrentUser();
  return useRealtime<Contact[]>(`${uid}/${connectionId}`, (onData, onError) =>
    subscribeToContacts(uid, connectionId, onData, onError),
  );
};

export const useMessages = (connectionId: string, filter: MessageFilter) => {
  const { uid } = useCurrentUser();
  return useRealtime<Message[]>(
    `${uid}/${connectionId}/${filter}`,
    (onData, onError) =>
      subscribeToMessages(uid, connectionId, filter, onData, onError),
  );
};
