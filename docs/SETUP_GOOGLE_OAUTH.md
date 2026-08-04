# Google Sign-In Setup (GCP + Firebase)

Google sign-in needs three OAuth client IDs (Web, iOS, Android) from Google Cloud Console, and
(for Android specifically) a Firebase project to hold them. Supabase does the actual token
verification — the app and server never talk to Google directly beyond obtaining these IDs.

## 1. Google Cloud Console

1. Go to [console.cloud.google.com](https://console.cloud.google.com/) and create a new project
   (or reuse one) for this app.
2. **APIs & Services → OAuth consent screen**: configure it (External, unless this is an
   internal-only app), fill in app name/support email, add your production domain once you have
   one.
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**, create three:
   - **Web application** — no redirect URIs needed for the native flow, but add your Supabase
     project's callback URL (`https://<project-ref>.supabase.co/auth/v1/callback`) as an
     authorized redirect URI so the web `signInWithOAuth` fallback works.
   - **iOS** — Bundle ID must match `app/app.json`'s `expo.ios.bundleIdentifier`
     (`com.praxis.apptemplate` until you rename it — see `docs/RENAME_CHECKLIST.md`).
   - **Android** — Package name must match `expo.android.package`, plus your debug and release
     SHA-1 certificate fingerprints (`eas credentials` can print these once you've run an EAS
     build — see `docs/SETUP_EAS.md`).

## 2. Firebase (Android only)

The Android Google Sign-In client needs to live inside a Firebase project's
`google-services.json` file, even though this template doesn't use Firebase for anything else.

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com/)
   (or link the same GCP project you just used).
2. Add an Android app with the same package name as above.
3. Download `google-services.json` and place it at `app/google-services.json` (already
   `.gitignore`d — do not commit real credentials).
4. Back in the Google Cloud Console credentials list, make sure the Android OAuth client you
   created is associated with this Firebase project (Firebase → Project Settings →
   your Android app → shows the linked OAuth client once SHA-1 fingerprints are added).

iOS doesn't strictly need Firebase — `app/app.config.js` only wires in a
`GoogleService-Info.plist` if you place one at `app/GoogleService-Info.plist`, and Google
Sign-In on iOS works fine without it as long as `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` is set.

## 3. Wire the client IDs in

Set in `app/.env`:

```
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=<web client id>.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=<ios client id>.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME=com.googleusercontent.apps.<ios client id prefix>
```

`EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME` is the reversed form of the iOS client ID — Google shows it
to you directly in the client ID's details page in Cloud Console ("iOS URL scheme"). This is
read by `app/app.config.js` to configure the native Google Sign-In plugin.

Set in the repo-root `.env` (used by the Supabase CLI, see `docs/SETUP_SUPABASE.md`) and in the
hosted Supabase project's dashboard under **Authentication → Providers → Google**:

```
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=<web client id>.apps.googleusercontent.com
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=<web client secret>
```

Use the **Web** client's ID/secret here, not iOS/Android — Supabase verifies the ID token
against the Web client, which is why `supabase/config.toml` sets
`skip_nonce_check = true` for Google (the native SDKs generate their own internal nonce that
can't be reproduced client-side).
