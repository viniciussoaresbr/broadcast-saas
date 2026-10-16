import { useState } from 'react'
import { getErrorMessage } from '../utils/errors'

/**
 * Tracks pending/error state of an async action. `run` resolves to true when
 * the action succeeded, so callers can close dialogs or reset forms.
 */
export const useAsyncAction = () => {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = async (action: () => Promise<unknown>): Promise<boolean> => {
    setPending(true)
    setError(null)
    try {
      await action()
      return true
    } catch (err) {
      setError(getErrorMessage(err))
      return false
    } finally {
      setPending(false)
    }
  }

  const reset = () => setError(null)

  return { pending, error, run, reset }
}
