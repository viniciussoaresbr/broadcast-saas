import Checkbox from '@mui/material/Checkbox';
import FormHelperText from '@mui/material/FormHelperText';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import type {
  DeliveryMode,
  MessageFormErrors,
  MessageFormValues,
} from '../hooks/useMessageForm';
import type { Contact } from '../types';
import { toDateTimeLocalValue } from '../utils/date';
import { formatPhone } from '../utils/phone';
import { CONTENT_MAX_LENGTH } from '../utils/validation';

type MessageFieldsProps = {
  contacts: Contact[];
  values: MessageFormValues;
  errors: MessageFormErrors;
  onChange: (patch: Partial<MessageFormValues>) => void;
  disabled?: boolean;
  /** Prefix for element IDs, so two instances can coexist on a page. */
  idPrefix?: string;
};

const rowClass =
  'flex cursor-pointer items-center gap-2 py-1 pr-3 pl-1 transition-colors hover:bg-tone-50 has-[:disabled]:cursor-default';

/** Controlled fields shared by the composer and the edit dialog. */
const MessageFields = ({
  contacts,
  values,
  errors,
  onChange,
  disabled,
  idPrefix = 'message',
}: MessageFieldsProps) => {
  const selected = new Set(values.contactIds);
  const allSelected = contacts.length > 0 && selected.size === contacts.length;
  const ids = {
    recipientsError: `${idPrefix}-recipients-error`,
    delivery: `${idPrefix}-delivery`,
  };

  const toggleContact = (contactId: string) =>
    onChange({
      contactIds: selected.has(contactId)
        ? values.contactIds.filter(id => id !== contactId)
        : [...values.contactIds, contactId],
    });

  const toggleAll = () =>
    onChange({
      contactIds: allSelected ? [] : contacts.map(contact => contact.id),
    });

  return (
    <div className="flex flex-col gap-5">
      <fieldset
        className="m-0 flex min-w-0 flex-col border-0 p-0"
        disabled={disabled}
        aria-describedby={errors.contactIds ? ids.recipientsError : undefined}
      >
        <legend className="mb-2 flex w-full items-baseline justify-between gap-2 p-0">
          <span className="text-sm font-medium text-ink">Destinatários</span>
          <span className="tabular text-[0.8125rem] text-muted">
            {selected.size} de {contacts.length}
          </span>
        </legend>
        <div
          className={`max-h-64 overflow-y-auto overscroll-contain rounded-lg bg-surface ${
            errors.contactIds
              ? 'shadow-[0_0_0_1.5px_var(--mui-palette-error-main)]'
              : 'shadow-[0_0_0_1px_var(--color-tone-300)]'
          }`}
        >
          <label
            className={`${rowClass} sticky top-0 z-[1] bg-surface shadow-[0_1px_0_var(--color-tone-200)]`}
          >
            <Checkbox
              size="small"
              checked={allSelected}
              indeterminate={selected.size > 0 && !allSelected}
              onChange={toggleAll}
              disabled={disabled}
            />
            <span className="text-sm font-medium text-ink">
              Selecionar todos
            </span>
          </label>
          {contacts.map(contact => (
            <label key={contact.id} className={rowClass}>
              <Checkbox
                size="small"
                checked={selected.has(contact.id)}
                onChange={() => toggleContact(contact.id)}
                disabled={disabled}
              />
              <span className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-3">
                <span className="min-w-0 truncate text-sm text-ink">
                  {contact.name}
                </span>
                <span className="tabular text-[0.8125rem] text-muted">
                  {formatPhone(contact.phone)}
                </span>
              </span>
            </label>
          ))}
        </div>
        {/* Always rendered so the error line doesn't shift the form. */}
        <FormHelperText
          id={ids.recipientsError}
          error={Boolean(errors.contactIds)}
          className="mt-1.5"
        >
          {errors.contactIds ?? ' '}
        </FormHelperText>
      </fieldset>

      <TextField
        label="Mensagem"
        name="message-content"
        value={values.content}
        onChange={event => onChange({ content: event.target.value })}
        error={Boolean(errors.content)}
        helperText={
          errors.content ??
          `${values.content.trim().length}/${CONTENT_MAX_LENGTH}`
        }
        disabled={disabled}
        multiline
        rows={4}
        required
        slotProps={{
          htmlInput: {
            className: 'resize-none',
            maxLength: CONTENT_MAX_LENGTH,
          },
          formHelperText: {
            className: errors.content ? '' : 'tabular text-right',
          },
        }}
      />

      <div className="flex flex-col gap-2">
        <span id={ids.delivery} className="text-sm font-medium text-ink">
          Quando enviar
        </span>
        <ToggleButtonGroup
          exclusive
          fullWidth
          size="small"
          value={values.mode}
          onChange={(_, mode: DeliveryMode | null) =>
            mode && onChange({ mode })
          }
          aria-labelledby={ids.delivery}
          disabled={disabled}
        >
          <ToggleButton value="now" className="gap-1.5">
            <SendOutlinedIcon sx={{ fontSize: 16 }} /> Agora
          </ToggleButton>
          <ToggleButton value="schedule" className="gap-1.5">
            <EventOutlinedIcon sx={{ fontSize: 16 }} /> Agendar
          </ToggleButton>
        </ToggleButtonGroup>
      </div>

      {values.mode === 'schedule' && (
        <TextField
          label="Data e horário"
          name="message-scheduled-at"
          type="datetime-local"
          value={values.scheduledAt}
          onChange={event => onChange({ scheduledAt: event.target.value })}
          error={Boolean(errors.scheduledAt)}
          helperText={
            // Hint and error share one grid cell, so the line keeps the height
            // of the taller text whichever one is visible.
            <span className="grid">
              <span
                className={`col-start-1 row-start-1 ${errors.scheduledAt ? 'invisible' : ''}`}
              >
                Horário local. O envio é processado em até cerca de 1 minuto
                após o horário.
              </span>
              <span
                className={`col-start-1 row-start-1 ${errors.scheduledAt ? '' : 'invisible'}`}
              >
                {errors.scheduledAt}
              </span>
            </span>
          }
          disabled={disabled}
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: {
              min: toDateTimeLocalValue(new Date()),
              className: 'tabular',
            },
          }}
          required
        />
      )}
    </div>
  );
};

export default MessageFields;
