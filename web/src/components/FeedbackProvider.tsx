import { useState, type ReactNode } from 'react';
import Snackbar from '@mui/material/Snackbar';
import { FeedbackContext } from '../hooks/feedback-context';

type Toast = { key: number; message: string };

/** One snackbar for the whole app; a new message replaces the current one. */
const FeedbackProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<Toast | null>(null);
  const notify = (message: string) => setToast({ key: Date.now(), message });

  return (
    <FeedbackContext value={notify}>
      {children}
      <Snackbar
        key={toast?.key}
        open={toast !== null}
        autoHideDuration={4000}
        onClose={(_, reason) => reason !== 'clickaway' && setToast(null)}
        message={toast?.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </FeedbackContext>
  );
};

export default FeedbackProvider;
