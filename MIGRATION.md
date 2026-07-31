# Wix migration checklist

## 1. Inventory the current site

- Export a complete list of indexed Wix URLs from Search Console, Wix, and an independent crawl.
- Record each product title, current URL, price, license, customer-facing description, image, and tutorial link.
- Identify every form, newsletter list, analytics tag, custom domain, and embedded service.
- Preserve a private backup of current product assets and order records. Do not add downloadable products to this repository.

## 2. Reconcile content

- Create or update one Markdown file per product in `content/products`.
- Replace sample Lemon Squeezy checkout URLs after products and variants are configured.
- Confirm Rhino, Grasshopper, plug-in, and version requirements for every product.
- Verify file lists, support terms, update terms, screenshots, video links, and tested dates.
- Replace the sample ComfyUI and digital-fabrication lessons with published videos or remove them until available.

## 3. Build the redirect map

- Keep `/product-page/folding-facade-panels` → `/tools/folding-facade-panels`.
- Keep `/product-page/brick-wall` → `/tools/brick-wall`.
- Keep `/product-page/al-bahr-towers-facade` → `/tools/al-bahr-facade`.
- Add every remaining Wix product slug to `app/lib/legacyRedirects.ts`.
- Add redirects for any Wix collection, blog, video, or campaign URL that has inbound links or search traffic.
- Test every redirect for one direct permanent hop to the final canonical URL after deployment.

## 4. Configure hosted integrations

- Configure Lemon Squeezy products, license variants, receipts, tax settings, and secure downloads.
- Configure Calendly event types, pricing language, intake questions, cancellation rules, and confirmation emails.
- Confirm the Skool community URL and whether Lab Plus should remain “coming soon.”
- Connect the final newsletter provider and verify double opt-in, consent copy, sender identity, and unsubscribe behavior.
- Replace all sample values from `.env.example` in the deployment environment.

## 5. Review policy and business details

- Have qualified counsel review the US-focused privacy, terms, and refund placeholders.
- Add an appropriate business mailing address and support contact without publishing a personal residential address.
- Confirm digital-download, subscription, cancellation, and session terms match the configured hosted services.
- Add cookie consent only if selected analytics or marketing services require it.

## 6. Quality and SEO checks

- Run `npm run build` and resolve all failures.
- Test keyboard navigation, visible focus, contrast, mobile layouts, forms, embeds, and reduced-motion behavior.
- Validate canonical links, sitemap, robots rules, Open Graph previews, and structured data.
- Confirm product images and videos have meaningful accessible names and optimized delivery.
- Crawl both the local production build and the staged deployment for broken links and accidental index blockers.

## 7. Launch

- Lower DNS TTL ahead of the planned cutover.
- Connect `parametric.online` and the preferred `www` redirect to the new host.
- Submit the new sitemap in Search Console and monitor coverage, redirects, 404s, and Core Web Vitals.
- Keep Wix available but unpublished long enough to verify records, redirects, and customer support history.
- Monitor checkout, file delivery, bookings, signups, and contact email through a complete test transaction.

