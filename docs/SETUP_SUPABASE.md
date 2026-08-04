# Supabase Setup

Supabase provides both the Postgres database and Auth (email/password + Google + Apple) for
this template. You need one Supabase project per environment you run (local, and one hosted
project for staging/production is plenty for a new app).

## 1. Local development

Install the [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started),
then from the repo root:

```bash
npx supabase start
npx supabase db reset   # applies everything in supabase/migrations/
npx supabase status     # prints API URL, anon key, service role key, JWT secret
```

Copy the printed values into `server/.env` and `app/.env` (copy from the `.env.example` in each
folder first):

- `server/.env`: `SUPABASE_URL` = the local `API URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`
- `app/.env`: `EXPO_PUBLIC_SUPABASE_URL` = the local `API URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Then from the repo root: `npm run dev` (starts the server and the Expo app together).

## 2. Hosted project (staging/production)

1. Create a project at [supabase.com](https://supabase.com/dashboard).
2. Push the migrations: `npx supabase link --project-ref <your-project-ref>` then
   `npx supabase db push`.
3. In the dashboard, go to **Settings → API** and copy the Project URL, `anon` public key, and
   `service_role` secret key, plus **Settings → API → JWT Settings → JWT Secret**.
4. Put those into your deployed `server` and `app` environments (see
   `docs/DEPLOY_WEB_BACKEND.md`) — never commit real keys.
5. Under **Authentication → Providers**, enable **Google** and **Apple** and fill in the client
   ID/secret from `docs/SETUP_GOOGLE_OAUTH.md` and `docs/SETUP_APPLE_SIGNIN.md`. The hosted
   project does **not** read `supabase/config.toml` or any local `.env` file — you must enter
   these values directly in the dashboard.
6. Under **Authentication → URL Configuration**, set the Site URL and add every redirect URL
   your deployed app actually uses (see `additional_redirect_urls` in `supabase/config.toml`
   for the local-dev equivalents).

## Google + Apple sign-in wiring

`supabase/config.toml` already has `[auth.external.google]` and `[auth.external.apple]` blocks
pointed at environment variables, so local dev picks them up automatically once you set them.
Copy `.env.example` (the one at the **repo root**, next to `supabase/`) to `.env` and fill in:

```
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=
SUPABASE_AUTH_EXTERNAL_APPLE_CLIENT_ID=
SUPABASE_AUTH_EXTERNAL_APPLE_SECRET=
```

The Supabase CLI only reads this root `.env` when it runs `supabase start` — it does **not**
read `server/.env`, so putting these values there instead has no effect locally. Never commit
the root `.env`. See `docs/SETUP_GOOGLE_OAUTH.md` and `docs/SETUP_APPLE_SIGNIN.md` for where
these client IDs/secrets come from.

## The `profiles` table

`supabase/migrations/0001_profiles.sql` creates a `profiles` table (one row per `auth.users`
row, with `display_name`/`avatar_url`), row-level-security policies so users can only read/write
their own row, and a trigger that auto-creates a profile row on signup. `server/routes/me.ts`
reads/writes this table using the service-role client (which bypasses RLS); the app never talks
to Postgres directly.
