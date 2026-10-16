import type { ReactNode } from 'react'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import type { RealtimeState } from '../hooks/useRealtime'
import { getErrorMessage } from '../utils/errors'

type ListStateProps<T> = {
  state: RealtimeState<T[]>
  empty: ReactNode
  children: (items: T[]) => ReactNode
}

/** Shared loading / error / empty handling for realtime lists. */
const ListState = <T,>({ state, empty, children }: ListStateProps<T>) => {
  if (state.error) return <Alert severity="error">{getErrorMessage(state.error)}</Alert>
  if (state.loading || !state.data) {
    return (
      <div className="flex justify-center py-10" role="status">
        <CircularProgress aria-label="Carregando" />
      </div>
    )
  }
  if (state.data.length === 0) return empty
  return children(state.data)
}

export default ListState
