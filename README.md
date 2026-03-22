# Foam Notes

Short public links for plain-text notes on [Cloudflare Workers](https://developers.cloudflare.com/workers/) with [D1](https://developers.cloudflare.com/d1/) (SQLite).

## Commands

| Command | Action |
| --- | --- |
| `npm run dev` | Dev server (workerd + local D1) |
| `npm run build` | Production build |
| `npm run check` | `astro check` |
| `npm run db:migrate:local` | Apply SQL migrations to local D1 |
| `npm run db:migrate:remote` | Apply migrations to production D1 |
| `npm run generate-types` | Regenerate `worker-configuration.d.ts` after changing `wrangler.jsonc` |

## First-time D1 (production)

1. Create a database: `npx wrangler d1 create notes-db`
2. Put the returned `database_id` into `wrangler.jsonc` under `d1_databases[0].database_id`
3. Run `npm run generate-types`
4. Run `npm run db:migrate:remote`
5. Deploy: `npx wrangler deploy` (after `npm run build`)

Local development: run `npm run db:migrate:local` once so the `notes` table exists.

## API

- `POST /api/notes` — body `{ "content": string }` → `{ id, deleteToken, url, deleteUrl }`
- `GET /api/notes/:id` — JSON note payload
- `DELETE /api/notes/:id?token=...` — requires browser `Origin` matching the site (Astro CSRF protection)

## License

MIT (same as dependencies; adjust as needed).
