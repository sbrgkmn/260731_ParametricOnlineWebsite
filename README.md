# Parametric.Online

A fast, static-first creator-commerce site for computational designers. The site presents Grasshopper tools, selected lessons, one-to-one sessions, and the Parametric Lab community while delegating commerce, delivery, booking, and community membership to hosted services.

## Run locally

Requirements: Node.js 22.13 or newer.

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Before sharing the site, verify the configured links in `.env.local`.

## Production check

```bash
npm run build
npm start
```

The project uses vinext and the Sites Vite plug-in, producing Cloudflare Worker-compatible output. No database, custom authentication, cart, or payment code is required.

## Content

- Product records live in `content/products/*.md`.
- Lesson records live in `app/lib/lessons.ts` and require no YouTube API.
- The landing-page generative system lives in `app/components/GenerativeBackground.tsx`. It uses the browser Canvas API and contains eight selectable simulations with no image or animation dependencies.
- Integration URLs and session prices live in `app/lib/site.ts`, with public environment-variable overrides documented in `.env.example`.
- Policy pages are clearly marked working placeholders until reviewed.

Product frontmatter includes title, slug, summary, category, price, checkout URL, visual token, gallery, video URL, difficulty, software and version, requirements, test date, included files, license choices, update and support policies, changelog, related lessons, feature state, and availability status.

## Hosted services

- Lemon Squeezy handles checkout, tax, subscriptions, and file delivery.
- Calendly handles scheduling.
- Skool hosts Parametric Lab.
- The configured newsletter provider handles email signup.

Do not commit downloadable paid files, API keys, customer data, or payment information.

## SEO and migration

The app includes canonical metadata, Open Graph fields, a sitemap, robots rules, Product/SoftwareApplication structured data, VideoObject structured data, and compatibility routes for legacy `/product-page/[slug]` and `/shop/[slug]` URLs.

Follow [MIGRATION.md](./MIGRATION.md) before switching DNS from Wix.
