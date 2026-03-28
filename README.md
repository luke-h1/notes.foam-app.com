# Foam Notes

Short public links for plain-text notes on [Cloudflare Workers](https://developers.cloudflare.com/workers/) with [D1](https://developers.cloudflare.com/d1/) (SQLite). Useful for quickly taking notes where you do not have access to your typical note taking services (notion etc.).

## Commands

| Command                             | Action                                                                 |
| ----------------------------------- | ---------------------------------------------------------------------- |
| `bun install`                       | Install dependencies                                                   |
| `bun run dev`                       | Dev server (workerd + local D1)                                        |
| `bun run lint` / `bun run lint:fix` | ESLint                                                                 |
| `bun run check`                     | `astro check`                                                          |
| `bun run verify`                    | Lint, typecheck, and production build (used in CI)                     |
| `bun run build`                     | Production build                                                       |
| `bun run deploy`                    | `build` + `wrangler deploy`                                            |
| `bun run db:migrate:local`          | Apply migrations to local D1                                           |
| `bun run db:migrate:remote`         | Apply migrations to production D1                                      |
| `bun run generate-types`            | Regenerate `worker-configuration.d.ts` after changing `wrangler.jsonc` |

## Deploy to Cloudflare

1. Create a database: `bunx wrangler d1 create notes-db`
2. Put the returned `database_id` into `wrangler.jsonc` under `d1_databases[0].database_id`
3. Run `bun run generate-types` (code expects the D1 binding name in `wrangler.jsonc`, e.g. `notes_db` → `env.notes_db` in routes)
4. Run `bun run db:migrate:remote`
5. Deploy: `bun run deploy`

## API

- `POST /api/notes` — body `{ "content": string }` → `{ id, deleteToken, url, deleteUrl }`
- `GET /api/notes/:id` — `{ id, content, createdAt }`; invalid/unknown id → **404** (`{ "error": "Not found" }`)
- `DELETE /api/notes/:id?token=...` — **204** on success; wrong/missing token → **403** / **400**
- `GET /api/health` — `{ "status": "ok" }`

## Deploy checklist

- [✅] Set D1 `database_id`, run remote migrations, and `bun run generate-types`
- [✅] Custom domain: `foam-app.com` on Cloudflare, no conflicting `notes` DNS record
