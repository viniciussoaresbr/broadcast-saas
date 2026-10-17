import type { Connection, Contact, MessageFilter, MessagePage } from '../types';
import {
  subscribeToConnection,
  subscribeToConnections,
} from '../services/connection-service';
import { subscribeToContacts } from '../services/contact-service';
import { subscribeToMessages } from '../services/message-service';
import { useCurrentUser } from './useAuth';
import { useRealtime } from './useRealtime';

// Toda consulta é filtrada pelo UID; as regras rejeitam as que não forem.

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

// Aumentar `pageSize` mantém a página atual na tela enquanto carrega mais.
export const useMessages = (
  connectionId: string,
  filter: MessageFilter,
  pageSize: number,
) => {
  const { uid } = useCurrentUser();
  const scope = `${uid}/${connectionId}/${filter}`;
  return useRealtime<MessagePage>(
    `${scope}/${pageSize}`,
    (onData, onError) =>
      subscribeToMessages(uid, connectionId, filter, pageSize, onData, onError),
    scope,
  );
};
