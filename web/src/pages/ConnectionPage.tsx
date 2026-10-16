import { useState } from 'react';
import {
  Link as RouterLink,
  Outlet,
  useMatch,
  useParams,
} from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import ConnectionDialogs, {
  type ConnectionDialogState,
} from '../components/ConnectionDialogs';
import EmptyState from '../components/EmptyState';
import type { ConnectionContext } from '../hooks/useConnectionContext';
import { useConnection, useContacts } from '../hooks/useData';
import { formatDate } from '../utils/date';

const BackLink = () => (
  <Button
    component={RouterLink}
    to="/connections"
    variant="text"
    color="inherit"
    size="small"
    startIcon={<ArrowBackIcon />}
    className="-ml-2 self-start text-muted md:hidden"
  >
    Conexões
  </Button>
);

const HeaderSkeleton = () => (
  <div
    role="status"
    aria-label="Carregando conexão"
    className="flex flex-col gap-6"
  >
    <div className="flex flex-col gap-2" aria-hidden>
      <Skeleton variant="text" width={240} height={34} />
      <Skeleton variant="text" width={140} height={18} />
    </div>
    <Skeleton variant="rounded" height={44} width={220} aria-hidden />
  </div>
);

const ConnectionPage = () => {
  const { connectionId = '' } = useParams();
  const connection = useConnection(connectionId);
  const contacts = useContacts(connectionId);
  const isMessagesTab = Boolean(
    useMatch('/connections/:connectionId/messages'),
  );
  const [dialog, setDialog] = useState<ConnectionDialogState>(null);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  if (connection.loading) return <HeaderSkeleton />;

  // Other tenants' connections are denied by the rules: same message as missing.
  if (
    connection.error?.code === 'permission-denied' ||
    connection.data === null
  ) {
    return (
      <div className="flex flex-col gap-4">
        <BackLink />
        <EmptyState
          icon={<SearchOffIcon />}
          title="Conexão não encontrada"
          description="Ela pode ter sido excluída ou não pertence à sua conta."
          action={
            <Button
              component={RouterLink}
              to="/connections"
              variant="contained"
            >
              Ver conexões
            </Button>
          }
        />
      </div>
    );
  }

  if (connection.error || !connection.data) {
    return (
      <Alert severity="error">
        Não foi possível carregar a conexão. Recarregue a página para tentar de
        novo.
      </Alert>
    );
  }

  const context: ConnectionContext = { connection: connection.data, contacts };
  const current = connection.data;
  const contactCount = contacts.data?.length;

  return (
    <div className="flex flex-col">
      <BackLink />

      <header className="mt-2 flex items-start justify-between gap-4 md:mt-0">
        <div className="min-w-0">
          <Typography variant="h1" className="break-words">
            {current.name}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            className="tabular mt-1"
          >
            Criada em {formatDate(current.createdAt)}
          </Typography>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="outlined"
            startIcon={<EditOutlinedIcon />}
            onClick={() => setDialog({ type: 'edit', connection: current })}
            className="hidden sm:inline-flex"
          >
            Renomear
          </Button>
          <IconButton
            aria-label="Mais ações da conexão"
            aria-haspopup="menu"
            aria-expanded={menuAnchor !== null}
            onClick={event => setMenuAnchor(event.currentTarget)}
          >
            <MoreHorizIcon />
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={menuAnchor !== null}
            onClose={() => setMenuAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem
              onClick={() => {
                setDialog({ type: 'edit', connection: current });
                setMenuAnchor(null);
              }}
              className="sm:hidden"
            >
              <EditOutlinedIcon /> Renomear
            </MenuItem>
            <MenuItem
              onClick={() => {
                setDialog({ type: 'delete', connection: current });
                setMenuAnchor(null);
              }}
              sx={{ color: 'error.main' }}
            >
              <DeleteOutlineIcon /> Excluir conexão
            </MenuItem>
          </Menu>
        </div>
      </header>

      <Tabs
        value={isMessagesTab ? 'messages' : 'contacts'}
        aria-label="Seções da conexão"
        className="mt-5 mb-6 shadow-[inset_0_-1px_0_var(--color-tone-200)]"
      >
        <Tab
          value="contacts"
          component={RouterLink}
          to="contacts"
          label={
            <span className="flex items-center gap-2">
              Contatos
              {contactCount !== undefined && (
                <span className="tabular rounded-md bg-tone-200 px-1.5 py-px text-xs font-semibold text-ink">
                  {contactCount}
                </span>
              )}
            </span>
          }
        />
        <Tab
          label="Mensagens"
          value="messages"
          component={RouterLink}
          to="messages"
        />
      </Tabs>

      <Outlet context={context} />

      <ConnectionDialogs dialog={dialog} onClose={() => setDialog(null)} />
    </div>
  );
};

export default ConnectionPage;
