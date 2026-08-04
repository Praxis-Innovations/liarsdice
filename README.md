# Expo App Template

A starting point for new apps: email/password + Google + Apple sign-in, a Home/Profile tab
shell, a lean REST API, all backed by Supabase — ship the same codebase to iOS, Android, and
the web.

## Layout

```
app/       Expo Router app (iOS, Android, static web export)
server/    Express REST API
shared/    Types shared between app/ and server/ (copy-synced, see scripts/sync-shared.js)
supabase/  Local dev config + Postgres migrations
docs/      Setup and deploy guides (see below)
```

See `docs/ARCHITECTURE.md` for how the pieces fit together.

## Quickstart

```bash
npm run install:all               # npm install in app/ and server/

cp .env.example .env               # repo root, for local Supabase CLI OAuth secrets (optional)
cp server/.env.example server/.env
cp app/.env.example app/.env

npx supabase start                 # requires the Supabase CLI — see docs/SETUP_SUPABASE.md
npx supabase db reset
npx supabase status                 # copy these values into server/.env and app/.env

npm run dev                         # starts server/ and app/ (Expo) together
```

Auth (email/password) works immediately against local Supabase. Google and Apple sign-in need
one-time external setup — see below — before those buttons will do anything.

## Setup guides

Auth and infra that need one-time setup outside this repo, roughly in the order you'll need them:

1. [docs/SETUP_SUPABASE.md](docs/SETUP_SUPABASE.md) — database + auth backend
2. [docs/SETUP_GOOGLE_OAUTH.md](docs/SETUP_GOOGLE_OAUTH.md) — Google sign-in (GCP + Firebase)
3. [docs/SETUP_APPLE_SIGNIN.md](docs/SETUP_APPLE_SIGNIN.md) — Apple sign-in
4. [docs/SETUP_EAS.md](docs/SETUP_EAS.md) — Expo/EAS native builds
5. [docs/DEPLOY_WEB_BACKEND.md](docs/DEPLOY_WEB_BACKEND.md) — hosting the web app + API
6. [docs/DEPLOY_APP_STORES.md](docs/DEPLOY_APP_STORES.md) — Google Play + App Store submission

Starting a brand new app from this template? [docs/RENAME_CHECKLIST.md](docs/RENAME_CHECKLIST.md)
has everything to change, in order.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Sync shared types, then start `server/` and `app/` together |
| `npm run dev:app` / `npm run dev:server` | Start just one side |
| `npm run sync:shared` | Copy `shared/types.ts` into `app/src/shared/` and `server/shared/` |
| `npm --prefix app run export:web` | Build the static web export (`app/dist/`) |
| `npm --prefix app run lint` / `typecheck` | Same for `server` |
