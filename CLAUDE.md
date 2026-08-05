# CLAUDE.md

## Early-stage product: prefer rewrites over legacy support

This app has no production users yet — there is no back-compat burden. When a change touches
existing code, default to **rewriting it outright** rather than layering a compatibility
shim/adapter to keep the old version working alongside the new one. Concretely:

- Don't keep an old implementation "just in case" behind a flag, a re-exported alias, or a
  parallel code path once something replaces it.
- Don't add migration shims for internal code (types, components, config) unless something
  external depends on the old shape (e.g. a deployed API contract, external callers).
- If a change is large enough that a full rewrite feels risky or out of scope for the moment, say
  so and ask rather than silently defaulting to a compatibility layer.
- This does **not** apply to genuinely external contracts (the deployed REST API in `server/`,
  the Supabase schema/migrations, OAuth redirect URIs) — those still need real migrations.

## SEO is always top priority

Every change to `app/app/index.tsx` and any other publicly crawlable route must preserve or
improve:

- A real `<title>` and `<meta name="description">` per route, set via `expo-router/head`'s
  `Head` component.
- Open Graph + Twitter card tags. These live in `app/app/+html.tsx` as **site-wide defaults**
  because per-route `Head` content is not reliably baked into the raw static-exported HTML per
  route (this is an Expo Router static-export limitation, not a bug in this app — see
  https://github.com/expo/router/issues/833). Before assuming per-route social tags work, verify
  against the actual `app/dist/*.html` output of `npx expo export --platform web`.
- Semantic heading structure — use `src/lib/heading.ts`'s `headingProps(level)` helper (spreads
  `role="heading"` + the web-only `aria-level` attribute) on the one true H1 per page and H2s for
  section titles. Don't flatten headings to plain styled `<Text>`.
- `app/public/robots.txt` and `app/public/sitemap.xml` must stay in sync with the real public
  route list (currently `/`, `/sign-up`, `/sign-in`, `/forgot-password`).
- The JSON-LD structured data in `app/app/+html.tsx` must be kept accurate as the product evolves.
- `SITE_URL` in `app/app/+html.tsx` is currently a placeholder (`https://liarsdice.example.com`) —
  update it (and `public/robots.txt` + `public/sitemap.xml`) to the real production domain once
  one is deployed; see `docs/DEPLOY_WEB_BACKEND.md`.
- Never regress: this is an Expo Router **static web export** (`app.json` → `web.output:
  "static"`, bundler `metro`), not Next.js — there is no `next/head`, no `pages/` API routes, no
  Next middleware. SEO mechanisms are Expo-Router-specific: `expo-router/head`, `app/+html.tsx`,
  and the `app/public/` directory (copied verbatim into `dist/` on export).

## Design system

- **Styling**: NativeWind (Tailwind utility classes for React Native/Expo) for layout, spacing,
  border radius, and typography (`app/tailwind.config.js`, `app/metro.config.js`,
  `app/global.css`). **Color is deliberately not driven through NativeWind className utilities**
  — light/dark colors come from `app/src/theme/tokens.ts` via `useTheme()` (`ThemeProvider.tsx`),
  applied with inline `style`, since nesting a `dark` shade in a Tailwind color token does NOT
  auto-switch with dark mode (that requires hand-written `dark:` variants on every className).
  Keep it this way rather than reaching for Tailwind color utilities.
- **Animation**: `moti` (declarative, built on `react-native-reanimated`) for entrance/idle
  animations (see `src/components/landing/AnimatedDice.tsx`, `HowToPlay.tsx`); raw
  `react-native-reanimated` for anything more custom (see `src/components/ui/Button.tsx`'s press
  animation). Both work on native and web — this app ships to iOS/Android too (see `app.json`,
  `eas.json`), so avoid HTML/CSS/WebGL-only animation approaches.
- **Theme**: `app/src/theme/` — light + dark token sets (`tokens.ts`), consumed via
  `ThemeProvider`/`useTheme()` (`ThemeProvider.tsx`), which follows `app.json`'s
  `userInterfaceStyle: "automatic"` through NativeWind's own `useColorScheme()`. This requires
  `tailwind.config.js`'s `darkMode` to stay `"media"` — NativeWind only falls back to the OS
  `Appearance` value in that mode; `"class"` pins to a manually-toggled class and never auto-syncs
  (silently breaks dark mode, since this app has no manual light/dark toggle UI). Don't switch to
  `"class"` without adding one.
  `app/src/theme.ts` (the file, not the directory) is a **legacy compatibility shim** re-exporting
  the light palette as `COLORS`/`SPACING` for the `(app)/` authenticated screens (`home.tsx`,
  `profile.tsx`, `(app)/_layout.tsx`), which were not part of the design refresh — don't delete it
  without migrating those screens too.
- **Fonts**: Fredoka (headings, `@expo-google-fonts/fredoka`) + Manrope (body/UI,
  `@expo-google-fonts/manrope`), loaded via `expo-font`'s `useFonts` in `app/app/_layout.tsx`.
  Chosen for a bold/playful-but-highly-legible game aesthetic — do not fall back to system fonts
  for headings.
- **Visual direction**: bold, playful, chunky rounded shapes, custom SVG illustration — not
  emoji, not generic stock imagery, not vector-icon-pack glyphs standing in for real iconography.
  The landing hero's focal visual is a custom `react-native-svg` dice illustration animated with
  `moti` (`AnimatedDice.tsx`) — keep this pattern (SVG + RN animation) rather than reaching for an
  HTML/CSS/WebGL escape hatch, video embed, or Lottie/3D library, to stay portable to native
  builds.

## Scope note

The design refresh covers the landing page (`app/app/index.tsx`) and the four `(auth)/` screens
(sign-in, sign-up, forgot-password, reset-password). `(app)/home.tsx`, `(app)/profile.tsx`, and
`(app)/_layout.tsx` (the authenticated product) are still on the legacy `theme.ts`
shim/`StyleSheet` pattern — migrate them deliberately, not incidentally, when they're next in
scope.
