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
          Parametric Online does not currently sell products or collect payments
          on this website. The listed workflow downloads are free resources
          hosted on Google Drive.
        </p>
        <h2>Expert help</h2>
        <p>
          No booking or payment destination is currently active. Any future paid
          engagement will present its own scope, price, cancellation, and refund
          terms before confirmation.
        </p>
        <p className="policy-date">Updated: August 1, 2026</p>
      </section>
    </main>
  );
}
