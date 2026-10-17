import type { ReactNode } from 'react';
import Alert from '@mui/material/Alert';
import type { RealtimeState } from '../hooks/useRealtime';
import { getErrorMessage } from '../utils/errors';
import ListSkeleton from './ListSkeleton';

type ListStateProps<T> = {
  state: RealtimeState<T[]>;
  empty: ReactNode;
  loading?: ReactNode;
  children: (items: T[]) => ReactNode;
};

const ListState = <T,>({
  state,
  empty,
  loading,
  children,
}: ListStateProps<T>) => {
  if (state.error)
    return <Alert severity="error">{getErrorMessage(state.error)}</Alert>;
  if (state.loading || !state.data) return loading ?? <ListSkeleton />;
  if (state.data.length === 0) return empty;
  return children(state.data);
};

export default ListState;
