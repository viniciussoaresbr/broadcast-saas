import { useState, type FormEvent } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import { useAsyncAction } from '../hooks/useAsyncAction';
import AuthLayout from '../layouts/AuthLayout';
import { sendPasswordReset } from '../services/auth-service';
import { validateEmail } from '../utils/validation';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const { pending, error, run } = useAsyncAction();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const invalidEmail = validateEmail(email);
    setEmailError(invalidEmail);
    if (invalidEmail) return;

    if (await run(() => sendPasswordReset(email))) setSent(true);
  };

  return (
    <AuthLayout
      title="Recuperar senha"
      subtitle="Informe o e-mail da sua conta e enviaremos um link para criar uma nova senha."
    >
      <form className="flex flex-col gap-2" onSubmit={handleSubmit} noValidate>
        {error && <Alert severity="error">{error}</Alert>}
        {sent && (
          <Alert severity="success">
            Se houver uma conta com este e-mail, você receberá o link em
            instantes.
          </Alert>
        )}
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
        <Button
          type="submit"
          variant="contained"
          size="large"
          loading={pending}
          className="mt-2"
        >
          Enviar link
        </Button>
        <Link
          component={RouterLink}
          to="/login"
          variant="body2"
          className="mt-2 self-center"
        >
          Voltar para o login
        </Link>
      </form>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
