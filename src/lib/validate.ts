import { NOTE_ID_LENGTH } from './constants';

const NOTE_ID_RE = new RegExp(`^[a-z0-9]{${NOTE_ID_LENGTH}}$`);

export function isValidNoteId(id: string | undefined): id is string {
  return typeof id === 'string' && NOTE_ID_RE.test(id);
}
