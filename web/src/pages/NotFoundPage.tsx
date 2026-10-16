import { Link as RouterLink } from 'react-router-dom'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { Wordmark } from '../components/BrandMark'

const NotFoundPage = () => (
  <div className="flex min-h-dvh flex-col bg-surface px-6 py-8 sm:px-12">
    <Wordmark />
    <main className="flex flex-1 flex-col justify-center py-16">
      <div className="max-w-md">
        <Typography variant="h1" className="text-[1.75rem]">
          Página não encontrada
        </Typography>
        <Typography color="text.secondary" className="mt-2">
          O endereço acessado não existe ou foi movido.
        </Typography>
        <Button component={RouterLink} to="/" variant="contained" size="large" className="mt-8">
          Ir para o início
        </Button>
      </div>
    </main>
  </div>
)

export default NotFoundPage
