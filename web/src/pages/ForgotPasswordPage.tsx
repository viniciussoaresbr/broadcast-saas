import { useState, type FormEvent } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import TextField from '@mui/material/TextField'
import AuthLayout from '../layouts/AuthLayout'
import { sendPasswordReset } from '../services/auth-service'
import { getErrorMessage } from '../utils/errors'
import { validateEmail } from '../utils/validation'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [pending, setPending] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const invalidEmail = validateEmail(email)
    setEmailError(invalidEmail)
    if (invalidEmail) return

    setPending(true)
    setError(null)
    try {
      await sendPasswordReset(email)
      setSent(true)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthLayout
      title="Recuperar senha"
      subtitle="Enviaremos um link para você redefinir sua senha"
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        {error && <Alert severity="error">{error}</Alert>}
        {sent && (
          <Alert severity="success">
            Se houver uma conta com este e-mail, você receberá o link em instantes.
          </Alert>
        )}
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
        <Button type="submit" variant="contained" size="large" loading={pending}>
          Enviar link
        </Button>
        <Link component={RouterLink} to="/login" variant="body2" className="text-center">
          Voltar para o login
        </Link>
      </form>
    </AuthLayout>
  )
}

export default ForgotPasswordPage
