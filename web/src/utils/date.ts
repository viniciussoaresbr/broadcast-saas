const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

export const formatDateTime = (date: Date | null): string =>
  date ? dateTimeFormatter.format(date) : '—'

const pad = (value: number) => String(value).padStart(2, '0')

/** Value for `<input type="datetime-local">`, in the browser's time zone. */
export const toDateTimeLocalValue = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
  `T${pad(date.getHours())}:${pad(date.getMinutes())}`

/** A `datetime-local` value without offset is parsed as local time. */
export const parseDateTimeLocal = (value: string): Date | null => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}
