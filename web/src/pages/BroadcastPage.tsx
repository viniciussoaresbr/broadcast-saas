import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import type { Theme } from '@mui/material/styles'
import AddIcon from '@mui/icons-material/Add'
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined'
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined'
import ConfirmDialog from '../components/ConfirmDialog'
import EditMessageDialog from '../components/EditMessageDialog'
import EmptyState from '../components/EmptyState'
import ListSkeleton from '../components/ListSkeleton'
import ListState from '../components/ListState'
import MessageCard from '../components/MessageCard'
import MessageComposer from '../components/MessageComposer'
import { useConnectionContext } from '../hooks/useConnectionContext'
import { useMessages } from '../hooks/useData'
import { useFeedback } from '../hooks/useFeedback'
import { deleteMessage } from '../services/message-service'
import type { Contact, Message, MessageFilter } from '../types'
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

const time = (date: Date | null) => date?.getTime() ?? 0

// Next scheduled first; most recent sent first. Presentation only: the query stays the same.
const byNextSchedule = (a: Message, b: Message) => time(a.scheduledAt) - time(b.scheduledAt)
const byLatestSend = (a: Message, b: Message) =>
  time(b.sentAt ?? b.createdAt) - time(a.sentAt ?? a.createdAt)

type MessageGroupProps = {
  title?: string
  messages: Message[]
  contactsById: Map<string, Contact>
  onDialog: (dialog: DialogState) => void
}

const MessageGroup = ({ title, messages, contactsById, onDialog }: MessageGroupProps) => {
  if (messages.length === 0) return null
  return (
    <section aria-label={title} className="flex flex-col">
      {title && (
        <Typography variant="h3" component="h3" className="flex items-center gap-2 pt-2 pb-1">
          {title}
          <span className="tabular rounded-md bg-tone-200 px-1.5 py-px text-xs font-semibold">
            {messages.length}
          </span>
        </Typography>
      )}
      <ul className="flex flex-col divide-y divide-line">
        {messages.map((message) => (
          <li key={message.id}>
            <MessageCard
              message={message}
              contactsById={contactsById}
              onEdit={() => onDialog({ type: 'edit', message })}
              onDelete={() => onDialog({ type: 'delete', message })}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}

const BroadcastPage = () => {
  const { connection, contacts } = useConnectionContext()
  const notify = useFeedback()
  const [filter, setFilter] = useState<MessageFilter>('all')
  const messages = useMessages(connection.id, filter)
  const [dialog, setDialog] = useState<DialogState>(null)
  const [composerOpen, setComposerOpen] = useState(false)
  // Side-by-side composer needs the room of a large screen; below it opens in a dialog.
  const isWide = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'), { noSsr: true })
  const isPhone = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'), { noSsr: true })
  const closeDialog = () => setDialog(null)

  const contactList = contacts.data ?? []
  const contactsById = new Map(contactList.map((contact) => [contact.id, contact]))
  const hasContacts = contactList.length > 0

  const handleCreated = (scheduled: boolean) => {
    setComposerOpen(false)
    notify(scheduled ? 'Mensagem agendada.' : 'Mensagem enviada (simulação).')
  }

  const noContacts = (
    <EmptyState
      variant={isWide ? 'plain' : 'tinted'}
      icon={<PersonAddAltOutlinedIcon />}
      title="Esta conexão ainda não tem contatos"
      description="Cadastre ao menos um contato para enviar mensagens."
      action={
        <Button component={RouterLink} to="../contacts" relative="path" variant="contained">
          Cadastrar contatos
        </Button>
      }
    />
  )

  const renderSideComposer = () => {
    if (contacts.error) return <Alert severity="error">{getErrorMessage(contacts.error)}</Alert>
    if (contacts.loading) return <ListSkeleton rows={4} label="Carregando contatos" />
    if (!hasContacts) return noContacts
    return (
      <MessageComposer connectionId={connection.id} contacts={contactList} onCreated={handleCreated} />
    )
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(320px,380px)_minmax(0,1fr)] xl:gap-10">
      {isWide && (
        <aside className="sticky top-6 max-h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain rounded-xl bg-tone-100 p-5">
          {renderSideComposer()}
        </aside>
      )}

      <section className="flex min-w-0 flex-col gap-3" aria-labelledby="history-title">
        {!isWide && !contacts.loading && !hasContacts && noContacts}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Typography id="history-title" variant="h2">
            Histórico
          </Typography>
          <div className="flex flex-wrap items-center gap-2">
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
            {!isWide && hasContacts && (
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setComposerOpen(true)}>
                Nova mensagem
              </Button>
            )}
          </div>
        </div>

        <ListState
          state={messages}
          empty={<EmptyState icon={<ForumOutlinedIcon />} title={EMPTY_MESSAGES[filter]} />}
        >
          {(items) =>
            filter === 'all' ? (
              <div className="flex flex-col gap-4">
                <MessageGroup
                  title="Agendadas"
                  messages={items.filter((message) => message.status === 'scheduled').sort(byNextSchedule)}
                  contactsById={contactsById}
                  onDialog={setDialog}
                />
                <MessageGroup
                  title="Enviadas"
                  messages={items.filter((message) => message.status === 'sent').sort(byLatestSend)}
                  contactsById={contactsById}
                  onDialog={setDialog}
                />
              </div>
            ) : (
              <MessageGroup
                messages={[...items].sort(filter === 'scheduled' ? byNextSchedule : byLatestSend)}
                contactsById={contactsById}
                onDialog={setDialog}
              />
            )
          }
        </ListState>
      </section>

      {!isWide && (
        <Dialog
          open={composerOpen && hasContacts}
          onClose={() => setComposerOpen(false)}
          fullScreen={isPhone}
          maxWidth="sm"
          fullWidth
          aria-labelledby="composer-dialog-title"
        >
          <div className="p-5 sm:p-6">
            <MessageComposer
              connectionId={connection.id}
              contacts={contactList}
              onCreated={handleCreated}
              onCancel={() => setComposerOpen(false)}
              titleId="composer-dialog-title"
            />
          </div>
        </Dialog>
      )}

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
          confirmLabel="Excluir mensagem"
          onConfirm={() => deleteMessage({ messageId: dialog.message.id })}
          onConfirmed={() => notify('Mensagem excluída.')}
          onClose={closeDialog}
        />
      )}
    </div>
  )
}

export default BroadcastPage
