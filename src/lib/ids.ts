const ID_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';
const TOKEN_ALPHABET =
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

function randomString(length: number, alphabet: string): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < length; i++) {
    out += alphabet[bytes[i]! % alphabet.length];
  }
  return out;
}

export function createNoteId(length: number): string {
  return randomString(length, ID_ALPHABET);
}

export function createDeleteToken(length: number): string {
  return randomString(length, TOKEN_ALPHABET);
}
