import type { APIRoute } from 'astro';

import { env } from 'cloudflare:workers';

import { createNote } from '../../lib/note-service';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (
    !body ||
    typeof body !== 'object' ||
    typeof (body as { content?: unknown }).content !== 'string'
  ) {
    return Response.json(
      { error: 'Expected JSON object with string "content"' },
      { status: 400 },
    );
  }

  const result = await createNote(env.DB, (body as { content: string }).content);
  if ('error' in result) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  const url = new URL(request.url);
  const origin = url.origin;
  const noteUrl = `${origin}/n/${result.id}`;
  const deleteUrl = `${origin}/n/${result.id}/delete?token=${encodeURIComponent(result.deleteToken)}`;

  return Response.json({
    id: result.id,
    deleteToken: result.deleteToken,
    url: noteUrl,
    deleteUrl,
  });
};
