import { useAsyncAction } from '../hooks/useAsyncAction'
import { useMessageForm, valuesFromMessage } from '../hooks/useMessageForm'
import { updateMessage } from '../services/message-service'
import type { Contact, Message } from '../types'
import FormDialog from './FormDialog'
import MessageFields from './MessageFields'

type EditMessageDialogProps = {
  message: Message
  contacts: Contact[]
  onClose: () => void
}

/** Only scheduled messages are editable; they can be rescheduled or sent now. */
const EditMessageDialog = ({ message, contacts, onClose }: EditMessageDialogProps) => {
  const form = useMessageForm(
    contacts.map((contact) => contact.id),
    valuesFromMessage(message),
  )
  const { pending, error, run } = useAsyncAction()

  const submit = async () => {
    const input = form.submit()
    if (!input) return
    if (await run(() => updateMessage(message.id, input))) onClose()
  }

  return (
    <FormDialog
      open
      title="Editar mensagem agendada"
      submitLabel={form.values.mode === 'schedule' ? 'Salvar' : 'Salvar e enviar agora'}
      pending={pending}
      error={error}
      onSubmit={submit}
      onClose={onClose}
    >
      <MessageFields
        contacts={contacts}
        values={form.values}
        errors={form.errors}
        onChange={form.change}
        disabled={pending}
      />
    </FormDialog>
  )
}

export default EditMessageDialog
