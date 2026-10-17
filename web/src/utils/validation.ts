import { z } from 'zod';
import { isValidPhone } from './phone';

// Manter em sincronia com functions/src/lib/validation.ts e firestore.rules.
export const NAME_MAX_LENGTH = 60;
export const CONTENT_MAX_LENGTH = 1000;
export const PASSWORD_MIN_LENGTH = 6;
export const MAX_RECIPIENTS = 500;
export const MAX_SCHEDULE_AHEAD_MS = 365 * 24 * 60 * 60 * 1000;

// Cada validador retorna a mensagem de erro, ou `null` se o valor for válido.
export type Validator<T> = (value: T) => string | null;

const fromSchema =
  <T>(schema: z.ZodType): Validator<T> =>
  value => {
    const result = schema.safeParse(value);
    return result.success ? null : result.error.issues[0].message;
  };

export const validateName = fromSchema<string>(
  z
    .string()
    .trim()
    .min(1, 'Informe o nome.')
    .max(NAME_MAX_LENGTH, `Use até ${NAME_MAX_LENGTH} caracteres.`),
);

export const validatePhone = fromSchema<string>(
  z.string().refine(isValidPhone, 'Informe um celular válido com DDD.'),
);

export const validateEmail = fromSchema<string>(
  z.string().trim().pipe(z.email('Informe um e-mail válido.')),
);

export const validatePassword = fromSchema<string>(
  z
    .string()
    .min(
      PASSWORD_MIN_LENGTH,
      `A senha deve ter ao menos ${PASSWORD_MIN_LENGTH} caracteres.`,
    ),
);

export const validateContent = fromSchema<string>(
  z
    .string()
    .trim()
    .min(1, 'Escreva a mensagem.')
    .max(
      CONTENT_MAX_LENGTH,
      `A mensagem deve ter até ${CONTENT_MAX_LENGTH} caracteres.`,
    ),
);

export const validateRecipients = fromSchema<string[]>(
  z
    .array(z.string())
    .min(1, 'Selecione ao menos um contato.')
    .max(MAX_RECIPIENTS, `Selecione até ${MAX_RECIPIENTS} contatos.`),
);

export const latestScheduleDate = (now = new Date()): Date =>
  new Date(now.getTime() + MAX_SCHEDULE_AHEAD_MS);

// Data futura, no máximo 1 ano à frente de `now`.
export const validateScheduledAt = (
  value: Date | null,
  now = new Date(),
): string | null =>
  fromSchema<Date | null>(
    z
      .date({ error: 'Informe a data e o horário.' })
      .refine(
        date => date.getTime() > now.getTime(),
        'Escolha uma data e um horário no futuro.',
      )
      .refine(
        date => date <= latestScheduleDate(now),
        'Agende para no máximo 1 ano à frente.',
      ),
  )(value);
