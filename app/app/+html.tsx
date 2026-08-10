import { ScrollViewStyleReset } from "expo-router/html";
import { type PropsWithChildren } from "react";

// Production origin — keep in sync with app/scripts/inject-seo.js,
// public/robots.txt, and public/sitemap.xml (inject-seo rewrites the latter
// two into dist/ on export so they can't drift).
const SITE_URL = "https://liarsdice.com";
const SITE_NAME = "Liar's Dice";
const SITE_TITLE = "Liar's Dice — Bluff Your Way to Victory";
const SITE_DESCRIPTION =
  "Play Liar's Dice online free, instantly — no download, no account required. Bid boldly, call bluffs, and outwit AI opponents in this classic dice game.";
const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

// Expo Router's static web export bakes this file's markup into every
// exported HTML page (app/dist/*.html) as-is, unlike per-route
// `expo-router/head` content, which is applied client-side and is not
// reliably present in the raw exported HTML. Non-JS crawlers/link-unfurl
// bots (Slack, Discord, iMessage, Twitter/X) only ever see what's here, so
// site-wide SEO/OG/Twitter/structured-data defaults belong in this file.
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        <title>{SITE_TITLE}</title>
        <meta name="description" content={SITE_DESCRIPTION} />
        <link rel="canonical" href={SITE_URL} />
        {/* ICO first — browsers/crawlers still request /favicon.ico by default.
            SVG is the crisp source; apple-touch covers iOS home-screen. */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        <meta name="theme-color" content="#FFFBF3" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#14101F" media="(prefers-color-scheme: dark)" />

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={SITE_TITLE} />
        <meta property="og:description" content={SITE_DESCRIPTION} />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={SITE_TITLE} />
        <meta name="twitter:description" content={SITE_DESCRIPTION} />
        <meta name="twitter:image" content={OG_IMAGE} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: SITE_NAME,
              url: SITE_URL,
              description: SITE_DESCRIPTION,
            }),
          }}
        />

        {/* Avoid white flash before RN paints (hurts FCP filmstrip / LCP). */}
        <style
          dangerouslySetInnerHTML={{
            __html:
              "html,body,#root{background-color:#FFFBF3}html{color-scheme:light dark}" +
              "body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif}",
          }}
        />

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
