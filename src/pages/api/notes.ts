import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { MAX_JSON_BODY_BYTES } from "@/lib/constants";
import { createNote } from "@/lib/note-service";
import { enforceRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { getPublicOrigin } from "@/lib/request-origin";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const limit = await enforceRateLimit(env.notes_db, request, "note_create");
  if (!limit.allowed) {
    return rateLimitResponse(limit.retryAfterSec);
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return Response.json(
      { error: "Content-Type must be application/json" },
      { status: 415 },
    );
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength !== null) {
    const n = Number.parseInt(contentLength, 10);
    if (!Number.isFinite(n) || n > MAX_JSON_BODY_BYTES) {
      return Response.json(
        { error: "Request body too large" },
        { status: 413 },
      );
    }
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (
    !body ||
    typeof body !== "object" ||
    typeof (body as { content?: unknown }).content !== "string"
  ) {
    return Response.json(
      { error: 'Expected JSON object with string "content"' },
      { status: 400 },
    );
  }

  const result = await createNote(
    env.notes_db,
    (body as { content: string }).content,
  );
  if ("error" in result) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  const origin = getPublicOrigin(request);
  const noteUrl = `${origin}/n/${result.id}`;
  const deleteUrl = `${origin}/n/${result.id}/delete?token=${encodeURIComponent(result.deleteToken)}`;

  return Response.json({
    id: result.id,
    deleteToken: result.deleteToken,
    url: noteUrl,
    deleteUrl,
  });
};
