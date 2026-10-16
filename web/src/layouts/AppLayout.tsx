import { Link as RouterLink, Outlet } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Button from '@mui/material/Button'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import CampaignIcon from '@mui/icons-material/Campaign'
import LogoutIcon from '@mui/icons-material/Logout'
import { useCurrentUser } from '../hooks/useAuth'
import { signOut } from '../services/auth-service'

const AppLayout = () => {
  const user = useCurrentUser()

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <AppBar position="sticky" elevation={1}>
        <Toolbar className="gap-3">
          <RouterLink
            to="/connections"
            className="flex items-center gap-2 text-inherit no-underline"
          >
            <CampaignIcon aria-hidden />
            <Typography variant="h6" component="span" className="font-semibold">
              Broadcast
            </Typography>
          </RouterLink>
          <span className="flex-1" />
          <Typography
            variant="body2"
            className="hidden max-w-60 truncate sm:block"
            title={user.email ?? undefined}
          >
            {user.displayName || user.email}
          </Typography>
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={() => signOut()}>
            Sair
          </Button>
        </Toolbar>
      </AppBar>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
