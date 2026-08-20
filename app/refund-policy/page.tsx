import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy",
  alternates: { canonical: "/refund-policy" },
};

export default function RefundPolicyPage() {
  return (
    <main>
      <section className="legal-page shell">
        <p className="eyebrow">Site information</p>
        <h1>Refund policy</h1>
        <p>
          The currently available workflow downloads are free resources hosted
          on Google Drive. Paid digital packages shown on the site are previews
          and cannot yet be purchased.
        </p>
        <h2>Expert help</h2>
        <p>
          Paid working sessions are booked and processed by the provider linked
          from the booking page. The applicable cancellation and refund terms
          are displayed before the booking is confirmed.
        </p>
        <p className="policy-date">Updated: August 19, 2026</p>
      </section>
    </main>
  );
}
