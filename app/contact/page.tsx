import type { Metadata } from "next";
import { siteConfig } from "../lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Parametric.Online about tools, support, sessions, or collaborations.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main>
      <section className="page-hero shell">
        <p className="eyebrow">Contact / Start with context</p>
        <h1>Tell me what you are building.</h1>
        <p>For product support, include the product name, software version, and a concise description of the issue.</p>
      </section>
      <section className="shell section contact-grid">
        <div>
          <p className="eyebrow">Direct email</p>
          <a className="contact-email" href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
          <p>Typical response time: 2–3 business days.</p>
        </div>
        <div className="contact-options">
          <a href={`mailto:${siteConfig.contactEmail}?subject=Product%20support`}><span>01</span><div><strong>Product support</strong><p>File access, installation, and compatibility questions.</p></div><i>↗</i></a>
          <a href={`mailto:${siteConfig.contactEmail}?subject=Project%20or%20collaboration`}><span>02</span><div><strong>Projects & collaborations</strong><p>Consulting, workshops, teaching, and research partnerships.</p></div><i>↗</i></a>
          <a href="/sessions"><span>03</span><div><strong>Working session</strong><p>Book focused time for a live technical problem.</p></div><i>→</i></a>
        </div>
      </section>
    </main>
  );
}
