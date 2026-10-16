import { useState, type FormEvent } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import AuthLayout from '../layouts/AuthLayout'
import { signIn } from '../services/auth-service'
import { getErrorMessage } from '../utils/errors'
import { validateEmail } from '../utils/validation'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const invalidEmail = validateEmail(email)
    setEmailError(invalidEmail)
    if (invalidEmail || !password) return

    setPending(true)
    setError(null)
    try {
      // On success, <PublicOnlyRoute> redirects to the private area.
      await signIn(email, password)
    } catch (err) {
      setError(getErrorMessage(err))
      setPending(false)
    }
  }

  return (
    <AuthLayout title="Entrar" subtitle="Acesse o painel de Broadcast">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="E-mail"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={Boolean(emailError)}
          helperText={emailError}
          required
          autoFocus
        />
        <TextField
          label="Senha"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <Link component={RouterLink} to="/forgot-password" variant="body2" className="self-end">
          Esqueci minha senha
        </Link>
        <Button type="submit" variant="contained" size="large" loading={pending}>
          Entrar
        </Button>
        <Typography variant="body2" className="text-center">
          Ainda não tem conta?{' '}
          <Link component={RouterLink} to="/register">
            Cadastre-se
          </Link>
        </Typography>
      </form>
    </AuthLayout>
  )
}

export default LoginPage
