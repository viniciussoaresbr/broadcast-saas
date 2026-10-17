import { HttpsError } from 'firebase-functions/v2/https';
import { z } from 'zod';

export const NAME_MAX_LENGTH = 60;
export const CONTENT_MAX_LENGTH = 1000;
export const MAX_RECIPIENTS = 500;
export const MAX_SCHEDULE_AHEAD_MS = 365 * 24 * 60 * 60 * 1000;

// Celular brasileiro: +55, DDD e 9 + 8 dígitos.
const PHONE_PATTERN = /^\+55[1-9]{2}9\d{8}$/;

const id = (field: string) => {
  const message = `Campo "${field}" inválido.`;
  return z.string({ error: message }).regex(/^[A-Za-z0-9_-]{1,128}$/, message);
};

const name = z
  .string({ error: 'Informe o nome.' })
  .trim()
  .min(1, 'Informe o nome.')
  .max(NAME_MAX_LENGTH, `O nome deve ter até ${NAME_MAX_LENGTH} caracteres.`);

const phone = z
  .string({ error: 'Telefone inválido.' })
  .regex(
    PHONE_PATTERN,
    'Telefone inválido. Use um celular brasileiro com DDD.',
  );

const content = z
  .string({ error: 'Escreva a mensagem.' })
  .trim()
  .min(1, 'Escreva a mensagem.')
  .max(
    CONTENT_MAX_LENGTH,
    `A mensagem deve ter até ${CONTENT_MAX_LENGTH} caracteres.`,
  );

const contactIds = z
  .array(id('contactIds'), { error: 'Selecione ao menos um contato.' })
  .min(1, 'Selecione ao menos um contato.')
  .max(MAX_RECIPIENTS, `Selecione até ${MAX_RECIPIENTS} contatos.`)
  .transform(ids => [...new Set(ids)]);

// `null` significa "enviar agora"; um número é o horário agendado em epoch (ms).
const scheduledAt = (now: number) =>
  z
    .number({ error: 'Data de agendamento inválida.' })
    .refine(value => value > now, 'A data de agendamento deve estar no futuro.')
    .refine(
      value => value <= now + MAX_SCHEDULE_AHEAD_MS,
      'Agende para no máximo 1 ano à frente.',
    )
    .nullish()
    .transform(value => value ?? null);

const payload = <Shape extends z.ZodRawShape>(shape: Shape) =>
  z.object(shape, { error: 'Dados inválidos.' });

export const connectionIdSchema = payload({
  connectionId: id('connectionId'),
});

export const createContactSchema = payload({
  connectionId: id('connectionId'),
  name,
  phone,
});

export const updateContactSchema = payload({
  contactId: id('contactId'),
  name,
  phone,
});

export const contactIdSchema = payload({ contactId: id('contactId') });

export const createMessageSchema = (now: number) =>
  payload({
    connectionId: id('connectionId'),
    contactIds,
    content,
    scheduledAt: scheduledAt(now),
  });

export const updateMessageSchema = (now: number) =>
  payload({
    messageId: id('messageId'),
    contactIds,
    content,
    scheduledAt: scheduledAt(now),
  });

export const messageIdSchema = payload({ messageId: id('messageId') });

// O primeiro erro vira um `invalid-argument` com mensagem exibida ao usuário.
export const parse = <Schema extends z.ZodType>(
  schema: Schema,
  data: unknown,
): z.output<Schema> => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new HttpsError('invalid-argument', result.error.issues[0].message);
  }
  return result.data;
};
