# Deploying the Web App and API

Two deployments, one domain:

| Piece               | What it is                              | Suggested host        | Domain            |
| -------------------- | ---------------------------------------- | ---------------------- | ------------------ |
| `app/` (web export)  | Public marketing routes + the signed-in product | Vercel (static), or Fly.io/nginx | `myapp.com`        |
| `server/`            | Express REST API                        | Fly.io, Render          | `api.myapp.com`    |

Native iOS/Android builds ship separately from the same `app/` codebase via EAS — see
`docs/SETUP_EAS.md` and `docs/DEPLOY_APP_STORES.md`.

## `app/` — static web export

```bash
cd app
npx expo export --platform web   # outputs to app/dist/
```

`app/dist/` is a static site (Expo Router's `web.output: "static"` in `app.json` generates real
per-route HTML, which is what makes the public routes crawlable). Deploy it anywhere that serves
static files:

- **Vercel**: point a project at the `app/` directory, build command
  `npx expo export --platform web`, output directory `dist`.
- **Fly.io/nginx**: build a small Docker image that runs `expo export` then serves `dist/` with
  nginx (same shape as a typical static-site Dockerfile — add one under `app/Dockerfile` if you
  go this route; not included by default since Vercel needs no Dockerfile at all).

Set these env vars in whatever host you pick (from `app/.env.example`):
`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_API_URL` (point this at
`https://api.myapp.com`), plus the Google client ID vars from `docs/SETUP_GOOGLE_OAUTH.md`.

## `server/` — API

`server/Dockerfile` builds a production image (`npm run build` then runs `dist/index.js`).

- **Fly.io**: `fly launch` from `server/`, then `fly deploy`. Set secrets with
  `fly secrets set SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... SUPABASE_JWT_SECRET=...`.
- **Render**: create a Web Service from the repo, root directory `server`, Docker runtime (or
  build command `npm ci && npm run build`, start command `node dist/index.js`).

Set `CORS_ORIGINS=https://myapp.com` (and any other origins the web build is served from) so
the browser build of `app/` can call the API.

## DNS

Point `myapp.com` at your `app/` host and `api.myapp.com` at your `server/` host (CNAME/A
records per your host's instructions). No shared routing layer between them — each deploy is
independent.
