import type { APIRoute } from 'astro';

import { env } from 'cloudflare:workers';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    await env.DB.prepare('SELECT 1 AS ok').first<{ ok: number }>();
    return Response.json(
      { status: 'ok', checks: { database: 'ok' } },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store' },
      },
    );
  } catch (e) {
    console.error('[health] database check failed', e);
    return Response.json(
      { status: 'error', checks: { database: 'error' } },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
};
