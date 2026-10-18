import { useEffect, useState, type ReactNode } from 'react';
import { AuthContext, type AuthState } from '../hooks/auth-context';
import { subscribeToAuth } from '../services/auth-service';

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    initializing: true,
    signedOut: false,
  });

  useEffect(
    () =>
      subscribeToAuth(user =>
        setState(previous => ({
          user,
          initializing: false,
          signedOut:
            user === null && (previous.user !== null || previous.signedOut),
        })),
      ),
    [],
  );

  return <AuthContext value={state}>{children}</AuthContext>;
};

export default AuthProvider;
