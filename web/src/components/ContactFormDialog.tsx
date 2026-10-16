import { useState } from 'react'
import TextField from '@mui/material/TextField'
import { useAsyncAction } from '../hooks/useAsyncAction'
import { formatPhone, formatPhoneInput, toE164 } from '../utils/phone'
import { NAME_MAX_LENGTH, validateName, validatePhone } from '../utils/validation'
import FormDialog from './FormDialog'

export type ContactFormValues = { name: string; phone: string }

type ContactFormDialogProps = {
  open: boolean
  /** Existing contact (phone in E.164) when editing. */
  initialValues?: ContactFormValues
  /** Receives the phone already normalized to E.164. */
  onSave: (values: ContactFormValues) => Promise<unknown>
  onClose: () => void
}

/** Mount with a `key` per edited item so the form starts from its values. */
const ContactFormDialog = ({ open, initialValues, onSave, onClose }: ContactFormDialogProps) => {
  const [name, setName] = useState(initialValues?.name ?? '')
  const [phone, setPhone] = useState(initialValues ? formatPhone(initialValues.phone) : '')
  const [errors, setErrors] = useState<{ name?: string | null; phone?: string | null }>({})
  const { pending, error, run } = useAsyncAction()

  const submit = async () => {
    const validation = { name: validateName(name), phone: validatePhone(phone) }
    setErrors(validation)
    if (validation.name || validation.phone) return
    if (await run(() => onSave({ name: name.trim(), phone: toE164(phone) }))) onClose()
  }

  return (
    <FormDialog
      open={open}
      title={initialValues ? 'Editar contato' : 'Novo contato'}
      submitLabel={initialValues ? 'Salvar' : 'Adicionar'}
      pending={pending}
      error={error}
      onSubmit={submit}
      onClose={onClose}
    >
      <TextField
        label="Nome"
        value={name}
        onChange={(event) => setName(event.target.value)}
        error={Boolean(errors.name)}
        helperText={errors.name}
        slotProps={{ htmlInput: { maxLength: NAME_MAX_LENGTH + 10 } }}
        required
        autoFocus
      />
      <TextField
        label="Celular"
        placeholder="(11) 91234-5678"
        value={phone}
        onChange={(event) => setPhone(formatPhoneInput(event.target.value))}
        error={Boolean(errors.phone)}
        helperText={errors.phone ?? 'Celular brasileiro com DDD.'}
        slotProps={{ htmlInput: { inputMode: 'tel', autoComplete: 'tel-national' } }}
        required
      />
    </FormDialog>
  )
}

export default ContactFormDialog
