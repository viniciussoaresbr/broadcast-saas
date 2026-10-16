import { useRef, useState } from 'react';
import { getErrorMessage } from '../utils/errors';

/**
 * Tracks pending/error state of an async action. `run` resolves to true when
 * the action succeeded, so callers can close dialogs or reset forms.
 * Calls made while one is running are ignored (resolve to false), so a double
 * click can't submit twice even before `pending` re-renders the button.
 */
export const useAsyncAction = () => {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const running = useRef(false);

  const run = async (action: () => Promise<unknown>): Promise<boolean> => {
    if (running.current) return false;
    running.current = true;
    setPending(true);
    setError(null);
    try {
      await action();
      return true;
    } catch (err) {
      setError(getErrorMessage(err));
      return false;
    } finally {
      running.current = false;
      setPending(false);
    }
  };

  const reset = () => setError(null);

  return { pending, error, run, reset };
};
