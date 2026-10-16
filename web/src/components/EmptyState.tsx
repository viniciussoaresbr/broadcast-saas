import type { ReactNode } from 'react'
import Typography from '@mui/material/Typography'

type EmptyStateProps = {
  title: string
  description?: string
  action?: ReactNode
}

const EmptyState = ({ title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-slate-300 px-6 py-10 text-center">
    <Typography variant="subtitle1" component="p" className="font-medium">
      {title}
    </Typography>
    {description && (
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    )}
    {action && <div className="mt-2">{action}</div>}
  </div>
)

export default EmptyState
