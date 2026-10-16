import { createTheme } from '@mui/material/styles'
import { ptBR } from '@mui/material/locale'

export const theme = createTheme(
  {
    palette: {
      mode: 'light',
      primary: { main: '#1d4ed8' },
    },
    shape: { borderRadius: 8 },
    typography: {
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    },
    components: {
      MuiButton: { defaultProps: { disableElevation: true } },
    },
  },
  ptBR,
)
