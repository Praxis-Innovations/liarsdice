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
  `Head` component. This is a **best-effort layer only** — correct for JS-executing crawlers
  (Googlebot) but not guaranteed to survive static export (see next point).
- **Guaranteed per-route SEO tags come from `app/scripts/inject-seo.js`**, a postbuild step run
  automatically by `npm run export:web` (`expo export --platform web && node
  scripts/inject-seo.js`). Per-route `expo-router/head` `<Head>` content is confirmed (both by
  empirical testing — grepping `dist/*.html` — and by source-level investigation of
  `expo-router`'s static-export renderer) to NOT reliably survive Expo Router's static SSG:
  `<Head>` gates on `useIsFocused()` internally, which is unreliable during the synchronous
  `ReactDOMServer.renderToString` pass (matches https://github.com/expo/router/issues/833).
  Switching `app.json`'s `web.output` to `"server"` does **not** fix this — it uses the exact same
  HTML renderer, just adds API-route/middleware export and a heavier hosting requirement, for zero
  SEO benefit. `inject-seo.js` sidesteps the whole problem: after `expo export`, it rewrites the
  raw `<title>`, `<meta name="description">`, `<link rel="canonical">`, OG/Twitter tags, and
  page-specific JSON-LD directly into each target `dist/*.html` file via string replacement — this
  is what actually guarantees correctness for non-JS crawlers and link-unfurl bots (Slack,
  Discord, Twitter/X). Its `ROUTES` map is the source of truth for which routes get injected;
  when adding a new crawlable route, add an entry there too, not just a `<Head>` block.
- Open Graph + Twitter card tags. Site-wide defaults live in `app/app/+html.tsx` (this file's
  markup is reliably baked into every exported page as-is, since it's the root HTML template);
  `inject-seo.js` overrides them per-route for the pages in its `ROUTES` map.
- Semantic heading structure — use `src/lib/heading.ts`'s `headingProps(level)` helper (spreads
  `role="heading"` + the web-only `aria-level` attribute) on the one true H1 per page and H2s for
  section titles. Don't flatten headings to plain styled `<Text>`. The `Section`/`SubSection`
  components in `src/components/content/Prose.tsx` already wire this up for content pages.
- `app/public/robots.txt`, `app/public/sitemap.xml`, and `app/public/llms.txt` must
  stay in sync with the real public route list (currently `/`, `/play`, `/how-to-play`,
  `/rules`, `/strategy`, `/dudo-perudo-rules`, `/compare`, `/history`, `/faq`). Auth
  routes (`/sign-up`, `/sign-in`, `/forgot-password`) are intentionally omitted from
  `sitemap.xml` / `llms.txt` (and from `inject-seo.js` ROUTES) until the auth feature
  is enabled. `robots.txt` is still a broad `Allow: /` — do not claim auth routes are
  disallowed unless you add explicit `Disallow` rules. `llms.txt` is curated Markdown
  for AI crawlers (one H1 + blockquote + absolute links); `inject-seo.js` rewrites it
  into `dist/` on every `export:web`.
- The JSON-LD structured data in `app/app/+html.tsx` (site-wide `WebSite`) and in
  `app/scripts/inject-seo.js` (per-route `Article`/`FAQPage`/`HowTo`/`BreadcrumbList`) must be
  kept accurate as the product evolves. `inject-seo.js`'s `FAQ_ITEMS` array must stay in sync with
  `app/app/(content)/faq.tsx`'s `FAQ_ITEMS` — it's duplicated there because the script is a plain
  Node/CJS script and can't import a `.tsx` module directly.
- `SITE_URL` in both `app/app/+html.tsx` and `app/scripts/inject-seo.js` is
  `https://liarsdice.com` — keep those (and `public/robots.txt` + `public/sitemap.xml` +
  `public/llms.txt`) in sync if the production domain changes. `inject-seo.js` rewrites
  `dist/sitemap.xml`, `dist/robots.txt`, and `dist/llms.txt` on every `export:web` so
  the deployed files match `SITE_URL`.
  The apex domain must DNS to the Vercel app (not a parking/builder host) or Search
  Console will fetch the wrong sitemap; see `docs/DEPLOY_WEB_BACKEND.md`.
- Never regress: this is an Expo Router **static web export** (`app.json` → `web.output:
  "static"`, bundler `metro`), not Next.js — there is no `next/head`, no `pages/` API routes, no
  Next middleware. SEO mechanisms are Expo-Router-specific: `expo-router/head`, `app/+html.tsx`,
  `app/scripts/inject-seo.js`, and the `app/public/` directory (copied verbatim into `dist/` on
  export).
- After any SEO-relevant change, verify against the actual `app/dist/*.html` output of `npm run
  export:web` — don't assume a tag landed correctly, grep for it.

## Design system

- **Styling**: NativeWind (Tailwind utility classes for React Native/Expo) for layout, spacing,
  border radius, and typography (`app/tailwind.config.js`, `app/metro.config.js`,
  `app/global.css`). **Color is deliberately not driven through NativeWind className utilities**
  — light/dark colors come from `app/src/theme/tokens.ts` via `useTheme()` (`ThemeProvider.tsx`),
  applied with inline `style`, since nesting a `dark` shade in a Tailwind color token does NOT
  auto-switch with dark mode (that requires hand-written `dark:` variants on every className).
  Keep it this way rather than reaching for Tailwind color utilities.
- **Animation**: `moti` (declarative, built on `react-native-reanimated`) for entrance/idle
  animations (see `HowToPlay.tsx`); raw `react-native-reanimated` for custom motion (see
  `src/components/ui/Button.tsx`, native hero toss in `AnimatedDice.tsx`). Prefer portable RN
  animation on shared code paths.
- **Theme**: `app/src/theme/` — light + dark token sets (`tokens.ts`), consumed via
  `ThemeProvider`/`useTheme()` (`ThemeProvider.tsx`). First client paint stays light to match
  static HTML; after mount it loads `@liarsdice/theme-mode` from AsyncStorage (`light` |
  `dark` | `system`) and then follows that preference. The Header sun/moon control calls
  `toggleTheme()` (forces light/dark; does not cycle back to `system`). Inline `useTheme().colors`
  styles follow the toggle. Keep `tailwind.config.js` `darkMode: "class"` (required —
  NativeWind throws on web if `colorScheme.set` runs under `darkMode: "media"`).
  `ThemeProvider` syncs the `dark` class on `<html>`; do not drive brand colors through
  `dark:` utilities — keep using `useTheme().colors` inline.
- **Chrome**: global `Header` (`src/components/shared/Header.tsx`) and `Footer`
  (`src/components/shared/Footer.tsx`). Header is mounted from `app/app/_layout.tsx` (hidden on
  auth/`/home`/`/profile` prefixes), uses `useSafeAreaInsets()` so the bar clears notches on
  iOS/Android (inset is 0 on web — no visual change). `HEADER_HEIGHT` is the 64px content row;
  `useHeaderOffset()` is height + top inset for hero canvas math. Favicon is `app/public/favicon.svg`
  (also linked from `app/app/+html.tsx` for static export).
- **Fonts**: Fredoka (headings, `@expo-google-fonts/fredoka`) + Manrope (body/UI,
  `@expo-google-fonts/manrope`), loaded via `expo-font`'s `useFonts` in `app/app/_layout.tsx`.
  Chosen for a bold/playful-but-highly-legible game aesthetic — do not fall back to system fonts
  for headings.
- **Landing hero**: `Hero.tsx` + responsive helpers in `dicePlatformLayout.ts` (re-exported from
  `DicePlatform.tsx`: `getBreakpoint`, `getPlatformMetrics`, `getDiceBand`,
  `placeDiceOnPlatform` — unit-tested). Always 6 dice;
  sizes scale down on smaller widths. Soft spotlight SVG is shared; blur uses web-only CSS
  `filter`. **Web** dice: static SVG via `HeroDiceStage.web.tsx` → `Die` component (no Three.js,
  no animation — dice paint instantly at final positions). **Native** dice: SVG + Reanimated via
  `CssDice3D.tsx` → `ScatteredDice` (toss animation preserved). Platform split maintained via
  Metro `.web.tsx` file resolution.
  Do not commit `web/` Next.js leftovers — product web is Expo static export under `app/`.
- **Breakpoints** (shared in `src/lib/breakpoints.ts`, Tailwind-aligned):
  - phone `<768` (`md`), tablet `768–1023`, laptop/desktop `≥1024` (`lg`)
  - Header/Footer/CTA/HowToPlay chrome uses the same `lg` cutover (`isDesktopWidth` /
    `isCompactWidth`) so nav and hero compact mode switch together
  - Prefer these helpers over hard-coded width literals
- **Visual direction**: bold, playful, chunky rounded shapes, custom SVG illustration — not
  emoji, not generic stock imagery, not vector-icon-pack glyphs standing in for real iconography.
  Content pages use `DiceIllustration.tsx` figures to break up prose.

## Game engine and content pages

- **`app/src/engine/`** is the Liar's Dice rules engine: pure TypeScript, zero React/DOM
  dependencies (only `Math.random()`, always overridable via an injected `RNGFunction`), ported
  verbatim from an earlier prototype. `types.ts`/`constants.ts` define the data shapes;
  `game.ts`/`rules.ts`/`resolution.ts`/`wild-rules.ts`/`probability.ts` implement bidding,
  challenge/Spot-On resolution, ones-wild and Palifico rules, and probability math; `ai.ts` is a
  pure function (`getAIDecision(state, playerId, rng?)`) with three difficulty tiers. Tests live
  in `app/src/engine/__tests__/` (Jest via `jest-expo` — run with `npm run test`) and must keep
  passing; they're what actually proves rule accuracy, not just visual inspection. Keep this
  directory framework-agnostic — don't import React Native APIs into it.
- **`app/src/engine/gameStore.ts`** is the Zustand store wiring the engine to the UI (phase state
  machine, AI-turn loop with a randomized think-delay, `AsyncStorage`-backed preference
  persistence for hints/sound/tutorial flags). Game UI components (`app/src/components/game/`)
  consume this store; don't call engine functions directly from components.
- **`app/app/play.tsx`** is a public, unauthenticated route (sibling to `index.tsx`, not under
  `(app)/`) — the game is intentionally anonymous/no-account, matching its original design intent
  and keeping it fully crawlable. Don't move it behind the Supabase auth gate without a deliberate
  product decision; accounts/multiplayer are a real but explicitly future addition.
- **Content pages** (`app/app/(content)/`: `how-to-play`, `rules`, `strategy`,
  `dudo-perudo-rules`, `compare`, `history`, `faq`) are SEO-critical long-form pages built from
  shared primitives in `app/src/components/content/`: `Prose.tsx` (`Section`, `SubSection`,
  `Paragraph`, `BulletList`, `NumberedList`, `Callout`, `Quote` — use these instead of raw
  `View`/`Text` for prose so heading structure and spacing stay consistent), `DataTable.tsx` (RN
  has no native `<table>`; renders a horizontally-scrollable grid on wide viewports and stacks
  into label:value cards below Tailwind `md` / 768px — reuse this for any new tabular content), `ContentLayout.tsx`
  (breadcrumb + H1 + bottom `ContentNav` + full-bleed `Footer` — top in-page nav was removed in
  favor of the global Header; keep bottom cross-links for SEO internal linking),
  `DiceIllustration.tsx` (figures for rules/how-to pages), and `Breadcrumb.tsx`/`ContentNav.tsx`.
  The `(content)` route group doesn't affect URLs (`(content)/rules.tsx` still serves at `/rules`,
  preserving the target-keyword URLs the content was written for) — it only groups these routes
  under their own plain, non-auth-gated `_layout.tsx`.

## Tests

- Run from `app/`: `npm test` (Jest + `jest-expo`).
- Engine suites live in `app/src/engine/__tests__/` (rules correctness).
- UI/helper suites: `app/src/components/landing/__tests__/DicePlatform.test.ts` (covers
  `dicePlatformLayout.ts`), `app/src/theme/__tests__/ThemeProvider.test.tsx`. Prefer
  pure-helper tests over WebGL snapshot tests. Jest enforces ≥80% lines on the configured
  `collectCoverageFrom` set (`npm test -- --coverage`).

## Scope note

The design system covers the whole app: the landing page (`app/app/index.tsx`), the public game
(`app/app/play.tsx`), the 7 SEO content pages (`app/app/(content)/`), the four `(auth)/` screens
(sign-in, sign-up, forgot-password, reset-password), and the `(app)/` authenticated screens
(`home.tsx`, `profile.tsx`, `(app)/_layout.tsx`) all run on the design system described above —
there is no separate legacy theme file anymore.
