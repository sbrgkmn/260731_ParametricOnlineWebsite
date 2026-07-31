import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Sabri Gokmen",
  description: "The designer, researcher, and educator behind Parametric.Online.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main>
      <section className="page-hero shell">
        <p className="eyebrow">About / Sabri Gokmen</p>
        <h1>Research depth. Practical tools. Open teaching.</h1>
        <p>Parametric.Online connects more than a decade of work in computational design, generative systems, digital fabrication, software development, and education.</p>
      </section>
      <section className="shell section about-layout">
        <div className="about-statement">
          <p className="eyebrow">Practice</p>
          <h2>I build computational systems that stay legible after the demo.</h2>
        </div>
        <div className="about-body">
          <p>Sabri Gokmen is a computational designer, researcher, and educator trained in architecture. His work spans parametric modeling, generative art, digital fabrication, AI-assisted design, and software development.</p>
          <p>Parametric.Online is the practical side of that work: tested scripts, structured workflows, direct teaching, and a community where designers can compare methods without hiding the difficult parts.</p>
          <p>The aim is simple—help architects, designers, and educators move from scattered experiments to systems they can understand, adapt, and use with confidence.</p>
          <div className="button-row"><Link className="button button-primary" href="/tools">Explore the tools</Link><Link className="button button-secondary" href="/contact">Start a conversation</Link></div>
        </div>
      </section>
      <section className="shell principle-grid section">
        <article><span>01</span><h3>Legibility first</h3><p>Definitions should explain themselves through naming, grouping, and exposed logic.</p></article>
        <article><span>02</span><h3>Practical rigor</h3><p>A tool earns its place by surviving project constraints, handoff, and reuse.</p></article>
        <article><span>03</span><h3>Teach the system</h3><p>Good instruction reveals decisions and tradeoffs—not only a sequence of clicks.</p></article>
      </section>
    </main>
  );
}
