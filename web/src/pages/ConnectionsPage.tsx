import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import type { Theme } from '@mui/material/styles'
import AddIcon from '@mui/icons-material/Add'
import ConnectionDialogs, { type ConnectionDialogState } from '../components/ConnectionDialogs'
import ConnectionNav from '../components/ConnectionNav'
import ListSkeleton from '../components/ListSkeleton'
import { useConnections } from '../hooks/useData'
import { getErrorMessage } from '../utils/errors'

const STEPS = [
  { title: 'Crie uma conexão', text: 'Ela agrupa contatos e mensagens de um mesmo canal, como uma loja ou campanha.' },
  { title: 'Cadastre os contatos', text: 'Nome e celular com DDD de cada pessoa que vai receber as mensagens.' },
  { title: 'Envie ou agende', text: 'Escreva uma vez, escolha os destinatários e envie agora ou na hora marcada.' },
]

/** Desktop: the list lives in the sidebar, so this is the starting point. */
const ConnectionsOverview = () => {
  const connections = useConnections()
  const [dialog, setDialog] = useState<ConnectionDialogState>(null)

  if (connections.loading) return <ListSkeleton label="Carregando conexões" />

  const hasConnections = (connections.data?.length ?? 0) > 0

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-10 py-10">
      <div>
        <Typography variant="h1">{hasConnections ? 'Escolha uma conexão' : 'Comece pela primeira conexão'}</Typography>
        <Typography color="text.secondary" className="mt-2 max-w-prose">
          {hasConnections
            ? 'Selecione uma conexão na lista ao lado para ver os contatos e as mensagens, ou crie uma nova.'
            : 'Em três passos você já consegue enviar sua primeira mensagem.'}
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={() => setDialog({ type: 'create' })}
          className="mt-6"
        >
          Nova conexão
        </Button>
      </div>

      {!hasConnections && (
        <ol className="grid gap-3 sm:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.title} className="flex flex-col gap-1 rounded-xl bg-tone-100 p-4">
              <Typography variant="h3" component="h2">
                {step.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {step.text}
              </Typography>
            </li>
          ))}
        </ol>
      )}

      {connections.error && <Alert severity="error">{getErrorMessage(connections.error)}</Alert>}

      <ConnectionDialogs dialog={dialog} onClose={() => setDialog(null)} />
    </div>
  )
}

const ConnectionsPage = () => {
  const isDesktop = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'), { noSsr: true })
  return isDesktop ? <ConnectionsOverview /> : <ConnectionNav variant="page" />
}

export default ConnectionsPage
