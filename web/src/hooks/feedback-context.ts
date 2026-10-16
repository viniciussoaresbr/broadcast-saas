import { createContext } from 'react';

/** Shows a short confirmation after an action, e.g. "Contato adicionado." */
export type Notify = (message: string) => void;

export const FeedbackContext = createContext<Notify | null>(null);
