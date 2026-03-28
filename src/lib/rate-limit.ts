import type { D1Database } from "@cloudflare/workers-types";
import {
  RATE_LIMIT_NOTE_CREATE_MAX,
  RATE_LIMIT_NOTE_CREATE_WINDOW_MS,
  RATE_LIMIT_NOTE_READ_MAX,
  RATE_LIMIT_NOTE_READ_WINDOW_MS,
} from "./constants";

export function getClientIp(request: Request): string {
  const cf = request.headers.get("cf-connecting-ip");
  if (cf?.trim()) {return cf.trim();}
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) {return first;}
  }
  return "unknown";
}

type LimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSec: number };

export async function enforceRateLimit(
  db: D1Database,
  request: Request,
  kind: "note_read" | "note_create",
): Promise<LimitResult> {
  const windowMs =
    kind === "note_create"
      ? RATE_LIMIT_NOTE_CREATE_WINDOW_MS
      : RATE_LIMIT_NOTE_READ_WINDOW_MS;
  const max =
    kind === "note_create"
      ? RATE_LIMIT_NOTE_CREATE_MAX
      : RATE_LIMIT_NOTE_READ_MAX;

  const ip = getClientIp(request);
  const now = Date.now();
  const windowId = Math.floor(now / windowMs);
  const bucketKey = `${kind}:${ip}:${windowId}`;
  const expiresAt = now + windowMs * 3;

  try {
    if (Math.random() < 0.02) {
      await db
        .prepare(`DELETE FROM rate_limit_buckets WHERE expires_at < ?`)
        .bind(now - windowMs)
        .run();
    }

    const row = await db
      .prepare(
        `INSERT INTO rate_limit_buckets (bucket_key, count, expires_at) VALUES (?, 1, ?)
         ON CONFLICT(bucket_key) DO UPDATE SET count = count + 1
         RETURNING count`,
      )
      .bind(bucketKey, expiresAt)
      .first<{ count: number }>();

    const count = row?.count ?? 1;
    if (count > max) {
      const windowEndMs = (windowId + 1) * windowMs;
      const retryAfterSec = Math.max(1, Math.ceil((windowEndMs - now) / 1000));
      return { allowed: false, retryAfterSec };
    }
    return { allowed: true };
  } catch (e) {
    console.error("[rate-limit]", kind, e);
    return { allowed: true };
  }
}

export function rateLimitResponse(retryAfterSec: number): Response {
  return Response.json(
    { error: "Too many requests" },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSec),
        "Cache-Control": "no-store",
      },
    },
  );
}
