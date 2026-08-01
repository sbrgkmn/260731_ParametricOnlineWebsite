import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main>
      <section className="legal-page shell">
        <p className="eyebrow">Site information</p>
        <h1>Privacy policy</h1>
        <p>
          Parametric Online does not currently create visitor accounts, process
          payments, or run an email newsletter on this website.
        </p>
        <h2>Information you provide</h2>
        <p>
          The expert-help forms are disabled until a verified submission
          destination is configured, so the current site does not transmit the
          information entered into those fields.
        </p>
        <h2>Third-party services</h2>
        <p>
          Tutorial pages use YouTube&apos;s privacy-enhanced embed domain.
          Opening a YouTube video, Google Drive download, or portfolio link
          takes you to that provider, whose own privacy policy applies.
        </p>
        <h2>Analytics and cookies</h2>
        <p>
          The current site does not intentionally enable advertising or
          nonessential analytics cookies.
        </p>
        <p className="policy-date">Updated: August 1, 2026</p>
      </section>
    </main>
  );
}
