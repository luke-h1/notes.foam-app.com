export const MAX_NOTE_BYTES = 256 * 1024;

export const MAX_JSON_BODY_BYTES = MAX_NOTE_BYTES + 16_384;

export const NOTE_ID_LENGTH = 16;
export const DELETE_TOKEN_LENGTH = 32;

export const RATE_LIMIT_NOTE_READ_WINDOW_MS = 60_000;
export const RATE_LIMIT_NOTE_READ_MAX = 120;
export const RATE_LIMIT_NOTE_CREATE_WINDOW_MS = 60_000;
export const RATE_LIMIT_NOTE_CREATE_MAX = 30;

export const HISTORY_KEY = "foam-note-history";
export const PREFS_KEY = "foam-note-prefs";
