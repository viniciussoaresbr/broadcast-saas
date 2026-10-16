import { useContext } from 'react'
import type { User } from 'firebase/auth'
import { AuthContext, type AuthState } from './auth-context'

export const useAuth = (): AuthState => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>.')
  return context
}

/** For screens behind <ProtectedRoute>, where a user is guaranteed. */
export const useCurrentUser = (): User => {
  const { user } = useAuth()
  if (!user) throw new Error('useCurrentUser must be used inside a protected route.')
  return user
}
