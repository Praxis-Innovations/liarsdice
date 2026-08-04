# Expo / EAS Setup

[EAS](https://docs.expo.dev/eas/) (Expo Application Services) builds and submits the native
iOS/Android binaries. This is separate from the web export, which doesn't need EAS at all.

## 1. Install and log in

```bash
npm install -g eas-cli
eas login
```

## 2. Link the project

From `app/`:

```bash
eas init
```

This creates (or links) a project on [expo.dev](https://expo.dev/) and writes
`extra.eas.projectId` into `app/app.json` automatically — don't set that field by hand.

## 3. Build profiles

`app/eas.json` already defines three profiles (development/preview/production — see
`docs/RENAME_CHECKLIST.md` for the bundle identifier/package name you should set first):

```bash
npm run eas-dev       # eas build --profile development   (dev client, internal distribution)
npm run eas-preview    # eas build --profile preview        (internal distribution, for QA)
npm run eas-prod       # eas build --profile production     (store-ready build)
```

## 4. Credentials

EAS manages signing credentials for you by default — the first `eas build` run for each
platform will prompt to generate or upload:

- **iOS**: an Apple Distribution certificate + provisioning profile (requires the Apple
  Developer account from `docs/SETUP_APPLE_SIGNIN.md`).
- **Android**: an upload keystore.

Run `eas credentials` any time to inspect, rotate, or manually configure these — you'll also
need it to grab your Android debug/release SHA-1 fingerprints for
`docs/SETUP_GOOGLE_OAUTH.md`.

## 5. EAS Update (optional)

To push JS-only changes without a full store review, install `expo-updates`
(`npx expo install expo-updates` from `app/`) — `app.json` already sets
`runtimeVersion.policy: "appVersion"`, which `expo-updates` needs. Then run
`eas update --channel production` after linking (step 2). Not required to ship a first version.
