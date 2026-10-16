import type { ReactNode } from 'react'
import Typography from '@mui/material/Typography'
import { Wordmark } from '../components/BrandMark'

type AuthLayoutProps = {
  title: string
  subtitle?: string
  children: ReactNode
}

/** Concentric waves from the lamp in the corner: the brand mark, enlarged. */
const SignalWaves = () => (
  <svg
    aria-hidden
    viewBox="0 0 600 600"
    className="pointer-events-none absolute -bottom-24 -left-24 w-[680px] max-w-none text-white"
  >
    {[90, 170, 250, 330, 410].map((radius, index) => (
      <circle
        key={radius}
        cx="160"
        cy="440"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity={0.22 - index * 0.035}
      />
    ))}
    <circle cx="160" cy="440" r="34" fill="currentColor" opacity="0.9" />
  </svg>
)

const AuthLayout = ({ title, subtitle, children }: AuthLayoutProps) => (
  <div className="grid min-h-dvh bg-surface lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
    <main className="flex flex-col px-6 py-8 sm:px-12 lg:px-16">
      <Wordmark />
      <div className="flex flex-1 items-center py-10">
        <div className="w-full max-w-[380px]">
          <Typography variant="h1" className="text-[1.75rem]">
            {title}
          </Typography>
          {subtitle && (
            <Typography color="text.secondary" className="mt-2">
              {subtitle}
            </Typography>
          )}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </main>

    <aside className="relative m-3 hidden overflow-hidden rounded-2xl bg-signal p-14 text-white lg:flex lg:flex-col lg:justify-end">
      <SignalWaves />
      <div className="relative ml-auto max-w-md">
        <p className="m-0 text-[2.5rem] leading-[1.05] font-semibold tracking-[-0.03em] text-balance">
          Uma mensagem, todos os seus contatos.
        </p>
        <p className="mt-5 mb-0 text-base leading-relaxed text-white/85">
          Escreva uma vez, escolha quem recebe e envie agora ou na hora marcada. O agendamento roda
          no servidor, mesmo com esta aba fechada.
        </p>
      </div>
    </aside>
  </div>
)

export default AuthLayout
