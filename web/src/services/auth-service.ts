import {
  createUserWithEmailAndPassword,
  onIdTokenChanged,
  reload,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth } from './firebase';

export type SignUpInput = { name: string; email: string; password: string };

export const signUp = async ({
  name,
  email,
  password,
}: SignUpInput): Promise<void> => {
  const { user } = await createUserWithEmailAndPassword(
    auth,
    email.trim(),
    password,
  );
  await updateProfile(user, { displayName: name.trim() });
  // updateProfile não notifica os listeners; o reload notifica, e o nome aparece na hora.
  await reload(user);
};

export const signIn = async (
  email: string,
  password: string,
): Promise<void> => {
  await signInWithEmailAndPassword(auth, email.trim(), password);
};

export const signOut = (): Promise<void> => firebaseSignOut(auth);

export const sendPasswordReset = (email: string): Promise<void> =>
  sendPasswordResetEmail(auth, email.trim());

// Diferente do onAuthStateChanged, também dispara quando os dados do usuário são recarregados.
export const subscribeToAuth = (onChange: (user: User | null) => void) =>
  onIdTokenChanged(auth, onChange);
