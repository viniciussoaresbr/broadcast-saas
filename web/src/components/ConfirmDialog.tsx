import type { ReactNode } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import { useAsyncAction } from '../hooks/useAsyncAction';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  onConfirm: () => Promise<unknown>;
  /** Runs after a successful confirmation, before the dialog closes. */
  onConfirmed?: () => void;
  onClose: () => void;
};

/** Confirmation for destructive actions; stays open and shows the error on failure. */
const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = 'Excluir',
  onConfirm,
  onConfirmed,
  onClose,
}: ConfirmDialogProps) => {
  const { pending, error, run } = useAsyncAction();

  const confirm = async () => {
    if (pending) return;
    if (await run(onConfirm)) {
      onConfirmed?.();
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={pending ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      aria-describedby="confirm-dialog-description"
    >
      <div className="px-6 pt-6">
        <span
          aria-hidden
          className="grid size-10 place-items-center rounded-xl bg-[var(--mui-palette-error-light)] text-[var(--mui-palette-error-main)]"
        >
          <DeleteOutlineIcon fontSize="small" />
        </span>
      </div>
      <DialogTitle className="pt-4">{title}</DialogTitle>
      <DialogContent className="flex flex-col gap-3">
        <DialogContentText
          id="confirm-dialog-description"
          component="div"
          variant="body2"
        >
          {description}
        </DialogContentText>
        {error && <Alert severity="error">{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose} disabled={pending}>
          Cancelar
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={confirm}
          loading={pending}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
