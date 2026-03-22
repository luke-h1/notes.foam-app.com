/** Max UTF-8 length stored per note (Cloudflare Worker memory / practical limit). */
export const MAX_NOTE_BYTES = 256 * 1024;

export const NOTE_ID_LENGTH = 10;
export const DELETE_TOKEN_LENGTH = 32;

export const HISTORY_KEY = 'foam-note-history';
export const PREFS_KEY = 'foam-note-prefs';
