const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

export const formatDateTime = (date: Date | null): string =>
  date ? dateTimeFormatter.format(date) : '—';

const pad = (value: number) => String(value).padStart(2, '0');

/** Value for `<input type="datetime-local">`, in the browser's time zone. */
export const toDateTimeLocalValue = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
  `T${pad(date.getHours())}:${pad(date.getMinutes())}`;

/** A `datetime-local` value without offset is parsed as local time. */
export const parseDateTimeLocal = (value: string): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' });

export const formatDate = (date: Date | null): string =>
  date ? dateFormatter.format(date) : '—';

const timeFormatter = new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short' });
const dayMonthFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: 'numeric',
  month: 'short',
});
const fullDayFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** Short, relative-aware label: "Hoje, 17:01", "Amanhã, 09:00", "20 de dez., 10:30". */
export const formatRelativeDateTime = (
  date: Date | null,
  now = new Date(),
): string => {
  if (!date) return '—';
  const days = Math.round(
    (startOfDay(date).getTime() - startOfDay(now).getTime()) / 86_400_000,
  );
  const time = timeFormatter.format(date);
  if (days === 0) return `Hoje, ${time}`;
  if (days === -1) return `Ontem, ${time}`;
  if (days === 1) return `Amanhã, ${time}`;
  const day =
    date.getFullYear() === now.getFullYear()
      ? dayMonthFormatter
      : fullDayFormatter;
  return `${day.format(date)}, ${time}`;
};
