import { useState } from 'react'
import type { Message, MessageInput } from '../types'
import { parseDateTimeLocal, toDateTimeLocalValue } from '../utils/date'
import { validateContent, validateRecipients, validateScheduledAt } from '../utils/validation'

export type DeliveryMode = 'now' | 'schedule'

export type MessageFormValues = {
  contactIds: string[]
  content: string
  mode: DeliveryMode
  /** `datetime-local` input value, in the browser's time zone. */
  scheduledAt: string
}

export type MessageFormErrors = Partial<Record<'contactIds' | 'content' | 'scheduledAt', string>>

const EMPTY_VALUES: MessageFormValues = {
  contactIds: [],
  content: '',
  mode: 'now',
  scheduledAt: '',
}

export const valuesFromMessage = (message: Message): MessageFormValues => ({
  contactIds: message.contactIds,
  content: message.content,
  mode: message.status === 'scheduled' ? 'schedule' : 'now',
  scheduledAt: message.scheduledAt ? toDateTimeLocalValue(message.scheduledAt) : '',
})

const validate = (values: MessageFormValues): MessageFormErrors => {
  const scheduledError =
    values.mode === 'schedule'
      ? validateScheduledAt(parseDateTimeLocal(values.scheduledAt))
      : null
  const errors: MessageFormErrors = {
    contactIds: validateRecipients(values.contactIds) ?? undefined,
    content: validateContent(values.content) ?? undefined,
    scheduledAt: scheduledError ?? undefined,
  }
  return Object.fromEntries(Object.entries(errors).filter(([, error]) => error))
}

const toInput = (values: MessageFormValues): MessageInput => ({
  contactIds: values.contactIds,
  content: values.content.trim(),
  scheduledAt: values.mode === 'schedule' ? parseDateTimeLocal(values.scheduledAt) : null,
})

/**
 * Form state for creating or editing a message. `submit` validates and
 * returns the input to send, or null when the form has errors.
 * `availableContactIds` drops selections of contacts that no longer exist.
 */
export const useMessageForm = (
  availableContactIds: string[],
  initialValues: MessageFormValues = EMPTY_VALUES,
) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<MessageFormErrors>({})

  const available = new Set(availableContactIds)
  const currentValues = {
    ...values,
    contactIds: values.contactIds.filter((id) => available.has(id)),
  }

  const change = (patch: Partial<MessageFormValues>) => {
    setValues((current) => ({ ...current, ...patch }))
    // Clear the error of each field the user touched.
    setErrors((current) => {
      const next = { ...current }
      Object.keys(patch).forEach((field) => delete next[field as keyof MessageFormErrors])
      return next
    })
  }

  const submit = (): MessageInput | null => {
    const validation = validate(currentValues)
    setErrors(validation)
    return Object.keys(validation).length === 0 ? toInput(currentValues) : null
  }

  const reset = () => {
    setValues(EMPTY_VALUES)
    setErrors({})
  }

  return { values: currentValues, errors, change, submit, reset }
}
