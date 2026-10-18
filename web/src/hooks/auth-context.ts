import { createContext } from 'react';
import type { User } from 'firebase/auth';

export type AuthState = {
  user: User | null;
  /** Verdadeiro até o Firebase restaurar (ou não) a sessão anterior. */
  initializing: boolean;
  /** Verdadeiro quando a sessão ativa terminou (logout), e não por falta de login. */
  signedOut: boolean;
};

export const AuthContext = createContext<AuthState | null>(null);
