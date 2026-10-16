/** Area code + 11 digits, keeping only what the mask needs. */
export const phoneDigits = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  // Accept pasted numbers that include the +55 country code.
  const local =
    digits.length > 11 && digits.startsWith('55') ? digits.slice(2) : digits;
  return local.slice(0, 11);
};

/** Formats as the user types: (11) 91234-5678 */
export const formatPhoneInput = (value: string): string => {
  const digits = phoneDigits(value);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

/** Brazilian mobile: area code without zeros, then 9 + 8 digits. */
export const isValidPhone = (value: string): boolean =>
  /^[1-9]{2}9\d{8}$/.test(phoneDigits(value));

export const toE164 = (value: string): string => `+55${phoneDigits(value)}`;

export const formatPhone = (e164: string): string =>
  formatPhoneInput(e164.replace(/^\+55/, ''));
