import { createContext } from 'react';
import type { User } from 'firebase/auth';

export type AuthState = {
  user: User | null;
  /** Verdadeiro até o Firebase restaurar (ou não) a sessão anterior. */
  initializing: boolean;
};

export const AuthContext = createContext<AuthState | null>(null);
