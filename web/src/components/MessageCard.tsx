import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import ScheduleIcon from '@mui/icons-material/Schedule'
import type { Contact, Message } from '../types'
import { formatDateTime } from '../utils/date'

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

const MessageCard = ({ message, contactsById, onEdit, onDelete }: MessageCardProps) => {
  const isScheduled = message.status === 'scheduled'
  const recipientCount = message.contactIds.length

  return (
    <Paper variant="outlined" component="article" className="flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Chip
          size="small"
          icon={isScheduled ? <ScheduleIcon /> : <CheckCircleOutlineIcon />}
          label={isScheduled ? 'Agendada' : 'Enviada'}
          color={isScheduled ? 'warning' : 'success'}
          variant="outlined"
        />
        <Typography variant="body2" color="text.secondary">
          {isScheduled
            ? `Agendada para ${formatDateTime(message.scheduledAt)}`
            : `Enviada em ${formatDateTime(message.sentAt)}`}
          {!isScheduled && message.scheduledAt && (
            <> · agendada para {formatDateTime(message.scheduledAt)}</>
          )}
        </Typography>
        <span className="flex-1" />
        <div className="flex gap-1">
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
      </div>

      <Typography className="whitespace-pre-wrap break-words">{message.content}</Typography>

      <Typography variant="body2" color="text.secondary" className="break-words">
        <strong>
          {recipientCount} {recipientCount === 1 ? 'destinatário' : 'destinatários'}:
        </strong>{' '}
        {recipientNames(message, contactsById)}
      </Typography>
    </Paper>
  )
}

export default MessageCard
