# Publishing to Google Play and the App Store

Do this after `docs/SETUP_EAS.md` (you need a working `eas build` first) and after picking your
final app name/bundle id (`docs/RENAME_CHECKLIST.md`).

## Google Play Console

1. Create an account at [play.google.com/console](https://play.google.com/console/) ($25
   one-time fee) if you don't have one.
2. **Create app** — fill in name, default language, app/game type, free or paid.
3. Complete the required setup sections before any track accepts a build: **App content**
   (privacy policy URL, ads declaration, content rating questionnaire, target audience, data
   safety form), **Store listing** (short/full description, screenshots, icon, feature graphic).
4. Build a production binary: `eas build --profile production --platform android`.
5. Submit it: `eas submit --platform android` (uses the `submit.production.android` block in
   `app/eas.json`, currently targeting the **internal** track — change `track` to `production`
   once you're ready for a public release, or use the Play Console UI to promote a build
   between tracks).
6. Internal testing → closed testing → open testing → production is the typical progression;
   each track has its own review/rollout rules.

## Apple App Store Connect

1. Enroll in the [Apple Developer Program](https://developer.apple.com/programs/) ($99/year) —
   same account used in `docs/SETUP_APPLE_SIGNIN.md`.
2. [appstoreconnect.apple.com](https://appstoreconnect.apple.com/) → **My Apps → +** → create a
   new app with the bundle ID from `app/app.json`.
3. Fill in the required metadata: description, keywords, screenshots (per device size), privacy
   policy URL, App Privacy questionnaire, age rating.
4. Build a production binary: `eas build --profile production --platform ios`.
5. Submit it: `eas submit --platform ios` (uses `submit.production.ios.ascAppId` in
   `app/eas.json` — set this to your app's App Store Connect App ID once created, App Store
   Connect → App Information → General Information → Apple ID).
6. New builds land in **TestFlight** automatically after processing — use that for internal/
   external beta testing before submitting for App Store review.

## Required before either store will approve you

- A real, reachable **privacy policy URL** (both stores require this; host it wherever your
  website ends up living — see `docs/DEPLOY_WEB_BACKEND.md`).
- Account deletion support if your app collects any personal data — both stores require an
  in-app way to delete your account, not just a support email.
- Accurate data-safety/App Privacy disclosures matching what the app + Supabase Auth actually
  collect (email, and whatever profile fields you add to `profiles`).
