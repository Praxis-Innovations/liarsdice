# Architecture

## Layout

```
app/       Expo Router app — iOS, Android, and a static web export. Public marketing routes
           and the authenticated product live in the same codebase (see routing below).
server/    Express REST API. Verifies Supabase JWTs, reads/writes Postgres via the
           service-role Supabase client. No sessions of its own — Supabase Auth owns those.
shared/    Source-of-truth TypeScript types, copy-synced (not imported) into app/ and server/
           by scripts/sync-shared.js. Edit shared/types.ts, then run `npm run sync:shared`.
supabase/  config.toml (local dev + auth provider config) and migrations/ (schema, applied to
           both local and hosted Postgres).
```

## Routing (`app/app/`)

Expo Router — file-based, so the folder structure under `app/app/` *is* the route tree:

- `index.tsx` — public landing route (`/`). No auth gating; this is what a crawler or link
  preview sees.
- `(auth)/` — sign-in, sign-up, forgot-password, reset-password. The group's `_layout.tsx`
  redirects to `/home` if a non-recovery session already exists.
- `(app)/` — the signed-in product: `home.tsx` and `profile.tsx` as bottom tabs. The group's
  `_layout.tsx` redirects to `/sign-in` if there's no session.

Route groups (`(auth)`, `(app)`) don't appear in the URL — `(auth)/sign-in.tsx` is just
`/sign-in`.

## Auth

Supabase Auth handles email/password and Google/Apple sign-in end to end — neither `app/` nor
`server/` verifies third-party (Google/Apple) tokens directly:

- `app/src/context/AuthContext.tsx` wraps `@supabase/supabase-js` — session state,
  `signIn`/`signUp`/`signInWithGoogle`/`signInWithApple`/`signOut`/`resetPasswordForEmail`.
  Google/Apple use `supabase.auth.signInWithIdToken` on native (after the platform SDK produces
  an ID token) and `supabase.auth.signInWithOAuth` (browser redirect) on web.
- `server/auth.ts` verifies the resulting Supabase-issued JWT locally against
  `SUPABASE_JWT_SECRET`, falling back to a Supabase Admin API call
  (`supabase.auth.getUser`) if local verification fails. `server/middleware/auth.ts`'s
  `requireAuth` wraps this for Express routes.

## Data

One table beyond what Supabase Auth manages itself: `profiles` (see
`supabase/migrations/0001_profiles.sql`), one row per `auth.users` row, RLS-restricted to the
owning user, auto-created on signup via a trigger. `server/routes/me.ts` is the only thing that
reads/writes it, using the service-role client (bypasses RLS) — the app never talks to Postgres
directly, only through `server/`'s REST API (`src/lib/api.ts`).

## Adding a real feature

A new authenticated feature typically touches: a new table + migration in `supabase/migrations/`,
a new route file in `server/routes/` (mounted in `server/index.ts`), a type in `shared/types.ts`
(synced into both apps), a call in `app/src/lib/api.ts`, and a new route under `app/app/(app)/`.
