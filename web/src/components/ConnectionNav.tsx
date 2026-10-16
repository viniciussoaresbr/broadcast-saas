import { useState, type MouseEvent } from 'react'
import { NavLink } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import PodcastsOutlinedIcon from '@mui/icons-material/PodcastsOutlined'
import { useConnections } from '../hooks/useData'
import type { Connection } from '../types'
import { formatDate } from '../utils/date'
import { getErrorMessage } from '../utils/errors'
import ConnectionDialogs, { type ConnectionDialogState } from './ConnectionDialogs'
import EmptyState from './EmptyState'
import Initials from './Initials'
import ListSkeleton from './ListSkeleton'

type ConnectionNavProps = {
  /** `sidebar`: compact rows in the desktop rail. `page`: full-width list on phones. */
  variant: 'sidebar' | 'page'
}

type MenuState = { anchor: HTMLElement; connection: Connection } | null

/** The user's connections, with the create / rename / delete entry points. */
const ConnectionNav = ({ variant }: ConnectionNavProps) => {
  const connections = useConnections()
  const [dialog, setDialog] = useState<ConnectionDialogState>(null)
  const [menu, setMenu] = useState<MenuState>(null)
  const isSidebar = variant === 'sidebar'

  const openMenu = (event: MouseEvent<HTMLElement>, connection: Connection) =>
    setMenu({ anchor: event.currentTarget, connection })

  const createButton = (
    <Button
      variant={isSidebar ? 'outlined' : 'contained'}
      startIcon={<AddIcon />}
      onClick={() => setDialog({ type: 'create' })}
      fullWidth={isSidebar}
      className={isSidebar ? 'justify-start bg-surface' : ''}
    >
      Nova conexão
    </Button>
  )

  const renderList = () => {
    if (connections.error) {
      return <Alert severity="error">{getErrorMessage(connections.error)}</Alert>
    }
    if (connections.loading || !connections.data) {
      return <ListSkeleton rows={isSidebar ? 3 : 4} label="Carregando conexões" />
    }
    if (connections.data.length === 0) {
      return isSidebar ? (
        <Typography variant="body2" color="text.secondary" className="px-3 py-2">
          Nenhuma conexão ainda.
        </Typography>
      ) : (
        <EmptyState
          icon={<PodcastsOutlinedIcon />}
          title="Nenhuma conexão ainda"
          description="Crie sua primeira conexão para cadastrar contatos e enviar mensagens."
          action={createButton}
        />
      )
    }

    return (
      <ul className={`flex flex-col ${isSidebar ? 'gap-0.5' : 'gap-1'}`}>
        {connections.data.map((connection) => (
          <li key={connection.id} className="group relative">
            <NavLink
              to={`/connections/${connection.id}`}
              className={({ isActive }) =>
                [
                  'flex min-w-0 items-center gap-3 rounded-lg pr-11 text-ink no-underline transition-colors',
                  'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-signal',
                  isSidebar ? 'py-1.5 pl-2' : 'bg-surface py-3 pl-3',
                  isActive
                    ? 'bg-surface font-semibold shadow-[0_0_0_1px_var(--color-tone-200)]'
                    : 'font-medium hover:bg-tone-200/60',
                ].join(' ')
              }
            >
              <Initials name={connection.name} size={isSidebar ? 'sm' : 'md'} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm">{connection.name}</span>
                {!isSidebar && (
                  <span className="tabular text-[0.8125rem] font-normal text-muted">
                    Criada em {formatDate(connection.createdAt)}
                  </span>
                )}
              </span>
            </NavLink>
            <IconButton
              size="small"
              aria-label={`Ações de ${connection.name}`}
              aria-haspopup="menu"
              aria-expanded={menu?.connection.id === connection.id}
              onClick={(event) => openMenu(event, connection)}
              className={[
                'absolute top-1/2 right-1.5 -translate-y-1/2',
                isSidebar &&
                  'opacity-0 group-hover:opacity-100 group-has-[[aria-current=page]]:opacity-100 focus-visible:opacity-100 aria-expanded:opacity-100 [@media(hover:none)]:opacity-100',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <MoreHorizIcon fontSize="small" />
            </IconButton>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <nav aria-label="Conexões" className="flex min-h-0 flex-1 flex-col">
      {isSidebar ? (
        <div className="flex flex-col gap-4 px-3">
          {createButton}
          <Typography variant="caption" component="h2" color="text.secondary" className="px-2 font-medium">
            Conexões
          </Typography>
        </div>
      ) : (
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <Typography variant="h1">Conexões</Typography>
            <Typography variant="body2" color="text.secondary" className="mt-1">
              Cada conexão tem seus próprios contatos e mensagens.
            </Typography>
          </div>
          {connections.data && connections.data.length > 0 && createButton}
        </header>
      )}

      <div className={isSidebar ? 'mt-1 min-h-0 flex-1 overflow-y-auto px-3 pb-3' : ''}>{renderList()}</div>

      <Menu
        anchorEl={menu?.anchor}
        open={menu !== null}
        onClose={() => setMenu(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            if (menu) setDialog({ type: 'edit', connection: menu.connection })
            setMenu(null)
          }}
        >
          <EditOutlinedIcon /> Renomear
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menu) setDialog({ type: 'delete', connection: menu.connection })
            setMenu(null)
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteOutlineIcon /> Excluir
        </MenuItem>
      </Menu>

      <ConnectionDialogs dialog={dialog} onClose={() => setDialog(null)} />
    </nav>
  )
}

export default ConnectionNav
