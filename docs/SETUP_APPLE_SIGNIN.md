# Apple Sign-In Setup

Requires an [Apple Developer Program](https://developer.apple.com/programs/) membership
($99/year). Apple sign-in is offered on iOS (native `expo-apple-authentication`) and web
(Supabase OAuth redirect) — there's no native Apple sign-in on Android, so the button is hidden
there (see `app/src/components/SocialSignInButtons.tsx`).

## 1. App ID capability

1. [developer.apple.com/account/resources/identifiers](https://developer.apple.com/account/resources/identifiers/list) →
   find (or create) the App ID matching `app/app.json`'s `expo.ios.bundleIdentifier`
   (`com.praxis.apptemplate` until renamed — see `docs/RENAME_CHECKLIST.md`).
2. Enable the **Sign In with Apple** capability on it.
   (`app/app.config.js` already adds the corresponding
   `com.apple.developer.applesignin` entitlement to the native build — nothing else to do
   app-side.)

## 2. Services ID (this becomes the OAuth "client ID")

1. **Identifiers → + → Services IDs**, create one (e.g. `com.praxis.apptemplate.signin`). This
   identifier string is what Supabase calls the Apple **client_id**.
2. Enable **Sign In with Apple** on it, then **Configure**:
   - Primary App ID: the App ID from step 1.
   - Domains and Return URLs: add your Supabase project's callback URL,
     `https://<project-ref>.supabase.co/auth/v1/callback`.

## 3. Private key

1. **Keys → +**, create a new key with **Sign In with Apple** enabled, associate it with the
   App ID from step 1.
2. Download the `.p8` key file (only downloadable once) and note the **Key ID**.
3. Note your **Team ID** (top right of the Apple Developer dashboard).

Apple's OAuth "secret" isn't a static string — it's a JWT you sign with this private key,
containing your Team ID, Key ID, and Services ID, valid for up to 6 months. Supabase's dashboard
can generate this for you: **Authentication → Providers → Apple** has fields for Team ID, Key
ID, and the private key file directly, and handles re-signing the JWT itself. For local dev via
`supabase/config.toml`, you need to generate the signed JWT yourself and put it in
`SUPABASE_AUTH_EXTERNAL_APPLE_SECRET` — Supabase's docs have a
[script for this](https://supabase.com/docs/guides/auth/social-login/auth-apple#generate-a-client-secret-manually-optional).

## 4. Wire it in

Repo-root `.env` (Supabase CLI, local dev — see `docs/SETUP_SUPABASE.md`) and the hosted
project's dashboard under **Authentication → Providers → Apple**:

```
SUPABASE_AUTH_EXTERNAL_APPLE_CLIENT_ID=com.praxis.apptemplate.signin   # your Services ID
SUPABASE_AUTH_EXTERNAL_APPLE_SECRET=<the signed JWT>
```

Nothing needs to be set in `app/.env` for Apple — on native, `expo-apple-authentication` talks
directly to the device's Apple ID session and hands Supabase a device-signed identity token; on
web it's a plain `signInWithOAuth` redirect. Both just need the Supabase provider configured
above.
