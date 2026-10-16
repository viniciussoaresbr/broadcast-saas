import { useState, type FormEvent } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import PasswordField from '../components/PasswordField';
import { useAsyncAction } from '../hooks/useAsyncAction';
import AuthLayout from '../layouts/AuthLayout';
import { signIn } from '../services/auth-service';
import { validateEmail } from '../utils/validation';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const { pending, error, run } = useAsyncAction();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const invalidEmail = validateEmail(email);
    const missingPassword = password ? null : 'Informe a senha.';
    setEmailError(invalidEmail);
    setPasswordError(missingPassword);
    if (invalidEmail || missingPassword) return;

    // On success, <PublicOnlyRoute> redirects to the private area.
    await run(() => signIn(email, password));
  };

  return (
    <AuthLayout
      title="Entrar"
      subtitle="Acesse suas conexões, contatos e envios."
    >
      <form className="flex flex-col gap-2" onSubmit={handleSubmit} noValidate>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="E-mail"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={event => {
            setEmail(event.target.value);
            // Re-check while typing only once an error is showing, to clear it.
            if (emailError) setEmailError(validateEmail(event.target.value));
          }}
          onBlur={() => email && setEmailError(validateEmail(email))}
          error={Boolean(emailError)}
          helperText={emailError ?? ' '}
          required
          autoFocus
        />
        <div className="flex flex-col gap-1.5">
          <PasswordField
            label="Senha"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            error={Boolean(passwordError)}
            helperText={passwordError ?? ' '}
            required
          />
          <Link
            component={RouterLink}
            to="/forgot-password"
            variant="body2"
            className="self-end"
          >
            Esqueci minha senha
          </Link>
        </div>
        <Button
          type="submit"
          variant="contained"
          size="large"
          loading={pending}
          className="mt-2"
        >
          Entrar
        </Button>
        <Typography
          variant="body2"
          color="text.secondary"
          className="mt-2 text-center"
        >
          Ainda não tem conta?{' '}
          <Link component={RouterLink} to="/register">
            Criar conta
          </Link>
        </Typography>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
