import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import FullPageLoader from './FullPageLoader'

type FromState = { from?: string } | null

/** Renders child routes only for signed-in users. */
export const ProtectedRoute = () => {
  const { user, initializing } = useAuth()
  const location = useLocation()

  if (initializing) return <FullPageLoader />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}

/** Login/register screens: signed-in users go back to where they came from. */
export const PublicOnlyRoute = () => {
  const { user, initializing } = useAuth()
  const location = useLocation()

  if (initializing) return <FullPageLoader />
  if (user) {
    const from = (location.state as FromState)?.from ?? '/connections'
    return <Navigate to={from} replace />
  }
  return <Outlet />
}
