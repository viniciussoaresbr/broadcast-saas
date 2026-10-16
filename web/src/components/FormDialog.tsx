import type { FormEvent, ReactNode } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { Theme } from '@mui/material/styles';

type FormDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  submitLabel: string;
  pending: boolean;
  error: string | null;
  onSubmit: () => void;
  onClose: () => void;
  /** Larger forms: wider dialog that becomes full screen on phones. */
  wide?: boolean;
  children: ReactNode;
};

/** Dialog shell for create/edit forms. Ignores submits and dismissals while saving. */
const FormDialog = ({
  open,
  title,
  description,
  submitLabel,
  pending,
  error,
  onSubmit,
  onClose,
  wide = false,
  children,
}: FormDialogProps) => {
  const isPhone = useMediaQuery(
    (theme: Theme) => theme.breakpoints.down('sm'),
    { noSsr: true },
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!pending) onSubmit();
  };

  return (
    <Dialog
      open={open}
      onClose={pending ? undefined : onClose}
      maxWidth={wide ? 'sm' : 'xs'}
      fullScreen={wide && isPhone}
      fullWidth
      aria-describedby={description ? 'form-dialog-description' : undefined}
    >
      <form onSubmit={handleSubmit} noValidate className="flex h-full flex-col">
        <DialogTitle>{title}</DialogTitle>
        <DialogContent className="flex-1">
          {description && (
            <Typography
              id="form-dialog-description"
              variant="body2"
              color="text.secondary"
              className="mb-4"
            >
              {description}
            </Typography>
          )}
          <div className="flex flex-col gap-4 pt-2">
            {error && <Alert severity="error">{error}</Alert>}
            {children}
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            variant="text"
            color="inherit"
            onClick={onClose}
            disabled={pending}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="contained" loading={pending}>
            {submitLabel}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default FormDialog;
