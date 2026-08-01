import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "../lib/site";

export const metadata: Metadata = {
  title: "About Sabri Gokmen",
  description:
    "The computational designer, researcher, and educator behind Parametric Online.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main>
      <section className="page-hero shell">
        <p className="eyebrow">About / Sabri Gokmen</p>
        <h1>Research depth, open teaching, practical builds.</h1>
        <p>
          Parametric Online translates long-term work in computational design,
          generative systems, artificial intelligence, and material fabrication
          into tutorials and files designers can use.
        </p>
      </section>
      <section className="section shell about-layout">
        <div>
          <p className="eyebrow">Practice</p>
          <h2>
            Computational systems should remain legible after the demonstration.
          </h2>
        </div>
        <div className="about-body">
          <p>
            Sabri Gokmen is a computational designer, researcher, and educator
            with more than fifteen years of experience across parametric
            modeling, generative art, digital fabrication, and software
            development.
          </p>
          <p>
            Parametric Online is the creator-led learning side of that practice:
            free videos, selected code, direct technical support, and a place to
            compare working methods.
          </p>
          <div className="button-row">
            <Link className="button button-primary" href="/learn">
              Explore tutorials
            </Link>
            <a
              className="button button-secondary"
              href={siteConfig.portfolioUrl}
              target="_blank"
              rel="noreferrer"
            >
              View portfolio ↗
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
