import { useEffect, useEffectEvent, useState } from 'react';
import type { FirestoreError, Unsubscribe } from 'firebase/firestore';
import type { OnData, OnError } from '../services/firestore-utils';

export type RealtimeState<T> = {
  data: T | undefined;
  error: FirestoreError | null;
  loading: boolean;
  /** Verdadeiro enquanto exibe dados da chave anterior do mesmo escopo. */
  updating: boolean;
};

type Snapshot<T> = {
  key: string;
  scope: string;
  data?: T;
  error?: FirestoreError;
};

// Um listener por `key` (`null` não escuta). Dados da chave anterior só ficam
// na tela se o `scope` for o mesmo, por exemplo quando só a página cresceu.
export const useRealtime = <T>(
  key: string | null,
  subscribe: (onData: OnData<T>, onError: OnError) => Unsubscribe,
  scope: string | null = key,
): RealtimeState<T> => {
  const [snapshot, setSnapshot] = useState<Snapshot<T> | null>(null);
  const startSubscription = useEffectEvent((currentKey: string) => {
    const currentScope = scope ?? currentKey;
    return subscribe(
      data => setSnapshot({ key: currentKey, scope: currentScope, data }),
      error => setSnapshot({ key: currentKey, scope: currentScope, error }),
    );
  });

  useEffect(() => {
    if (key === null) return undefined;
    return startSubscription(key);
  }, [key]);

  const current = snapshot?.key === key ? snapshot : null;
  const previous =
    !current && key !== null && snapshot?.scope === scope && snapshot.data
      ? snapshot
      : null;
  return {
    data: (current ?? previous)?.data,
    error: current?.error ?? null,
    loading: key !== null && current === null && previous === null,
    updating: previous !== null,
  };
};
