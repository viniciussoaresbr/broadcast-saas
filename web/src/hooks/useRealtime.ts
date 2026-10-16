import { useEffect, useEffectEvent, useState } from 'react';
import type { FirestoreError, Unsubscribe } from 'firebase/firestore';
import type { OnData, OnError } from '../services/firestore-utils';

export type RealtimeState<T> = {
  data: T | undefined;
  error: FirestoreError | null;
  loading: boolean;
};

type Snapshot<T> = { key: string; data?: T; error?: FirestoreError };

/**
 * Keeps a Firestore listener open while `key` stays the same and closes it on
 * unmount or when `key` changes. Pass `null` to skip subscribing.
 * Results are tagged with the key they belong to, so stale data from a
 * previous key is never shown while the new listener loads.
 */
export const useRealtime = <T>(
  key: string | null,
  subscribe: (onData: OnData<T>, onError: OnError) => Unsubscribe,
): RealtimeState<T> => {
  const [snapshot, setSnapshot] = useState<Snapshot<T> | null>(null);
  const startSubscription = useEffectEvent((currentKey: string) =>
    subscribe(
      data => setSnapshot({ key: currentKey, data }),
      error => setSnapshot({ key: currentKey, error }),
    ),
  );

  useEffect(() => {
    if (key === null) return undefined;
    return startSubscription(key);
  }, [key]);

  const current = snapshot?.key === key ? snapshot : null;
  return {
    data: current?.data,
    error: current?.error ?? null,
    loading: key !== null && current === null,
  };
};
