import { useMatch, useNavigate } from 'react-router-dom'
import { useCurrentUser } from '../hooks/useAuth'
import { useFeedback } from '../hooks/useFeedback'
import {
  createConnection,
  deleteConnection,
  renameConnection,
} from '../services/connection-service'
import type { Connection } from '../types'
import ConfirmDialog from './ConfirmDialog'
import ConnectionFormDialog from './ConnectionFormDialog'

export type ConnectionDialogState =
  | { type: 'create' }
  | { type: 'edit'; connection: Connection }
  | { type: 'delete'; connection: Connection }
  | null

type ConnectionDialogsProps = {
  dialog: ConnectionDialogState
  onClose: () => void
}

/** Create / rename / delete dialogs, shared by the sidebar, the list page and the connection header. */
const ConnectionDialogs = ({ dialog, onClose }: ConnectionDialogsProps) => {
  const { uid } = useCurrentUser()
  const navigate = useNavigate()
  const notify = useFeedback()
  const openConnectionId = useMatch('/connections/:connectionId/*')?.params.connectionId

  if (dialog?.type === 'create') {
    return (
      <ConnectionFormDialog
        open
        onSave={async (name) => {
          const id = await createConnection(uid, name)
          notify('Conexão criada.')
          navigate(`/connections/${id}`)
        }}
        onClose={onClose}
      />
    )
  }

  if (dialog?.type === 'edit') {
    return (
      <ConnectionFormDialog
        open
        initialName={dialog.connection.name}
        onSave={async (name) => {
          await renameConnection(dialog.connection.id, name)
          notify('Conexão renomeada.')
        }}
        onClose={onClose}
      />
    )
  }

  if (dialog?.type === 'delete') {
    const { connection } = dialog
    return (
      <ConfirmDialog
        open
        title="Excluir conexão?"
        description={
          <>
            A conexão <strong className="font-semibold text-ink">{connection.name}</strong> será
            excluída junto com todos os seus contatos e mensagens, inclusive as agendadas. Esta
            ação não pode ser desfeita.
          </>
        }
        confirmLabel="Excluir conexão"
        onConfirm={() => deleteConnection({ connectionId: connection.id })}
        onConfirmed={() => {
          notify('Conexão excluída.')
          if (openConnectionId === connection.id) navigate('/connections', { replace: true })
        }}
        onClose={onClose}
      />
    )
  }

  return null
}

export default ConnectionDialogs
