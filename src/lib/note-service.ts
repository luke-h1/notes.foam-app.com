import type { D1Database } from '@cloudflare/workers-types';

import {
  createDeleteToken,
  createNoteId,
} from './ids';
import {
  DELETE_TOKEN_LENGTH,
  MAX_NOTE_BYTES,
  NOTE_ID_LENGTH,
} from './constants';

export type NoteRow = {
  id: string;
  content: string;
  created_at: number;
};

function utf8ByteLength(text: string): number {
  return new TextEncoder().encode(text).byteLength;
}

export async function createNote(
  db: D1Database,
  content: string,
): Promise<{ id: string; deleteToken: string } | { error: string; status: number }> {
  const trimmed = content.trim();
  if (!trimmed) {
    return { error: 'Note cannot be empty', status: 400 };
  }
  if (utf8ByteLength(trimmed) > MAX_NOTE_BYTES) {
    return {
      error: `Note exceeds maximum size of ${MAX_NOTE_BYTES} bytes`,
      status: 413,
    };
  }

  for (let attempt = 0; attempt < 8; attempt++) {
    const id = createNoteId(NOTE_ID_LENGTH);
    const deleteToken = createDeleteToken(DELETE_TOKEN_LENGTH);
    const createdAt = Date.now();
    try {
      await db
        .prepare(
          `INSERT INTO notes (id, content, created_at, delete_token) VALUES (?, ?, ?, ?)`,
        )
        .bind(id, trimmed, createdAt, deleteToken)
        .run();
      return { id, deleteToken };
    } catch {
      // Rare id or delete_token collision; retry
    }
  }
  return { error: 'Could not allocate a unique id', status: 503 };
}

export async function getNote(
  db: D1Database,
  id: string,
): Promise<NoteRow | null> {
  const row = await db
    .prepare(
      `SELECT id, content, created_at FROM notes WHERE id = ?`,
    )
    .bind(id)
    .first<NoteRow>();
  return row ?? null;
}

export async function deleteNote(
  db: D1Database,
  id: string,
  deleteToken: string,
): Promise<'ok' | 'not_found' | 'forbidden'> {
  const existing = await db
    .prepare(`SELECT delete_token FROM notes WHERE id = ?`)
    .bind(id)
    .first<{ delete_token: string }>();
  if (!existing) return 'not_found';
  if (existing.delete_token !== deleteToken) return 'forbidden';
  await db.prepare(`DELETE FROM notes WHERE id = ?`).bind(id).run();
  return 'ok';
}
