import { useOutletContext } from 'react-router-dom';
import type { Connection, Contact } from '../types';
import type { RealtimeState } from './useRealtime';

/** Shared by the tabs rendered inside <ConnectionPage>. */
export type ConnectionContext = {
  connection: Connection;
  contacts: RealtimeState<Contact[]>;
};

export const useConnectionContext = () => useOutletContext<ConnectionContext>();
