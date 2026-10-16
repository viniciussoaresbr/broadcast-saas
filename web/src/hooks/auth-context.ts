import { createContext } from 'react'
import type { User } from 'firebase/auth'

export type AuthState = {
  user: User | null
  /** True until Firebase restores (or not) the previous session. */
  initializing: boolean
}

export const AuthContext = createContext<AuthState | null>(null)
