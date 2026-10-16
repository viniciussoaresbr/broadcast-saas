import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import ConfirmDialog from '../components/ConfirmDialog'
import ConnectionFormDialog from '../components/ConnectionFormDialog'
import EmptyState from '../components/EmptyState'
import ListState from '../components/ListState'
import { useCurrentUser } from '../hooks/useAuth'
import { useConnections } from '../hooks/useData'
import {
  createConnection,
  deleteConnection,
  renameConnection,
} from '../services/connection-service'
import type { Connection } from '../types'
import { formatDateTime } from '../utils/date'

type DialogState =
  | { type: 'create' }
  | { type: 'edit'; connection: Connection }
  | { type: 'delete'; connection: Connection }
  | null

const ConnectionsPage = () => {
  const { uid } = useCurrentUser()
  const connections = useConnections()
  const [dialog, setDialog] = useState<DialogState>(null)
  const closeDialog = () => setDialog(null)

  const createButton = (
    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog({ type: 'create' })}>
      Nova conexão
    </Button>
  )

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Typography variant="h5" component="h1" className="font-semibold">
            Conexões
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cada conexão tem seus próprios contatos e mensagens.
          </Typography>
        </div>
        {createButton}
      </header>

      <ListState
        state={connections}
        empty={
          <EmptyState
            title="Nenhuma conexão ainda"
            description="Crie sua primeira conexão para cadastrar contatos e enviar mensagens."
            action={createButton}
          />
        }
      >
        {(items) => (
          <Paper variant="outlined">
            <List disablePadding>
              {items.map((connection, index) => (
                <ListItem
                  key={connection.id}
                  divider={index < items.length - 1}
                  disablePadding
                  secondaryAction={
                    <div className="flex gap-1">
                      <Tooltip title="Editar">
                        <IconButton
                          aria-label={`Editar ${connection.name}`}
                          onClick={() => setDialog({ type: 'edit', connection })}
                        >
                          <EditOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton
                          aria-label={`Excluir ${connection.name}`}
                          onClick={() => setDialog({ type: 'delete', connection })}
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    </div>
                  }
                >
                  <ListItemButton component={RouterLink} to={`/connections/${connection.id}`} className="pr-28">
                    <ListItemText
                      primary={connection.name}
                      secondary={`Criada em ${formatDateTime(connection.createdAt)}`}
                      slotProps={{ primary: { className: 'truncate font-medium' } }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </ListState>

      {dialog?.type === 'create' && (
        <ConnectionFormDialog open onSave={(name) => createConnection(uid, name)} onClose={closeDialog} />
      )}
      {dialog?.type === 'edit' && (
        <ConnectionFormDialog
          open
          initialName={dialog.connection.name}
          onSave={(name) => renameConnection(dialog.connection.id, name)}
          onClose={closeDialog}
        />
      )}
      {dialog?.type === 'delete' && (
        <ConfirmDialog
          open
          title="Excluir conexão?"
          description={
            <>
              A conexão <strong>{dialog.connection.name}</strong> será excluída junto com
              todos os seus contatos e mensagens. Esta ação não pode ser desfeita.
            </>
          }
          onConfirm={() => deleteConnection({ connectionId: dialog.connection.id })}
          onClose={closeDialog}
        />
      )}
    </div>
  )
}

export default ConnectionsPage
