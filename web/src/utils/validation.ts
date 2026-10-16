import { isValidPhone } from './phone'

// Keep in sync with functions/src/lib/validation.ts and firestore.rules.
export const NAME_MAX_LENGTH = 60
export const CONTENT_MAX_LENGTH = 1000
export const PASSWORD_MIN_LENGTH = 6

/** Each validator returns an error message, or null when the value is valid. */
export type Validator<T> = (value: T) => string | null

export const validateName: Validator<string> = (value) => {
  const name = value.trim()
  if (name.length === 0) return 'Informe o nome.'
  if (name.length > NAME_MAX_LENGTH) return `Use até ${NAME_MAX_LENGTH} caracteres.`
  return null
}

export const validatePhone: Validator<string> = (value) =>
  isValidPhone(value) ? null : 'Informe um celular válido com DDD, ex.: (11) 91234-5678.'

export const validateEmail: Validator<string> = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? null : 'Informe um e-mail válido.'

export const validatePassword: Validator<string> = (value) =>
  value.length >= PASSWORD_MIN_LENGTH
    ? null
    : `A senha deve ter ao menos ${PASSWORD_MIN_LENGTH} caracteres.`

export const validateContent: Validator<string> = (value) => {
  const content = value.trim()
  if (content.length === 0) return 'Escreva a mensagem.'
  if (content.length > CONTENT_MAX_LENGTH) return `Use até ${CONTENT_MAX_LENGTH} caracteres.`
  return null
}

export const validateRecipients: Validator<string[]> = (ids) =>
  ids.length > 0 ? null : 'Selecione ao menos um contato.'

export const validateScheduledAt = (value: Date | null, now = new Date()): string | null => {
  if (!value || Number.isNaN(value.getTime())) return 'Informe a data e o horário.'
  if (value.getTime() <= now.getTime()) return 'Escolha uma data e um horário no futuro.'
  return null
}
