import type { ReactNode } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { useAsyncAction } from '../hooks/useAsyncAction'

type ConfirmDialogProps = {
  open: boolean
  title: string
  description: ReactNode
  confirmLabel?: string
  onConfirm: () => Promise<unknown>
  onClose: () => void
}

/** Confirmation for destructive actions; stays open and shows the error on failure. */
const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = 'Excluir',
  onConfirm,
  onClose,
}: ConfirmDialogProps) => {
  const { pending, error, run } = useAsyncAction()

  const confirm = async () => {
    if (await run(onConfirm)) onClose()
  }

  return (
    <Dialog open={open} onClose={pending ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent className="flex flex-col gap-3">
        <DialogContentText component="div">{description}</DialogContentText>
        {error && <Alert severity="error">{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={pending}>
          Cancelar
        </Button>
        <Button color="error" variant="contained" onClick={confirm} loading={pending}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmDialog
