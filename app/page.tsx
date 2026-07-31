import type { Metadata } from "next";
import Link from "next/link";
import { LessonCard } from "./components/LessonCard";
import { NewsletterBlock } from "./components/NewsletterBlock";
import { GenerativeBackground } from "./components/GenerativeBackground";
import { ProductCard } from "./components/ProductCard";
import { SectionHeading } from "./components/SectionHeading";
import { lessons } from "./lib/lessons";
import { products } from "./lib/products";
import { sessions, siteConfig } from "./lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <main>
      <section className="hero generative-hero">
        <GenerativeBackground />
        <div className="hero-index" aria-hidden="true">
          <span>PO / SYSTEMS</span>
          <span>2026.07</span>
        </div>
        <div className="hero-copy">
          <p className="eyebrow">Tools, workflows, and focused guidance</p>
          <h1>Practical systems for computational design.</h1>
          <p className="hero-description">
            Grasshopper scripts, ComfyUI workflows, and focused guidance for
            architects, designers, and educators.
          </p>
          <div className="button-row">
            <Link className="button button-primary" href="/tools">
              Browse tools
            </Link>
            <Link className="button button-secondary" href="/sessions">
              Book a session
            </Link>
          </div>
          <a
            className="inline-link"
            href={siteConfig.skoolUrl}
            target="_blank"
            rel="noreferrer"
          >
            Join Parametric Lab ↗
          </a>
        </div>
      </section>

      <section className="section shell">
        <SectionHeading
          index="01"
          eyebrow="Selected tools"
          title="Ready-to-use systems. Built to be understood."
          action={<Link className="text-link" href="/tools">View all tools →</Link>}
        />
        <div className="product-grid">
          {products.filter((product) => product.featured).slice(0, 3).map((product) => (
            <ProductCard product={product} key={product.slug} />
          ))}
        </div>
      </section>

      <section className="section category-section">
        <div className="shell">
          <SectionHeading
            index="02"
            eyebrow="Categories"
            title="Choose your working environment."
          />
          <div className="category-grid">
            {[
              ["Grasshopper", "Definitions for geometry, systems, and fabrication.", "03 systems"],
              ["ComfyUI", "Repeatable visual workflows for design exploration.", "01 workflow"],
              ["Free resources", "Starter files, checklists, and teaching aids.", "Open access"],
            ].map(([title, copy, count], index) => (
              <Link className="category-card" href={`/tools?category=${encodeURIComponent(title)}`} key={title}>
                <span className="category-number">0{index + 1}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
                <span className="meta-chip">{count}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section shell">
        <SectionHeading
          index="03"
          eyebrow="Selected lessons"
          title="Learn the logic, not just the clicks."
          action={<Link className="text-link" href="/learn">Open library →</Link>}
        />
        <div className="lesson-grid lesson-grid-three">
          {lessons.slice(0, 3).map((lesson) => (
            <LessonCard lesson={lesson} key={lesson.title} />
          ))}
        </div>
      </section>

      <section className="split-section">
        <div className="split-panel split-panel-dark">
          <p className="eyebrow">04 / Working sessions</p>
          <h2>Bring the difficult part.</h2>
          <p>
            Focused one-to-one support for definitions, AI workflows, project
            strategy, and technical teaching.
          </p>
          <div className="compact-list">
            {sessions.map((session) => (
              <div key={session.title}>
                <span>{session.title}</span>
                <span>{session.duration}</span>
              </div>
            ))}
          </div>
          <Link className="button button-invert" href="/sessions">
            Compare sessions
          </Link>
        </div>
        <div className="split-panel split-panel-lab">
          <p className="eyebrow">05 / Parametric Lab</p>
          <h2>Build in public. Learn with peers.</h2>
          <p>
            Join a free community for computational designers sharing working
            methods, useful references, and honest project feedback.
          </p>
          <div className="lab-diagram" aria-hidden="true">
            <span>YOU</span><span>TOOLS</span><span>PEERS</span><span>OUTPUT</span>
          </div>
          <Link className="button button-secondary" href="/lab">
            Explore the Lab
          </Link>
        </div>
      </section>

      <div className="shell section">
        <NewsletterBlock />
      </div>

      <section className="about-strip shell">
        <p className="eyebrow">07 / About the creator</p>
        <div>
          <h2>Made by Sabri Gokmen.</h2>
          <p>
            Computational designer, researcher, educator, and builder of
            practical systems across geometry, fabrication, and AI-assisted
            design.
          </p>
          <Link className="text-link" href="/about">Read the story →</Link>
        </div>
      </section>
    </main>
  );
}
