# Foam Notes

Short public links for plain-text notes on [Cloudflare Workers](https://developers.cloudflare.com/workers/) with [D1](https://developers.cloudflare.com/d1/) (SQLite).

Uses [Bun](https://bun.sh/) for installs and scripts (`packageManager` in `package.json`). **Astro 6** still expects **Node.js ≥ 22.12** on your `PATH` for `astro check` (and some tooling); upgrade with [nvm](https://github.com/nvm-sh/nvm) (`nvm use` picks up `.nvmrc`), [fnm](https://github.com/Schniz/fnm), or your OS package manager if `bun run check` complains.

## Commands

| Command | Action |
| --- | --- |
| `bun install` | Install dependencies |
| `bun run dev` | Dev server (workerd + local D1) |
| `bun run build` | Production build |
| `bun run check` | `astro check` (CI runs this) |
| `bun run deploy` | `build` + `wrangler deploy` |
| `bun run db:migrate:local` | Apply SQL migrations to local D1 |
| `bun run db:migrate:remote` | Apply migrations to production D1 |
| `bun run generate-types` | Regenerate `worker-configuration.d.ts` after changing `wrangler.jsonc` |

## First-time D1 (production)

1. Create a database: `bunx wrangler d1 create notes-db`
2. Put the returned `database_id` into `wrangler.jsonc` under `d1_databases[0].database_id`
3. Run `bun run generate-types`
4. Run `bun run db:migrate:remote`
5. Deploy: `bun run deploy`

Local development: run `bun run db:migrate:local` once so the `notes` table exists.

## API

- `POST /api/notes` — body `{ "content": string }` → `{ id, deleteToken, url, deleteUrl }`
- `GET /api/notes/:id` — JSON note payload
- `DELETE /api/notes/:id?token=...` — same-origin `Origin` required (Astro CSRF)
- `GET /api/health` — `{ status, checks }` for uptime probes (runs `SELECT 1` on D1)

## Security & privacy (by design)

- **Fetch metadata:** `POST /api/notes` returns `403` when `Sec-Fetch-Site: cross-site` (browser-driven CSRF reduction). Clients without `Sec-Fetch-*` (curl, workers, probes) are still allowed—pair with **rate limiting** at Cloudflare if the endpoint is public.
- **Delete tokens:** Compared with constant-time equality vs the stored value.
- **Headers:** Middleware sets `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`, `Cache-Control: private, no-store` on `/n/*` and `/api/*`, `X-Robots-Tag: noindex` on `/n/*`, and a **Content-Security-Policy** in production (dev skips CSP so Vite HMR works).
- **Robots:** `public/robots.txt` disallows `/n/` and `/api/` so well-behaved crawlers skip note URLs (not a secrecy guarantee).

## Adapter settings

- **`imageService: 'passthrough'`** — avoids requiring a Cloudflare Images binding when you are not using Astro image transforms.
- **`session` driver `unstorage/drivers/null`** — avoids provisioning a `SESSION` KV namespace when this app does not use Astro sessions.

## Operational checklist (before launch)

- [ ] Replace placeholder D1 `database_id` and run remote migrations.
- [ ] Turn on **Cloudflare rate limiting** (or WAF rules) for `POST /api/notes` if abuse is a concern.
- [ ] Configure **custom domain** and confirm `getPublicOrigin()` (see `src/lib/request-origin.ts`) produces correct `url` / `deleteUrl` in API responses.
- [ ] Optional: **Sentry** or Workers **Analytics** for error visibility (`console.error` is used for hard failures).
- [ ] Optional: **terms of service** and content policy if notes are user-generated in production.

## License

MIT (same as dependencies; adjust as needed).
