import {HttpsError} from "firebase-functions/v2/https";

export const NAME_MAX_LENGTH = 60;
export const CONTENT_MAX_LENGTH = 1000;

// Brazilian mobile number in E.164: +55, two-digit area code, 9 + 8 digits.
const PHONE_PATTERN = /^\+55[1-9]{2}9\d{8}$/;

type Payload = Record<string, unknown>;

const invalid = (message: string): never => {
  throw new HttpsError("invalid-argument", message);
};

export const asPayload = (data: unknown): Payload =>
  typeof data === "object" && data !== null && !Array.isArray(data) ?
    (data as Payload) :
    invalid("Dados inválidos.");

export const parseId = (value: unknown, field: string): string =>
  typeof value === "string" && /^[A-Za-z0-9_-]{1,128}$/.test(value) ?
    value :
    invalid(`Campo "${field}" inválido.`);

export const parseName = (value: unknown): string => {
  const name = typeof value === "string" ? value.trim() : "";
  if (name.length === 0) return invalid("Informe o nome.");
  if (name.length > NAME_MAX_LENGTH) {
    return invalid(`O nome deve ter até ${NAME_MAX_LENGTH} caracteres.`);
  }
  return name;
};

export const parsePhone = (value: unknown): string =>
  typeof value === "string" && PHONE_PATTERN.test(value) ?
    value :
    invalid("Telefone inválido. Use um celular brasileiro com DDD.");

export const parseContent = (value: unknown): string => {
  const content = typeof value === "string" ? value.trim() : "";
  if (content.length === 0) return invalid("Escreva a mensagem.");
  if (content.length > CONTENT_MAX_LENGTH) {
    return invalid(
      `A mensagem deve ter até ${CONTENT_MAX_LENGTH} caracteres.`,
    );
  }
  return content;
};

export const parseContactIds = (value: unknown): string[] => {
  if (!Array.isArray(value) || value.length === 0) {
    return invalid("Selecione ao menos um contato.");
  }
  const ids = value.map((id) => parseId(id, "contactIds"));
  return [...new Set(ids)];
};

/**
 * `null` means "send now"; a number is the scheduled time in epoch millis
 * and must be in the future.
 */
export const parseScheduledAt = (
  value: unknown,
  now: number,
): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return invalid("Data de agendamento inválida.");
  }
  if (value <= now) {
    return invalid("A data de agendamento deve estar no futuro.");
  }
  return value;
};
