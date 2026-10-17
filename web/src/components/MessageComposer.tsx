import type { SubmitEvent } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ScheduleSendIcon from '@mui/icons-material/ScheduleSend';
import SendIcon from '@mui/icons-material/Send';
import { useAsyncAction } from '../hooks/useAsyncAction';
import type { MessageForm } from '../hooks/useMessageForm';
import { createMessage } from '../services/message-service';
import type { Contact } from '../types';
import MessageFields from './MessageFields';

type MessageComposerProps = {
  connectionId: string;
  contacts: Contact[];
  /** Fica na página para o rascunho sobreviver à troca de layout. */
  form: MessageForm;
  onCreated: (scheduled: boolean) => void;
  onCancel?: () => void;
  titleId?: string;
};

const MessageComposer = ({
  connectionId,
  contacts,
  form,
  onCreated,
  onCancel,
  titleId = 'composer-title',
}: MessageComposerProps) => {
  const { pending, error, run } = useAsyncAction();
  const isScheduling = form.values.mode === 'schedule';

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    const input = form.submit();
    if (!input) return;
    if (await run(() => createMessage(connectionId, input))) {
      form.reset();
      onCreated(input.scheduledAt !== null);
    }
  };

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby={titleId}
    >
      <div>
        <Typography id={titleId} variant="h2">
          Nova mensagem
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Envio simulado: nenhuma mensagem real é disparada.
        </Typography>
      </div>
      {error && <Alert severity="error">{error}</Alert>}
      <MessageFields
        contacts={contacts}
        values={form.values}
        errors={form.errors}
        onChange={form.change}
        disabled={pending}
        idPrefix={`${titleId}-fields`}
      />
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button
            variant="text"
            color="inherit"
            size="large"
            onClick={onCancel}
            disabled={pending}
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          variant="contained"
          size="large"
          loading={pending}
          loadingPosition="start"
          startIcon={isScheduling ? <ScheduleSendIcon /> : <SendIcon />}
          fullWidth={!onCancel}
        >
          {isScheduling ? 'Agendar mensagem' : 'Enviar agora'}
        </Button>
      </div>
    </form>
  );
};

export default MessageComposer;
