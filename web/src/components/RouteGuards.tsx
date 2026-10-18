import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import FullPageLoader from './FullPageLoader';

type FromState = { from?: string } | null;

/** Sinaliza à tela de conexões que ela deve abrir a primeira conexão da conta. */
export type LandingState = { openFirstConnection?: boolean } | null;

export const ProtectedRoute = () => {
  const { user, initializing, signedOut } = useAuth();
  const location = useLocation();

  if (initializing) return <FullPageLoader />;
  if (!user)
    return (
      <Navigate
        to="/login"
        replace
        state={signedOut ? null : { from: location.pathname }}
      />
    );
  return <Outlet />;
};

export const PublicOnlyRoute = () => {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <FullPageLoader />;
  if (user) {
    const from = (location.state as FromState)?.from;
    if (from) return <Navigate to={from} replace />;
    const landing: LandingState = { openFirstConnection: true };
    return <Navigate to="/connections" replace state={landing} />;
  }
  return <Outlet />;
};
