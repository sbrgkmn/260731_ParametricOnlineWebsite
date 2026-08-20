import type { Metadata } from "next";
import { Marketplace } from "../components/Marketplace";
import { marketplaceProducts } from "../lib/content";
import { siteConfig } from "../lib/site";

export const metadata: Metadata = {
  title: "Marketplace",
  description:
    "Download Grasshopper, scripting, and generative AI resources from Parametric Online.",
  alternates: { canonical: "/scripts" },
};

export default function ScriptsPage() {
  return (
    <main>
      <section className="page-hero shell">
        <p className="eyebrow">Marketplace / Downloadable content</p>
        <h1>One library for computational design.</h1>
        <p>
          Browse Grasshopper definitions, scripts, and generative AI workflows.
          Start free, then move into larger working collections.
        </p>
      </section>

      <section className="section shell">
        <Marketplace products={marketplaceProducts} />
      </section>

      {siteConfig.supportUrl && (
        <section className="support-note shell">
          <p>Want to support free tutorial files?</p>
          <a
            className="text-link"
            href={siteConfig.supportUrl}
            target="_blank"
            rel="noreferrer"
          >
            Support Parametric Online ↗
          </a>
        </section>
      )}
    </main>
  );
}
