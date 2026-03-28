import { DELETE_TOKEN_LENGTH, NOTE_ID_LENGTH } from './constants';

const NOTE_ID_RE = new RegExp(`^[a-z0-9]{${NOTE_ID_LENGTH}}$`);

const DELETE_TOKEN_MAX_CHARS = 128;

export function isValidNoteId(id: string | undefined): id is string {
  return typeof id === 'string' && NOTE_ID_RE.test(id);
}

export function isValidDeleteToken(token: string | null): token is string {
  if (token === null || token === '') {return false;}
  if (token.length > DELETE_TOKEN_MAX_CHARS) {return false;}
  if (token.length !== DELETE_TOKEN_LENGTH) {return false;}
  return /^[A-Za-z0-9]+$/.test(token);
}
