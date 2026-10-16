import CircularProgress from '@mui/material/CircularProgress';
import BrandMark from './BrandMark';

const FullPageLoader = () => (
  <div
    className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-ground"
    role="status"
    aria-live="polite"
  >
    <BrandMark size={40} />
    <CircularProgress
      size={20}
      thickness={5}
      aria-label="Carregando"
      sx={{ color: 'text.secondary' }}
    />
  </div>
);

export default FullPageLoader;
