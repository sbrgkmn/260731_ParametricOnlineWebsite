import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Use", alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return (
    <main><section className="legal-page shell"><p className="eyebrow">Policy placeholder / Review required</p><h1>Terms of use</h1><p className="legal-notice">These US-focused digital product terms are a working placeholder and must be reviewed by qualified counsel before launch.</p><h2>Digital products</h2><p>Purchases grant a limited, nonexclusive license to use the downloaded files under the selected Individual or Studio option. Files may not be resold, redistributed, sublicensed, or published as downloadable source material.</p><h2>Software compatibility</h2><p>Each product page lists tested software and plug-in requirements. Buyers are responsible for confirming compatibility before purchase.</p><h2>Accounts, payment, and delivery</h2><p>Payment, tax handling, subscriptions, and file delivery are provided by Lemon Squeezy. Parametric.Online does not store payment card data or downloadable product files.</p><h2>Educational information</h2><p>Tutorials, community posts, and sessions provide educational guidance, not a guarantee of a particular commercial, academic, or project outcome.</p><p className="policy-date">Placeholder updated: July 31, 2026</p></section></main>
  );
}
