import { useState } from 'react';
import { Link as RouterLink, Outlet } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { Theme } from '@mui/material/styles';
import LogoutIcon from '@mui/icons-material/Logout';
import { Wordmark } from '../components/BrandMark';
import ConnectionNav from '../components/ConnectionNav';
import Initials from '../components/Initials';
import { useCurrentUser } from '../hooks/useAuth';
import { signOut } from '../services/auth-service';

const SkipLink = () => (
  <a
    href="#conteudo"
    className="sr-only rounded-lg bg-ink px-3 py-2 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
  >
    Pular para o conteúdo
  </a>
);

const UserPanel = () => {
  const user = useCurrentUser();
  const label = user.displayName || user.email || 'Conta';

  return (
    <div className="flex items-center gap-3 px-3 py-3">
      <Initials name={label} size="sm" />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium text-ink">{label}</span>
        {user.displayName && user.email && (
          <span className="truncate text-xs text-muted" title={user.email}>
            {user.email}
          </span>
        )}
      </div>
      <Tooltip title="Sair">
        <IconButton size="small" aria-label="Sair" onClick={() => signOut()}>
          <LogoutIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </div>
  );
};

const UserMenu = () => {
  const user = useCurrentUser();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const label = user.displayName || user.email || 'Conta';

  return (
    <>
      <IconButton
        aria-label="Conta"
        aria-haspopup="menu"
        aria-expanded={anchor !== null}
        onClick={event => setAnchor(event.currentTarget)}
        className="p-1"
      >
        <Initials name={label} size="sm" />
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={anchor !== null}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <div className="flex max-w-64 flex-col px-3 pt-2 pb-3">
          <Typography variant="body2" className="truncate font-medium">
            {label}
          </Typography>
          {user.displayName && (
            <Typography
              variant="caption"
              color="text.secondary"
              className="truncate"
            >
              {user.email}
            </Typography>
          )}
        </div>
        <MenuItem onClick={() => signOut()}>
          <LogoutIcon /> Sair
        </MenuItem>
      </Menu>
    </>
  );
};

const AppLayout = () => {
  const isDesktop = useMediaQuery(
    (theme: Theme) => theme.breakpoints.up('md'),
    { noSsr: true },
  );

  if (isDesktop) {
    return (
      <div className="flex h-dvh bg-ground">
        <SkipLink />
        <aside className="flex w-64 shrink-0 flex-col">
          <RouterLink
            to="/connections"
            className="mx-3 mt-4 mb-5 flex rounded-lg px-2 py-1.5 no-underline focus-visible:outline-2 focus-visible:outline-signal"
          >
            <Wordmark />
          </RouterLink>
          <ConnectionNav variant="sidebar" />
          <UserPanel />
        </aside>
        <main
          id="conteudo"
          tabIndex={-1}
          className="my-2 mr-2 min-w-0 flex-1 overflow-y-auto rounded-xl bg-surface shadow-[0_0_0_1px_var(--color-tone-200)] outline-none"
        >
          <div className="mx-auto w-full max-w-6xl px-8 py-7 lg:px-10">
            <Outlet />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-ground">
      <SkipLink />
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between bg-surface px-4 shadow-[0_1px_0_var(--color-tone-200)]">
        <RouterLink
          to="/connections"
          className="flex rounded-lg no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
        >
          <Wordmark />
        </RouterLink>
        <UserMenu />
      </header>
      <main
        id="conteudo"
        tabIndex={-1}
        className="w-full flex-1 px-4 py-5 outline-none"
      >
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
