import { useEffect, useState, type ReactNode } from 'react';
import { AuthContext, type AuthState } from '../hooks/auth-context';
import { subscribeToAuth } from '../services/auth-service';

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    initializing: true,
  });

  useEffect(
    () => subscribeToAuth(user => setState({ user, initializing: false })),
    [],
  );

  return <AuthContext value={state}>{children}</AuthContext>;
};

export default AuthProvider;
