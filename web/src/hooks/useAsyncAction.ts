import { useRef, useState } from 'react';
import { getErrorMessage } from '../utils/errors';

// `run` resolve `true` em caso de sucesso e ignora chamadas enquanto outra está em andamento.
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
