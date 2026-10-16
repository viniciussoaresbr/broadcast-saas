import CircularProgress from '@mui/material/CircularProgress'

const FullPageLoader = () => (
  <div className="flex min-h-screen items-center justify-center" role="status" aria-live="polite">
    <CircularProgress aria-label="Carregando" />
  </div>
)

export default FullPageLoader
