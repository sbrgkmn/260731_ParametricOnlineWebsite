import type { Metadata } from "next";

export const metadata: Metadata = { title: "Refund Policy", alternates: { canonical: "/refund-policy" } };

export default function RefundPolicyPage() {
  return (
    <main><section className="legal-page shell"><p className="eyebrow">Policy placeholder / Review required</p><h1>Refund policy</h1><p className="legal-notice">This digital product refund policy is a working placeholder and must be reviewed by qualified counsel before launch.</p><h2>Digital downloads</h2><p>Because digital files are delivered immediately, purchases are generally final once a download has been accessed. This does not limit any rights that cannot be waived under applicable law.</p><h2>Duplicate or incorrect purchase</h2><p>Contact support promptly if you purchased the same item twice, received the wrong product, or cannot access the delivered files.</p><h2>Technical issues</h2><p>Before requesting a remedy for compatibility, confirm that your software and plug-ins match the requirements on the product page. Reasonable support will be offered for installation and file-access problems.</p><h2>Sessions</h2><p>Rescheduling and cancellation terms for one-to-one sessions will be displayed in Calendly before booking.</p><p className="policy-date">Placeholder updated: July 31, 2026</p></section></main>
  );
}
