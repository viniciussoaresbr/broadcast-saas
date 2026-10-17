import type { ReactNode } from 'react';
import Typography from '@mui/material/Typography';

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  variant?: 'tinted' | 'plain';
};

const EmptyState = ({
  title,
  description,
  action,
  icon,
  variant = 'tinted',
}: EmptyStateProps) => (
  <div
    className={`flex flex-col items-center gap-1.5 rounded-xl px-6 py-12 text-center ${
      variant === 'tinted' ? 'bg-tone-100' : ''
    }`}
  >
    {icon && (
      <span
        aria-hidden
        className="mb-2 grid size-11 place-items-center rounded-xl bg-surface text-muted shadow-[0_0_0_1px_var(--color-tone-200)]"
      >
        {icon}
      </span>
    )}
    <Typography variant="h3" component="p" className="text-balance">
      {title}
    </Typography>
    {description && (
      <Typography
        variant="body2"
        color="text.secondary"
        className="max-w-sm text-pretty"
      >
        {description}
      </Typography>
    )}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;
