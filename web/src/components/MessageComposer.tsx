import type { FormEvent } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import ScheduleSendIcon from '@mui/icons-material/ScheduleSend'
import SendIcon from '@mui/icons-material/Send'
import { useAsyncAction } from '../hooks/useAsyncAction'
import { useMessageForm } from '../hooks/useMessageForm'
import { createMessage } from '../services/message-service'
import type { Contact } from '../types'
import MessageFields from './MessageFields'

type MessageComposerProps = {
  connectionId: string
  contacts: Contact[]
  onCreated: (scheduled: boolean) => void
}

const MessageComposer = ({ connectionId, contacts, onCreated }: MessageComposerProps) => {
  const form = useMessageForm(contacts.map((contact) => contact.id))
  const { pending, error, run } = useAsyncAction()
  const isScheduling = form.values.mode === 'schedule'

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const input = form.submit()
    if (!input) return
    if (await run(() => createMessage(connectionId, input))) {
      form.reset()
      onCreated(input.scheduledAt !== null)
    }
  }

  return (
    <Paper variant="outlined" className="p-4 sm:p-6">
      <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        <Typography variant="h6" component="h2">
          Nova mensagem
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <MessageFields
          contacts={contacts}
          values={form.values}
          errors={form.errors}
          onChange={form.change}
          disabled={pending}
        />
        <Button
          type="submit"
          variant="contained"
          size="large"
          loading={pending}
          startIcon={isScheduling ? <ScheduleSendIcon /> : <SendIcon />}
          className="self-end"
        >
          {isScheduling ? 'Agendar' : 'Enviar agora'}
        </Button>
      </form>
    </Paper>
  )
}

export default MessageComposer
