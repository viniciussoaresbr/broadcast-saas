import type { ReactNode } from 'react'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import CampaignIcon from '@mui/icons-material/Campaign'

type AuthLayoutProps = {
  title: string
  subtitle?: string
  children: ReactNode
}

const AuthLayout = ({ title, subtitle, children }: AuthLayoutProps) => (
  <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
    <Paper elevation={2} className="w-full max-w-md p-6 sm:p-8">
      <div className="mb-6 flex flex-col items-center gap-2 text-center">
        <CampaignIcon color="primary" fontSize="large" aria-hidden />
        <Typography variant="h5" component="h1" className="font-semibold">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </div>
      {children}
    </Paper>
  </main>
)

export default AuthLayout
