import type { ReactNode } from 'react';
import Typography from '@mui/material/Typography';
import { Wordmark } from '../components/BrandMark';

type AuthLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

const AuthLayout = ({ title, subtitle, children }: AuthLayoutProps) => (
  <main className="flex min-h-dvh flex-col items-center justify-center bg-ground px-4 py-10">
    <div className="w-full max-w-[420px]">
      <div className="mb-6 flex justify-center">
        <Wordmark />
      </div>
      <div className="rounded-2xl bg-surface px-6 py-8 shadow-[0_0_0_1px_var(--color-tone-200)] sm:px-10 sm:py-10">
        <div className="text-center">
          <Typography variant="h1">{title}</Typography>
          {subtitle && (
            <Typography color="text.secondary" className="mt-2 text-pretty">
              {subtitle}
            </Typography>
          )}
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  </main>
);

export default AuthLayout;
