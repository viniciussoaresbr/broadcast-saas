import { createContext } from 'react';

export type Notify = (message: string) => void;

export const FeedbackContext = createContext<Notify | null>(null);
