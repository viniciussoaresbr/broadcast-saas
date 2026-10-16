import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import CheckIcon from '@mui/icons-material/Check'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined'
import ScheduleIcon from '@mui/icons-material/Schedule'
import type { Contact, Message } from '../types'
import { formatDateTime, formatRelativeDateTime } from '../utils/date'

type MessageCardProps = {
  message: Message
  contactsById: Map<string, Contact>
  onEdit: () => void
  onDelete: () => void
}

const recipientNames = (message: Message, contactsById: Map<string, Contact>): string =>
  message.contactIds
    // Sent messages keep their history even if a contact is deleted later.
    .map((id) => contactsById.get(id)?.name ?? 'Contato excluído')
    .join(', ')

const STATUS = {
  sent: {
    label: 'Enviada',
    Icon: CheckIcon,
    tile: 'bg-[var(--mui-palette-success-light)] text-[var(--mui-palette-success-main)]',
  },
  scheduled: {
    label: 'Agendada',
    Icon: ScheduleIcon,
    tile: 'bg-[var(--mui-palette-info-light)] text-[var(--mui-palette-info-main)]',
  },
}

/** One broadcast in the history: status, when, what and to whom. */
const MessageCard = ({ message, contactsById, onEdit, onDelete }: MessageCardProps) => {
  const isScheduled = message.status === 'scheduled'
  const { label, Icon, tile } = STATUS[message.status]
  const when = isScheduled ? message.scheduledAt : (message.sentAt ?? message.createdAt)
  const recipientCount = message.contactIds.length

  return (
    <article className="flex gap-3 py-4" aria-label={`${label}, ${formatDateTime(when)}`}>
      <span aria-hidden className={`grid size-8 shrink-0 place-items-center rounded-lg ${tile}`}>
        <Icon sx={{ fontSize: 17 }} />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex min-h-8 flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
          <span className="font-semibold text-ink">{label}</span>
          <time className="tabular text-muted" dateTime={when?.toISOString()} title={formatDateTime(when)}>
            {isScheduled ? 'para ' : ''}
            {formatRelativeDateTime(when)}
          </time>
          {!isScheduled && message.scheduledAt && (
            <span className="tabular text-muted">· agendada para {formatDateTime(message.scheduledAt)}</span>
          )}
        </div>

        <p className="m-0 text-[0.9375rem] leading-relaxed whitespace-pre-wrap break-words text-ink">
          {message.content}
        </p>

        <p className="m-0 flex items-start gap-1.5 text-[0.8125rem] text-muted">
          <GroupOutlinedIcon aria-hidden sx={{ fontSize: 16, mt: '2px' }} />
          <span className="min-w-0 break-words">
            <span className="font-medium text-ink">
              {recipientCount} {recipientCount === 1 ? 'destinatário' : 'destinatários'}:
            </span>{' '}
            {recipientNames(message, contactsById)}
          </span>
        </p>
      </div>

      <div className="flex shrink-0 items-start gap-0.5">
        {isScheduled && (
          <Tooltip title="Editar">
            <IconButton size="small" aria-label="Editar mensagem" onClick={onEdit}>
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="Excluir">
          <IconButton size="small" aria-label="Excluir mensagem" onClick={onDelete}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>
    </article>
  )
}

export default MessageCard
