import { useState } from 'react'
import { Link as RouterLink, Outlet, useMatch, useParams } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Link from '@mui/material/Link'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import ConnectionFormDialog from '../components/ConnectionFormDialog'
import EmptyState from '../components/EmptyState'
import type { ConnectionContext } from '../hooks/useConnectionContext'
import { useConnection, useContacts } from '../hooks/useData'
import { renameConnection } from '../services/connection-service'

const ConnectionPage = () => {
  const { connectionId = '' } = useParams()
  const connection = useConnection(connectionId)
  const contacts = useContacts(connectionId)
  const isMessagesTab = Boolean(useMatch('/connections/:connectionId/messages'))
  const [editing, setEditing] = useState(false)

  if (connection.loading) {
    return (
      <div className="flex justify-center py-16" role="status">
        <CircularProgress aria-label="Carregando" />
      </div>
    )
  }

  // Other tenants' connections are denied by the rules: same message as missing.
  if (connection.error?.code === 'permission-denied' || connection.data === null) {
    return (
      <EmptyState
        title="Conexão não encontrada"
        description="Ela pode ter sido excluída ou não pertence à sua conta."
        action={
          <Button component={RouterLink} to="/connections" variant="contained">
            Ver conexões
          </Button>
        }
      />
    )
  }

  if (connection.error || !connection.data) {
    return <Alert severity="error">Não foi possível carregar a conexão.</Alert>
  }

  const context: ConnectionContext = { connection: connection.data, contacts }
  const { name } = connection.data

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumbs aria-label="Navegação">
        <Link component={RouterLink} to="/connections" underline="hover" color="inherit">
          Conexões
        </Link>
        <Typography color="text.primary" className="max-w-60 truncate">
          {name}
        </Typography>
      </Breadcrumbs>

      <header className="flex flex-wrap items-center justify-between gap-3">
        <Typography variant="h5" component="h1" className="min-w-0 break-words font-semibold">
          {name}
        </Typography>
        <Button startIcon={<EditOutlinedIcon />} onClick={() => setEditing(true)}>
          Renomear
        </Button>
      </header>

      <Tabs value={isMessagesTab ? 'messages' : 'contacts'} className="border-b border-slate-200">
        <Tab label="Contatos" value="contacts" component={RouterLink} to="contacts" />
        <Tab label="Mensagens" value="messages" component={RouterLink} to="messages" />
      </Tabs>

      <Outlet context={context} />

      {editing && (
        <ConnectionFormDialog
          open
          initialName={name}
          onSave={(newName) => renameConnection(connectionId, newName)}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  )
}

export default ConnectionPage
