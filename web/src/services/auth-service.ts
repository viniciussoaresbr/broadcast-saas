import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { auth } from './firebase'

export type SignUpInput = { name: string; email: string; password: string }

/** Each registered user is a tenant; its UID is the `ownerId` of its data. */
export const signUp = async ({ name, email, password }: SignUpInput): Promise<void> => {
  const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password)
  await updateProfile(user, { displayName: name.trim() })
}

export const signIn = async (email: string, password: string): Promise<void> => {
  await signInWithEmailAndPassword(auth, email.trim(), password)
}

export const signOut = (): Promise<void> => firebaseSignOut(auth)

export const sendPasswordReset = (email: string): Promise<void> =>
  sendPasswordResetEmail(auth, email.trim())

export const subscribeToAuth = (onChange: (user: User | null) => void) =>
  onAuthStateChanged(auth, onChange)
