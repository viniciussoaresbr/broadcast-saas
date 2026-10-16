import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Snackbar from '@mui/material/Snackbar'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import ConfirmDialog from '../components/ConfirmDialog'
import EditMessageDialog from '../components/EditMessageDialog'
import EmptyState from '../components/EmptyState'
import ListState from '../components/ListState'
import MessageCard from '../components/MessageCard'
import MessageComposer from '../components/MessageComposer'
import { useConnectionContext } from '../hooks/useConnectionContext'
import { useMessages } from '../hooks/useData'
import { deleteMessage } from '../services/message-service'
import type { Message, MessageFilter } from '../types'
import { getErrorMessage } from '../utils/errors'

const FILTERS: { value: MessageFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'sent', label: 'Enviadas' },
  { value: 'scheduled', label: 'Agendadas' },
]

const EMPTY_MESSAGES: Record<MessageFilter, string> = {
  all: 'Nenhuma mensagem criada nesta conexão.',
  sent: 'Nenhuma mensagem enviada.',
  scheduled: 'Nenhuma mensagem agendada.',
}

type DialogState = { type: 'edit' | 'delete'; message: Message } | null

const BroadcastPage = () => {
  const { connection, contacts } = useConnectionContext()
  const [filter, setFilter] = useState<MessageFilter>('all')
  const messages = useMessages(connection.id, filter)
  const [dialog, setDialog] = useState<DialogState>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const closeDialog = () => setDialog(null)

  const contactList = contacts.data ?? []
  const contactsById = new Map(contactList.map((contact) => [contact.id, contact]))

  const renderComposer = () => {
    if (contacts.error) return <Alert severity="error">{getErrorMessage(contacts.error)}</Alert>
    if (contacts.loading) {
      return (
        <div className="flex justify-center py-6" role="status">
          <CircularProgress aria-label="Carregando contatos" />
        </div>
      )
    }
    if (contactList.length === 0) {
      return (
        <EmptyState
          title="Esta conexão ainda não tem contatos"
          description="Cadastre ao menos um contato para enviar mensagens."
          action={
            <Button component={RouterLink} to="../contacts" relative="path" variant="contained">
              Cadastrar contatos
            </Button>
          }
        />
      )
    }
    return (
      <MessageComposer
        connectionId={connection.id}
        contacts={contactList}
        onCreated={(scheduled) =>
          setFeedback(scheduled ? 'Mensagem agendada.' : 'Mensagem enviada (simulação).')
        }
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {renderComposer()}

      <section className="flex flex-col gap-4" aria-labelledby="messages-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Typography id="messages-title" variant="h6" component="h2">
            Mensagens
          </Typography>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={filter}
            onChange={(_, value: MessageFilter | null) => value && setFilter(value)}
            aria-label="Filtrar mensagens"
          >
            {FILTERS.map(({ value, label }) => (
              <ToggleButton key={value} value={value}>
                {label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </div>

        <ListState state={messages} empty={<EmptyState title={EMPTY_MESSAGES[filter]} />}>
          {(items) => (
            <div className="flex flex-col gap-3">
              {items.map((message) => (
                <MessageCard
                  key={message.id}
                  message={message}
                  contactsById={contactsById}
                  onEdit={() => setDialog({ type: 'edit', message })}
                  onDelete={() => setDialog({ type: 'delete', message })}
                />
              ))}
            </div>
          )}
        </ListState>
      </section>

      {dialog?.type === 'edit' && (
        <EditMessageDialog message={dialog.message} contacts={contactList} onClose={closeDialog} />
      )}
      {dialog?.type === 'delete' && (
        <ConfirmDialog
          open
          title="Excluir mensagem?"
          description={
            dialog.message.status === 'scheduled'
              ? 'O agendamento será cancelado e a mensagem não será enviada.'
              : 'O registro será removido do histórico. Isso não gera um novo envio.'
          }
          onConfirm={() => deleteMessage({ messageId: dialog.message.id })}
          onClose={closeDialog}
        />
      )}

      <Snackbar
        open={feedback !== null}
        autoHideDuration={4000}
        onClose={() => setFeedback(null)}
        message={feedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </div>
  )
}

export default BroadcastPage
