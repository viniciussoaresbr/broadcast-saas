import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from '@mui/material/GlobalStyles';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import '@fontsource-variable/geist';
import './index.css';
import App from './App.tsx';
import AuthProvider from './components/AuthProvider.tsx';
import FeedbackProvider from './components/FeedbackProvider.tsx';
import { theme } from './theme.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StyledEngineProvider enableCssLayer>
      <GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <FeedbackProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </FeedbackProvider>
        </AuthProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  </StrictMode>,
);
