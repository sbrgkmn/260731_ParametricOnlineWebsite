import type { Metadata } from "next";
import Link from "next/link";
import { GenerativeBackground } from "./components/GenerativeBackground";
import { LessonCard } from "./components/LessonCard";
import { ProductCard } from "./components/ProductCard";
import { scriptProducts, tutorials, workflowStreams } from "./lib/content";
import { siteConfig } from "./lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const pathways = [
  {
    title: "Watch",
    description: "Selected tutorials organized into practical workflows.",
    href: "/learn",
  },
  {
    title: "Download",
    description: "Clean scripts, starter files, and workflow kits.",
    href: "/scripts",
  },
  {
    title: "Community",
    description: "Ask questions and share your work on Discord.",
    href: "/community",
  },
  {
    title: "Expert Help",
    description: "Book a working session or discuss a consultancy.",
    href: "/expert-help",
  },
];

export default function Home() {
  const featuredTutorials = tutorials
    .filter((tutorial) => tutorial.featured)
    .slice(0, 6);

  return (
    <main>
      <section className="hero generative-hero">
        <div className="hero-intro">
          <div className="shell hero-shell">
            <div className="hero-copy">
              <p className="eyebrow">
                Computational design / Free learning + working files
              </p>
              <h1>Learn computational design by building.</h1>
              <p className="hero-description">
                Free tutorials, downloadable scripts and expert support for
                architects and designers working with parametric design,
                creative code, generative AI and digital fabrication.
              </p>
              <div className="button-row hero-actions">
                <Link className="button button-primary" href="/learn#workflows">
                  Explore Workflows
                </Link>
                <Link className="button button-secondary" href="/scripts">
                  Browse Scripts
                </Link>
              </div>
              <div className="hero-secondary-actions">
                <Link href="/expert-help#working-session">
                  Book a Working Session
                </Link>
                <a
                  href={siteConfig.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Watch on YouTube ↗
                </a>
              </div>
              <p className="credibility">
                15K+ YouTube subscribers <span>•</span> 200+ tutorials
              </p>
            </div>
          </div>
        </div>
        <div className="generative-stage">
          <GenerativeBackground />
        </div>
      </section>

      <section
        className="pathway-strip shell"
        aria-label="Ways to use Parametric Online"
      >
        {pathways.map((pathway, index) => (
          <Link href={pathway.href} key={pathway.title}>
            <span className="pathway-index">0{index + 1}</span>
            <h2>{pathway.title}</h2>
            <p>{pathway.description}</p>
            <span aria-hidden="true">→</span>
          </Link>
        ))}
      </section>

      <section className="section shell" id="workflows">
        <div className="friendly-heading">
          <div>
            <p className="eyebrow">Workflow streams</p>
            <h2>Start with an outcome, not a software menu.</h2>
          </div>
          <Link className="text-link" href="/learn">
            View all tutorials →
          </Link>
        </div>
        <div className="stream-grid">
          {workflowStreams.map((stream, index) => (
            <Link
              className="stream-card"
              href={`/workflows/${stream.slug}`}
              key={stream.slug}
            >
              <span className="stream-index">0{index + 1}</span>
              <h3>{stream.title}</h3>
              <p>{stream.shortDescription}</p>
              <div className="tag-row">
                {stream.tags.slice(0, 3).map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section section-tinted">
        <div className="shell">
          <div className="friendly-heading">
            <div>
              <p className="eyebrow">Featured tutorials</p>
              <h2>Watch the method. Rebuild the system.</h2>
            </div>
            <a
              className="text-link"
              href={siteConfig.youtubeUrl}
              target="_blank"
              rel="noreferrer"
            >
              YouTube channel ↗
            </a>
          </div>
          <div className="tutorial-grid">
            {featuredTutorials.map((tutorial) => (
              <LessonCard tutorial={tutorial} key={tutorial.id} />
            ))}
          </div>
        </div>
      </section>

      <section className="section shell">
        <div className="friendly-heading compact-heading">
          <div>
            <p className="eyebrow">Scripts and starter files</p>
            <h2>Keep the code beside the lesson.</h2>
          </div>
          <Link className="text-link" href="/scripts">
            Browse scripts →
          </Link>
        </div>
        <div className="script-grid">
          {scriptProducts.slice(0, 3).map((product) => (
            <ProductCard product={product} key={product.id} />
          ))}
        </div>
      </section>

      <section className="support-band">
        <div className="shell support-grid">
          <div>
            <p className="eyebrow">Community</p>
            <h2>Build with the community.</h2>
            <p>
              Ask workflow questions, share experiments and follow new
              Parametric Online tutorials and tools.
            </p>
            {siteConfig.discordUrl ? (
              <a
                className="text-link"
                href={siteConfig.discordUrl}
                target="_blank"
                rel="noreferrer"
              >
                Join Discord ↗
              </a>
            ) : (
              <Link className="text-link" href="/community">
                Community details →
              </Link>
            )}
          </div>
          <div>
            <p className="eyebrow">Expert help</p>
            <h2>Bring the difficult part.</h2>
            <p>
              Work one-to-one on a definition, workflow, script or fabrication
              question—or discuss a larger professional consultancy.
            </p>
            <Link className="text-link" href="/expert-help">
              See help formats →
            </Link>
          </div>
        </div>
      </section>

      <section className="creator-strip shell">
        <p className="eyebrow">Created by Sabri Gokmen</p>
        <div>
          <h2>Research-led methods, explained through practical builds.</h2>
          <p>
            Computational design across morphology, artificial intelligence, and
            material fabrication—translated into useful tutorials and working
            files.
          </p>
          <div className="creator-links">
            <Link className="text-link" href="/about">
              About Parametric Online →
            </Link>
            <a
              className="text-link"
              href={siteConfig.portfolioUrl}
              target="_blank"
              rel="noreferrer"
            >
              Related portfolio ↗
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
