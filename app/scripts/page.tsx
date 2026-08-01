import type { Metadata } from "next";
import { ProductCard } from "../components/ProductCard";
import { scriptProducts } from "../lib/content";
import { siteConfig } from "../lib/site";

export const metadata: Metadata = {
  title: "Scripts and Workflow Files",
  description:
    "Verified downloadable scripts and workflow files connected to Parametric Online tutorials.",
  alternates: { canonical: "/scripts" },
};

export default function ScriptsPage() {
  return (
    <main>
      <section className="page-hero shell">
        <p className="eyebrow">Scripts / Working files</p>
        <h1>Download the code behind the workflow.</h1>
        <p>
          Foundational files, tutorial scripts, and multi-step workflow kits.
          Only resources with verified public download destinations are listed.
        </p>
      </section>

      <section className="section shell">
        <div className="library-key" aria-label="Supported script types">
          <span>Foundational files</span>
          <span>Tutorial scripts</span>
          <span>Workflow kits</span>
        </div>
        <div className="script-grid">
          {scriptProducts.map((product) => (
            <ProductCard product={product} key={product.id} />
          ))}
        </div>
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
