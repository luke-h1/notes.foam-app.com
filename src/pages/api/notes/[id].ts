import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { deleteNote, getNote } from "@/lib/note-service";
import { enforceRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { isValidDeleteToken, isValidNoteId } from "@/lib/validate";

export const prerender = false;

const notFoundJson = () =>
  Response.json({ error: "Not found" }, { status: 404 });

export const GET: APIRoute = async ({ params, request }) => {
  const limit = await enforceRateLimit(env.notes_db, request, "note_read");
  if (!limit.allowed) {
    return rateLimitResponse(limit.retryAfterSec);
  }

  const id = params.id;
  if (!isValidNoteId(id)) {
    return notFoundJson();
  }

  const note = await getNote(env.notes_db, id);
  if (!note) {
    return notFoundJson();
  }

  return Response.json({
    id: note.id,
    content: note.content,
    createdAt: note.created_at,
  });
};

export const DELETE: APIRoute = async ({ params, request }) => {
  const limit = await enforceRateLimit(env.notes_db, request, "note_read");
  if (!limit.allowed) {
    return rateLimitResponse(limit.retryAfterSec);
  }

  const id = params.id;
  if (!isValidNoteId(id)) {
    return notFoundJson();
  }

  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!isValidDeleteToken(token)) {
    return Response.json(
      { error: 'Missing or invalid delete token (query param "token")' },
      { status: 400 },
    );
  }

  const outcome = await deleteNote(env.notes_db, id, token);
  if (outcome === "not_found") {
    return notFoundJson();
  }
  if (outcome === "forbidden") {
    return Response.json({ error: "Invalid delete token" }, { status: 403 });
  }

  return new Response(null, { status: 204 });
};
