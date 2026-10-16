import type { FormEvent, ReactNode } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'

type FormDialogProps = {
  open: boolean
  title: string
  submitLabel: string
  pending: boolean
  error: string | null
  onSubmit: () => void
  onClose: () => void
  children: ReactNode
}

/** Dialog shell for small create/edit forms. */
const FormDialog = ({
  open,
  title,
  submitLabel,
  pending,
  error,
  onSubmit,
  onClose,
  children,
}: FormDialogProps) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <Dialog
      open={open}
      onClose={pending ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <div className="flex flex-col gap-4 pt-2">
            {error && <Alert severity="error">{error}</Alert>}
            {children}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" loading={pending}>
            {submitLabel}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default FormDialog
