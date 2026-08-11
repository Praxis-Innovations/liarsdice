#!/usr/bin/env node
// Postbuild step: `expo export --platform web` bakes app/+html.tsx's site-wide
// <title>/meta/OG/JSON-LD into every exported dist/*.html file, but per-route
// `expo-router/head` <Head> content does NOT reliably survive Expo Router's
// static SSG render (see CLAUDE.md's SEO section, and the confirmed source-level
// investigation of expo-router's static export pipeline). For pages where SEO is
// the whole point (the content pages below), that's not good enough — non-JS
// crawlers and link-unfurl bots would only ever see the generic site-wide tags.
//
// This script runs AFTER `expo export` and rewrites the raw HTML of specific
// dist/*.html files in place: unique <title>, <meta name="description">,
// <link rel="canonical">, OG/Twitter tags, and page-specific JSON-LD structured
// data — all guaranteed present in the static file itself.
//
// Keep SITE_URL/SITE_NAME here in sync with app/app/+html.tsx.
"use strict";

const fs = require("fs");
const path = require("path");

const SITE_URL = "https://liars-dice.app";
const SITE_NAME = "Liar's Dice";
const DIST_DIR = path.join(__dirname, "..", "dist");

/** Crawlable public routes written into dist/sitemap.xml (path → priority). */
const SITEMAP_URLS = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/play", changefreq: "weekly", priority: "0.9" },
  { path: "/how-to-play", changefreq: "monthly", priority: "0.8" },
  { path: "/rules", changefreq: "monthly", priority: "0.8" },
  { path: "/strategy", changefreq: "monthly", priority: "0.7" },
  { path: "/dudo-perudo-rules", changefreq: "monthly", priority: "0.7" },
  { path: "/compare", changefreq: "monthly", priority: "0.7" },
  { path: "/history", changefreq: "monthly", priority: "0.7" },
  { path: "/faq", changefreq: "monthly", priority: "0.7" },
  { path: "/products", changefreq: "monthly", priority: "0.5" },
];

// Keep in sync with the FAQ_ITEMS array in app/app/(content)/faq.tsx.
const FAQ_ITEMS = [
  { question: "What is Liar's Dice?", answer: "Liar's Dice is a classic bluffing dice game where each player rolls dice hidden under a cup and makes bids about the total number of a certain face value among all players' dice. Players must decide whether to raise the bid or challenge the previous player's claim. The last player with dice remaining wins. The game combines probability, psychology, and deception." },
  { question: "How many players do you need?", answer: "Liar's Dice is best played with 2 to 6 players, though the game works with any number in that range. With more players there are more dice on the table, making probability calculations more interesting and bluffing more rewarding." },
  { question: "What equipment do you need?", answer: "Traditionally, each player needs five six-sided dice and an opaque cup to hide them. Online, you don't need any physical equipment at all — just visit the play page and the game handles everything for you." },
  { question: "Is Liar's Dice the same as Dudo?", answer: "Yes, Dudo is the original South American name for the game that English speakers commonly call Liar's Dice. The rules are essentially identical. Dudo originated in the Andes region of South America and spread worldwide." },
  { question: "What are other names for Liar's Dice?", answer: "The game goes by many names around the world. Common alternatives include Dudo, Perudo, Bluff, Cachito, and Cacho. Despite the different names, the core mechanics — hidden dice, bidding, and challenging — remain consistent." },
  { question: "What does \"wild aces\" mean?", answer: "In the standard rules, dice showing a one (aces) count as wild — they match whatever face value is being bid on. For example, if someone bids \"four threes,\" then every die showing a three AND every die showing a one counts toward that total. Learn this before bidding math, because most bids include wild ones." },
  { question: "How does bidding work?", answer: "Each round, a player makes a bid consisting of a quantity and a face value — for example, \"three fives,\" meaning they claim there are at least three fives among all players' dice combined (including wild aces, unless ones were opened as the first bid). The next player must either raise the bid or challenge it." },
  { question: "What happens when someone opens bidding on ones?", answer: "When a player opens the bidding on ones (aces), aces are no longer wild for that entire round. This is sometimes called \"breaking aces.\" Bids on ones require roughly half the quantity of normal bids to be equivalent in difficulty." },
  { question: "What is a palifico round?", answer: "A palifico round is a special round triggered when a player is reduced to exactly one die. During a palifico round, aces are not wild and players can only raise the quantity, not change the face value of the current bid." },
  { question: "What is a \"Spot On\" call?", answer: "A Spot On call (also called \"Calza\" in Dudo) is when a player declares that the current bid is exactly right — neither too high nor too low. If correct, the caller gains back one lost die (up to a maximum of five). If wrong, the caller loses a die." },
  { question: "Can you gain dice back?", answer: "In the standard Dudo rules, the only way to gain a die back is by making a successful Spot On (Calza) call. If you correctly identify that the current bid is exactly right, you recover one lost die, up to the starting maximum of five." },
  { question: "What happens when you lose all your dice?", answer: "When you lose your last die, you are eliminated from the game. The game continues with the remaining players until only one player has dice left — that player is the winner." },
  { question: "When should I challenge?", answer: "Challenge (call \"Dudo\") when you believe the current bid is too high — that there are fewer dice of that value on the table than claimed. As a rule of thumb, each face value appears on roughly one-third of all dice when aces are wild." },
  { question: "How do I calculate probability with wild aces?", answer: "With wild aces, each die has a 2-in-6 (one-third) chance of matching any non-ace face value. So the expected count for any bid value across N total dice on the table is roughly N divided by 3. For example, with 15 dice in play, you would expect about 5 of any given value." },
  { question: "Is bluffing important in Liar's Dice?", answer: "Absolutely. Bluffing is the heart of the game. While probability gives you a foundation, skilled players use deception to mislead opponents about what they hold. A well-timed bluff can force other players into bad challenges." },
  { question: "Is this game free to play?", answer: "Yes, Liar's Dice Online is completely free to play. There are no paywalls, no premium currencies, and no pay-to-win mechanics." },
  { question: "Can I play on mobile?", answer: "Yes! The game is fully responsive and works on phones, tablets, and desktops. No app download is required — just open the site in your mobile browser and start playing." },
  { question: "How does the AI work?", answer: "Our AI opponents use a combination of probability calculations and strategic heuristics to make decisions. They evaluate the likelihood of bids being true based on their own dice and the total number of dice in play, then add controlled randomness to simulate realistic bluffing behavior." },
  { question: "Do I need to create an account?", answer: "No account is required to play Liar's Dice Online. You can jump straight into a game against AI opponents without signing up, logging in, or providing any personal information." },
  { question: "Can I play offline?", answer: "The game requires an internet connection to load initially, but once loaded it runs entirely in your browser. If you lose connectivity mid-game against AI opponents, your current game will continue to function." },
];

const HOW_TO_PLAY_STEPS = [
  { position: 1, name: "Gather Players and Equipment", text: "Assemble 2 to 6 players. Each player needs five standard six-sided dice and an opaque cup to hide them under." },
  { position: 2, name: "Set Up the Game", text: "Each player shakes their dice inside their cup and places the cup upside-down on the table, then peeks at their own dice." },
  { position: 3, name: "Understand Wild Aces", text: "Ones (aces) are wild and count as any face value, unless a player opens the round by bidding on ones. Learn this before bidding, because most bids include wild ones." },
  { position: 4, name: "Start Bidding", text: 'The first player makes a bid stating a quantity and a face value — for example "three fives" — counting wild aces among all players\' dice.' },
  { position: 5, name: "Raise the Bid", text: "Each subsequent player must raise the bid by increasing the quantity, the face value, or both — or challenge the previous bid. Switching to or from aces uses special conversion rules." },
  { position: 6, name: "Challenge by Calling Liar", text: 'Call "Liar!" to challenge the previous bid. All players reveal their dice and count the relevant face plus wild aces.' },
  { position: 7, name: "Use Spot On Calls", text: 'Optionally declare "Spot On" if you believe the current bid is exactly correct.' },
  { position: 8, name: "Play Palifico Rounds", text: "When a player is reduced to one die, the next round is a palifico round with special restricted bidding." },
  { position: 9, name: "Win the Game", text: "Players who lose all their dice are eliminated. The last player with dice remaining wins the game." },
];

function organization() {
  return { "@type": "Organization", name: SITE_NAME, url: SITE_URL };
}

function breadcrumbList(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE_URL }, ...items].map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.item,
    })),
  };
}

function article(headline, description, urlPath) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    url: `${SITE_URL}${urlPath}`,
    publisher: organization(),
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}${urlPath}` },
  };
}

// filename (relative to dist/) -> route metadata
const ROUTES = {
  "play.html": {
    path: "/play",
    title: "Play Liar's Dice Online Free — No Sign-Up Required",
    description:
      "Play Liar's Dice online right now, free, against AI opponents — no download, no account. Bid, bluff, and call Liar in your browser.",
    jsonLd: [{ "@context": "https://schema.org", "@type": "WebPage", name: "Play Liar's Dice", url: `${SITE_URL}/play` }],
  },
  "rules.html": {
    path: "/rules",
    title: "Liar's Dice Rules — Complete Official Rules & Variations",
    description:
      "Complete rules for Liar's Dice (Dudo). Learn bidding, wild aces, palifico rounds, spot on calls, and all official rules with examples. 2-6 players.",
    jsonLd: [
      article("Liar's Dice Rules — Complete Official Rules Reference", "Complete rules for Liar's Dice (Dudo), including bidding, wild aces, palifico rounds, spot on calls, and common variations.", "/rules"),
      breadcrumbList([{ name: "Rules", item: `${SITE_URL}/rules` }]),
    ],
  },
  "how-to-play.html": {
    path: "/how-to-play",
    title: "How to Play Liar's Dice — Beginner's Tutorial & Step-by-Step Guide",
    description:
      "Learn how to play Liar's Dice (Dudo) with this beginner-friendly tutorial. Step-by-step rules for bidding, bluffing, wild aces, palifico rounds, and winning strategies.",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: "How to Play Liar's Dice",
        description: "A step-by-step beginner's tutorial for Liar's Dice (also known as Dudo), covering setup, wild aces, bidding, challenges, palifico rounds, and winning the game.",
        totalTime: "PT30M",
        estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "0" },
        supply: [
          { "@type": "HowToSupply", name: "Five six-sided dice per player" },
          { "@type": "HowToSupply", name: "One opaque cup or shaker per player" },
        ],
        step: HOW_TO_PLAY_STEPS.map((s) => ({ "@type": "HowToStep", position: s.position, name: s.name, text: s.text })),
      },
      breadcrumbList([{ name: "How to Play", item: `${SITE_URL}/how-to-play` }]),
    ],
  },
  "strategy.html": {
    path: "/strategy",
    title: "Liar's Dice Strategy Guide — Probability, Bluffing & Tips",
    description:
      "Master Liar's Dice with our comprehensive strategy guide. Learn probability math, bluffing tactics, when to challenge or spot on, and advanced tips to win more games of Dudo.",
    jsonLd: [
      article("Liar's Dice Strategy Guide — Probability, Bluffing & Tips", "Master Liar's Dice with our comprehensive strategy guide covering probability, bluffing, challenge timing, and advanced tactics for Dudo.", "/strategy"),
      breadcrumbList([{ name: "Strategy Guide", item: `${SITE_URL}/strategy` }]),
    ],
  },
  "faq.html": {
    path: "/faq",
    title: "FAQ — Liar's Dice Questions & Answers",
    description:
      "Frequently asked questions about Liar's Dice (Dudo). Learn the rules, bidding, wild aces, palifico rounds, strategy tips, and how to play online for free.",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQ_ITEMS.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
      breadcrumbList([{ name: "FAQ", item: `${SITE_URL}/faq` }]),
    ],
  },
  "compare.html": {
    path: "/compare",
    title: "Liar's Dice Variants Comparison — Dudo vs Perudo vs Bluff",
    description:
      "Compare Liar's Dice variants side by side: standard rules, Dudo, Perudo, Bluff, Bar Dice, and Liar's Bar. Find the version that fits your group.",
    jsonLd: [
      article("Liar's Dice Variants Comparison — Dudo vs Perudo vs Bluff", "A comprehensive comparison of Liar's Dice variants including Dudo, Perudo, Bluff, Bar Dice, and Liar's Bar.", "/compare"),
      breadcrumbList([{ name: "Variants Comparison", item: `${SITE_URL}/compare` }]),
    ],
  },
  "dudo-perudo-rules.html": {
    path: "/dudo-perudo-rules",
    title: "Dudo & Perudo Rules — Regional Variations of Liar's Dice",
    description:
      "Learn about Dudo, Cacho, Cachito, Perudo, and Bluff — regional names and rule variations for Liar's Dice played across South America, Europe, and the United States.",
    jsonLd: [
      article("Dudo & Regional Variations of Liar's Dice", "A comprehensive guide to Dudo, Cacho, Cachito, Perudo, and Bluff — the many names and rule variations of Liar's Dice played around the world.", "/dudo-perudo-rules"),
      breadcrumbList([
        { name: "Rules", item: `${SITE_URL}/rules` },
        { name: "Dudo & Regional Variations", item: `${SITE_URL}/dudo-perudo-rules` },
      ]),
    ],
  },
  "history.html": {
    path: "/history",
    title: "History of Liar's Dice — Origins, Dudo & Modern Revival",
    description:
      "Discover the rich history of Liar's Dice — from its ancient South American origins as Dudo and Cacho, through its Pirates of the Caribbean fame, to the modern Liar's Bar revival.",
    jsonLd: [
      article("The History of Liar's Dice: From Ancient South America to the Digital Age", "A comprehensive history of Liar's Dice, tracing the game from its pre-Columbian origins in South America through its global spread, Hollywood fame, and modern digital revival.", "/history"),
      breadcrumbList([{ name: "History", item: `${SITE_URL}/history` }]),
    ],
  },
  "products.html": {
    path: "/products",
    title: "Our Products — Apps & Games by Praxis Innovations",
    description:
      "Explore the apps and games built by Praxis Innovations — from expense splitting with EvenX to classic board and dice games online.",
    jsonLd: [
      breadcrumbList([{ name: "Products", item: `${SITE_URL}/products` }]),
    ],
  },
};

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttr(str) {
  return escapeHtml(str).replace(/"/g, "&quot;");
}

function injectRoute(filePath, route) {
  let html = fs.readFileSync(filePath, "utf8");
  const canonicalUrl = `${SITE_URL}${route.path}`;
  const title = route.title;
  const description = route.description;

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${escapeAttr(description)}"/>`);
  html = html.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${canonicalUrl}"/>`);
  html = html.replace(/<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${escapeAttr(title)}"/>`);
  html = html.replace(/<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${escapeAttr(description)}"/>`);
  html = html.replace(/<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${canonicalUrl}"/>`);
  html = html.replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${escapeAttr(title)}"/>`);
  html = html.replace(/<meta name="twitter:description" content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${escapeAttr(description)}"/>`);

  if (route.jsonLd) {
    const scripts = route.jsonLd
      .map((data) => `<script type="application/ld+json">${JSON.stringify(data)}</script>`)
      .join("");
    html = html.replace("</head>", `${scripts}</head>`);
  }

  fs.writeFileSync(filePath, html, "utf8");
  return { path: route.path, title };
}

function writeSitemapRobotsAndLlms() {
  const urls = SITEMAP_URLS.map(
    ({ path: urlPath, changefreq, priority }) => `  <url>
    <loc>${SITE_URL}${urlPath === "/" ? "/" : urlPath}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`,
  ).join("\n");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  const robots = `User-agent: *
Allow: /
Disallow: /_sitemap

Sitemap: ${SITE_URL}/sitemap.xml
`;

  fs.writeFileSync(path.join(DIST_DIR, "sitemap.xml"), sitemap, "utf8");
  fs.writeFileSync(path.join(DIST_DIR, "robots.txt"), robots, "utf8");

  // Single source of truth: app/public/llms.txt (rewrite origin so SITE_URL can't drift).
  const publicLlmsPath = path.join(__dirname, "..", "public", "llms.txt");
  if (fs.existsSync(publicLlmsPath)) {
    const llms = rewriteLegacyOrigins(fs.readFileSync(publicLlmsPath, "utf8"));
    fs.writeFileSync(path.join(DIST_DIR, "llms.txt"), llms, "utf8");
  }
}

/** Legacy / placeholder origins that must never ship in dist/. */
const LEGACY_ORIGINS = [
  "https://liarsdice.example.com",
  "https://liarsdice.com",
  "https://www.liarsdice.com",
];

function rewriteLegacyOrigins(text) {
  let out = text;
  for (const origin of LEGACY_ORIGINS) {
    out = out.split(origin).join(SITE_URL);
  }
  return out;
}

/** Walk dist/ and rewrite any leftover placeholder / wrong-domain origin in baked HTML. */
function rewriteSiteUrlInHtml(dir = DIST_DIR) {
  let count = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      count += rewriteSiteUrlInHtml(full);
      continue;
    }
    if (!entry.name.endsWith(".html")) continue;
    const html = fs.readFileSync(full, "utf8");
    const next = rewriteLegacyOrigins(html);
    if (next === html) continue;
    fs.writeFileSync(full, next, "utf8");
    count += 1;
  }
  return count;
}

/**
 * Extract font file URLs from @font-face rules or preload link tags in HTML.
 * Returns a map of font-family substring → URL.
 */
function extractFontUrls(html) {
  const urls = {};
  const preloadRe = /<link rel="preload" href="([^"]*)" as="font"[^>]*>/g;
  let m;
  while ((m = preloadRe.exec(html)) !== null) {
    urls[m[1]] = m[1];
  }
  const faceRe = /url\(["']?([^"')]+\.(?:ttf|woff2?))["']?\)/g;
  while ((m = faceRe.exec(html)) !== null) {
    urls[m[1]] = m[1];
  }
  return Object.values(urls);
}

/**
 * Lighthouse/FCP: expo-font emits `font-display:auto` (FOIT) and preloads every
 * weight. Swap fonts immediately so brand faces always appear once downloaded.
 * On the landing page only preload the two weights that paint the H1 + body
 * (keeps the critical path small); remaining weights still swap in.
 *
 * Do NOT use font-display:optional here — it permanently sticks to system/serif
 * fallbacks when TTFs miss the ~100ms block window (common on cold loads).
 *
 * Do NOT strip, defer, or lazily inject Expo Metro script tags (`__common`,
 * entry, `_layout`, etc.). Parking `__common` behind idle/gesture boot caused
 * "Requiring unknown module N" and a blank white page after hydrate.
 */
function assertExpoScriptsIntact() {
  const indexPath = path.join(DIST_DIR, "index.html");
  if (!fs.existsSync(indexPath)) return;
  const html = fs.readFileSync(indexPath, "utf8");
  if (
    /requestIdleCallback\s*\(\s*load/.test(html) ||
    /setTimeout\s*\(\s*boot\s*,\s*20000\s*\)/.test(html) ||
    (/__common-[^"]+\.js/.test(html) &&
      !/<script src="\/_expo\/static\/js\/web\/__common-[^"]+\.js" defer><\/script>/.test(html))
  ) {
    console.error(
      "inject-seo: refusing to ship index.html with deferred/idle Expo JS boot " +
        '(causes "Requiring unknown module" / blank page).',
    );
    process.exit(1);
  }
}

function optimizeHtmlPerf(dir = DIST_DIR) {
  let files = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files += optimizeHtmlPerf(full);
      continue;
    }
    if (!entry.name.endsWith(".html")) continue;

    let html = fs.readFileSync(full, "utf8");
    const before = html;
    html = html.replace(/font-display:\s*(?:auto|optional)/g, "font-display:swap");

    if (entry.name === "index.html") {
      // Extract font URLs before stripping preloads so we can re-inject critical ones.
      const allFontUrls = extractFontUrls(html);

      // Strip ALL font preloads, then selectively re-add critical ones.
      html = html.replace(/<link rel="preload" href="[^"]*" as="font"[^>]*>/g, "");

      // Re-inject preloads for the two critical font weights (H1 + body).
      const criticalFonts = ["Fredoka_700Bold", "Fredoka_700", "Manrope_400Regular", "Manrope_400"];
      const preloadTags = [];
      for (const url of allFontUrls) {
        if (criticalFonts.some((name) => url.includes(name))) {
          const ext = url.endsWith(".woff2") ? "font/woff2" : "font/ttf";
          preloadTags.push(`<link rel="preload" href="${url}" as="font" type="${ext}" crossorigin>`);
        }
      }
      if (preloadTags.length > 0) {
        html = html.replace("</head>", preloadTags.join("\n") + "\n</head>");
      }
    }

    if (html !== before) {
      fs.writeFileSync(full, html, "utf8");
      files += 1;
    }
  }
  return files;
}

function main() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error(`inject-seo: dist directory not found at ${DIST_DIR} — run "expo export --platform web" first.`);
    process.exit(1);
  }

  const results = [];
  for (const [filename, route] of Object.entries(ROUTES)) {
    const filePath = path.join(DIST_DIR, filename);
    if (!fs.existsSync(filePath)) {
      console.warn(`inject-seo: skipping ${filename} — not found in dist/ (route may not exist yet).`);
      continue;
    }
    results.push(injectRoute(filePath, route));
  }

  writeSitemapRobotsAndLlms();
  const rewritten = rewriteSiteUrlInHtml();
  const perfTouched = optimizeHtmlPerf();
  assertExpoScriptsIntact();

  console.log(`inject-seo: injected per-route SEO metadata into ${results.length} file(s):`);
  for (const r of results) console.log(`  ${r.path} -> "${r.title}"`);
  console.log(`inject-seo: wrote sitemap.xml + robots.txt + llms.txt for ${SITE_URL}`);
  if (rewritten > 0) {
    console.log(`inject-seo: replaced placeholder SITE_URL in ${rewritten} HTML file(s)`);
  }
  if (perfTouched > 0) {
    console.log(`inject-seo: applied font-display/preload perf tweaks to ${perfTouched} HTML file(s)`);
  }
}

main();
