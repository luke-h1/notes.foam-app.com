import type { APIRoute } from 'astro';

import { env } from 'cloudflare:workers';

import { deleteNote, getNote } from '../../../lib/note-service';
import { isValidNoteId } from '../../../lib/validate';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const id = params.id;
  if (!isValidNoteId(id)) {
    return Response.json({ error: 'Invalid note id' }, { status: 400 });
  }

  const note = await getNote(env.DB, id);
  if (!note) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  return Response.json({
    id: note.id,
    content: note.content,
    createdAt: note.created_at,
  });
};

export const DELETE: APIRoute = async ({ params, request }) => {
  const id = params.id;
  if (!isValidNoteId(id)) {
    return Response.json({ error: 'Invalid note id' }, { status: 400 });
  }

  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  if (!token) {
    return Response.json(
      { error: 'Missing delete token (query param "token")' },
      { status: 400 },
    );
  }

  const outcome = await deleteNote(env.DB, id, token);
  if (outcome === 'not_found') {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
  if (outcome === 'forbidden') {
    return Response.json({ error: 'Invalid delete token' }, { status: 403 });
  }

  return new Response(null, { status: 204 });
};
