import { useContext } from 'react';
import { FeedbackContext, type Notify } from './feedback-context';

export const useFeedback = (): Notify => {
  const notify = useContext(FeedbackContext);
  if (!notify)
    throw new Error('useFeedback must be used inside <FeedbackProvider>.');
  return notify;
};
