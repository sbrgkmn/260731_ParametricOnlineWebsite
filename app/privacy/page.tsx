import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return (
    <main><section className="legal-page shell"><p className="eyebrow">Policy placeholder / Review required</p><h1>Privacy policy</h1><p className="legal-notice">This US-focused privacy policy is a working placeholder and must be reviewed by qualified counsel before launch.</p><h2>Information collected</h2><p>The website is intended to collect only information visitors choose to provide, such as an email address for newsletters or details submitted when contacting or booking a session.</p><h2>Hosted services</h2><p>Checkout and digital delivery are handled by Lemon Squeezy, bookings by Calendly, community participation by Skool, and newsletter signup by the configured email provider. Their own privacy policies govern information processed on those services.</p><h2>Analytics and cookies</h2><p>No nonessential analytics or advertising cookies should be enabled until a consent approach and vendor disclosures have been reviewed.</p><h2>Contact</h2><p>A business contact address will be added before launch. Personal residential contact information will not be published.</p><p className="policy-date">Placeholder updated: July 31, 2026</p></section></main>
  );
}
