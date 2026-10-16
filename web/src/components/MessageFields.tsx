import Checkbox from '@mui/material/Checkbox'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormHelperText from '@mui/material/FormHelperText'
import FormLabel from '@mui/material/FormLabel'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import type { DeliveryMode, MessageFormErrors, MessageFormValues } from '../hooks/useMessageForm'
import type { Contact } from '../types'
import { toDateTimeLocalValue } from '../utils/date'
import { formatPhone } from '../utils/phone'
import { CONTENT_MAX_LENGTH } from '../utils/validation'

type MessageFieldsProps = {
  contacts: Contact[]
  values: MessageFormValues
  errors: MessageFormErrors
  onChange: (patch: Partial<MessageFormValues>) => void
  disabled?: boolean
}

/** Controlled fields shared by the composer and the edit dialog. */
const MessageFields = ({ contacts, values, errors, onChange, disabled }: MessageFieldsProps) => {
  const selected = new Set(values.contactIds)
  const allSelected = contacts.length > 0 && selected.size === contacts.length

  const toggleContact = (contactId: string) =>
    onChange({
      contactIds: selected.has(contactId)
        ? values.contactIds.filter((id) => id !== contactId)
        : [...values.contactIds, contactId],
    })

  const toggleAll = () =>
    onChange({ contactIds: allSelected ? [] : contacts.map((contact) => contact.id) })

  return (
    <div className="flex flex-col gap-5">
      <FormControl component="fieldset" error={Boolean(errors.contactIds)} disabled={disabled}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <FormLabel component="legend">Destinatários</FormLabel>
          <FormControlLabel
            label={`Selecionar todos (${selected.size}/${contacts.length})`}
            control={
              <Checkbox
                checked={allSelected}
                indeterminate={selected.size > 0 && !allSelected}
                onChange={toggleAll}
              />
            }
          />
        </div>
        <div className="max-h-60 overflow-y-auto rounded border border-slate-200 px-3 py-1">
          {contacts.map((contact) => (
            <FormControlLabel
              key={contact.id}
              className="flex w-full"
              control={
                <Checkbox
                  checked={selected.has(contact.id)}
                  onChange={() => toggleContact(contact.id)}
                />
              }
              label={
                <span className="flex flex-wrap gap-x-2">
                  <span className="break-all">{contact.name}</span>
                  <Typography component="span" variant="body2" color="text.secondary">
                    {formatPhone(contact.phone)}
                  </Typography>
                </span>
              }
            />
          ))}
        </div>
        {errors.contactIds && <FormHelperText>{errors.contactIds}</FormHelperText>}
      </FormControl>

      <TextField
        label="Mensagem"
        value={values.content}
        onChange={(event) => onChange({ content: event.target.value })}
        error={Boolean(errors.content)}
        helperText={errors.content ?? `${values.content.trim().length}/${CONTENT_MAX_LENGTH}`}
        disabled={disabled}
        multiline
        minRows={3}
        required
      />

      <FormControl component="fieldset" disabled={disabled}>
        <FormLabel component="legend">Envio</FormLabel>
        <RadioGroup
          row
          value={values.mode}
          onChange={(event) => onChange({ mode: event.target.value as DeliveryMode })}
        >
          <FormControlLabel value="now" control={<Radio />} label="Enviar agora" />
          <FormControlLabel value="schedule" control={<Radio />} label="Agendar" />
        </RadioGroup>
      </FormControl>

      {values.mode === 'schedule' && (
        <TextField
          label="Data e horário"
          type="datetime-local"
          value={values.scheduledAt}
          onChange={(event) => onChange({ scheduledAt: event.target.value })}
          error={Boolean(errors.scheduledAt)}
          helperText={
            errors.scheduledAt ??
            'Horário local. O envio é processado em até cerca de 1 minuto após o horário.'
          }
          disabled={disabled}
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: { min: toDateTimeLocalValue(new Date()) },
          }}
          className="sm:max-w-xs"
          required
        />
      )}
    </div>
  )
}

export default MessageFields
