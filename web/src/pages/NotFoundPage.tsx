import { Link as RouterLink } from 'react-router-dom'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

const NotFoundPage = () => (
  <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
    <Typography variant="h4" component="h1" className="font-semibold">
      Página não encontrada
    </Typography>
    <Typography color="text.secondary">O endereço acessado não existe.</Typography>
    <Button component={RouterLink} to="/" variant="contained">
      Ir para o início
    </Button>
  </main>
)

export default NotFoundPage
