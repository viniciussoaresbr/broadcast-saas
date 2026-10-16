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
import { signUp } from '../services/auth-service';
import {
  PASSWORD_MIN_LENGTH,
  validateEmail,
  validateName,
  validatePassword,
} from '../utils/validation';

type Fields = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};
type FieldErrors = Partial<Record<keyof Fields, string | null>>;

const validate = (fields: Fields): FieldErrors => ({
  name: validateName(fields.name),
  email: validateEmail(fields.email),
  password: validatePassword(fields.password),
  confirmPassword:
    fields.password === fields.confirmPassword
      ? null
      : 'As senhas não conferem.',
});

const RegisterPage = () => {
  const [fields, setFields] = useState<Fields>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const { pending, error, run } = useAsyncAction();

  const setField = (name: keyof Fields) => (value: string) =>
    setFields(current => ({ ...current, [name]: value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validate(fields);
    setErrors(validation);
    if (Object.values(validation).some(Boolean)) return;

    // On success, <PublicOnlyRoute> redirects to the private area.
    await run(() => signUp(fields));
  };

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Comece a organizar seus contatos e envios em minutos."
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="Nome"
          name="name"
          autoComplete="name"
          value={fields.name}
          onChange={event => setField('name')(event.target.value)}
          error={Boolean(errors.name)}
          helperText={errors.name}
          required
          autoFocus
        />
        <TextField
          label="E-mail"
          name="email"
          type="email"
          autoComplete="email"
          value={fields.email}
          onChange={event => setField('email')(event.target.value)}
          error={Boolean(errors.email)}
          helperText={errors.email}
          required
        />
        <PasswordField
          label="Senha"
          name="new-password"
          autoComplete="new-password"
          value={fields.password}
          onChange={event => setField('password')(event.target.value)}
          error={Boolean(errors.password)}
          helperText={
            errors.password ?? `Mínimo de ${PASSWORD_MIN_LENGTH} caracteres.`
          }
          required
        />
        <PasswordField
          label="Confirmar senha"
          name="confirm-password"
          autoComplete="new-password"
          value={fields.confirmPassword}
          onChange={event => setField('confirmPassword')(event.target.value)}
          error={Boolean(errors.confirmPassword)}
          helperText={errors.confirmPassword}
          required
        />
        <Button
          type="submit"
          variant="contained"
          size="large"
          loading={pending}
          className="mt-2"
        >
          Criar conta
        </Button>
        <Typography variant="body2" color="text.secondary" className="mt-2">
          Já tem conta?{' '}
          <Link component={RouterLink} to="/login">
            Entrar
          </Link>
        </Typography>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
