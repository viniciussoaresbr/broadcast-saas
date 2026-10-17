import { FirebaseError } from 'firebase/app';

const AUTH_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  // Retornado no lugar de invalid-credential sem a proteção contra enumeração (ex.: emulador).
  'auth/user-not-found': 'E-mail ou senha incorretos.',
  'auth/wrong-password': 'E-mail ou senha incorretos.',
  'auth/invalid-email': 'E-mail inválido.',
  'auth/user-disabled': 'Esta conta foi desativada.',
  'auth/email-already-in-use': 'Já existe uma conta com este e-mail.',
  'auth/weak-password': 'A senha é muito fraca.',
  'auth/too-many-requests':
    'Muitas tentativas. Aguarde um pouco e tente novamente.',
  'auth/network-request-failed': 'Falha de conexão. Verifique sua internet.',
};

// Erros de callables cuja mensagem o backend escreve para o usuário.
const FUNCTION_CODES_WITH_USER_MESSAGE = new Set([
  'functions/invalid-argument',
  'functions/not-found',
  'functions/already-exists',
  'functions/failed-precondition',
  'functions/unauthenticated',
]);

const GENERIC_MESSAGE = 'Algo deu errado. Tente novamente.';

export const getErrorMessage = (error: unknown): string => {
  if (!(error instanceof FirebaseError)) return GENERIC_MESSAGE;
  if (AUTH_MESSAGES[error.code]) return AUTH_MESSAGES[error.code];
  if (FUNCTION_CODES_WITH_USER_MESSAGE.has(error.code)) {
    // O SDK acrescenta o status HTTP, ex.: "Conexão não encontrada. [404]".
    return error.message.replace(/\s*\[\d{3}\]$/, '');
  }
  if (error.code === 'permission-denied')
    return 'Você não tem permissão para acessar estes dados.';
  if (error.code === 'unavailable' || error.code === 'functions/unavailable') {
    return 'Serviço indisponível. Verifique sua conexão.';
  }
  return GENERIC_MESSAGE;
};
