import type { Metadata } from "next";
import Link from "next/link";
import { GenerativeBackground } from "./components/GenerativeBackground";
import { siteConfig } from "./lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const homeActions = [
  {
    label: "Learn",
    title: "Watch tutorials",
    description: "Free computational-design lessons and complete workflows.",
    href: siteConfig.youtubeUrl,
    external: true,
  },
  {
    label: "Starter Kits",
    title: "Download working files",
    description: "Scripts, definitions, and starter packages for rebuilding.",
    href: "/scripts",
    external: false,
  },
  {
    label: "Community",
    title: "Join the discussion",
    description: "Ask questions, compare methods, and share experiments.",
    href: siteConfig.discordUrl,
    external: true,
  },
  {
    label: "Work Together",
    title: "Book a 1:1 or consultation",
    description: "Focused technical help or larger professional collaboration.",
    href: "/expert-help",
    external: false,
  },
] as const;

function ActionContent({
  action,
  index,
}: {
  action: (typeof homeActions)[number];
  index: number;
}) {
  return (
    <>
      <span className="home-action-index">0{index + 1}</span>
      <div>
        <p>{action.label}</p>
        <h3>{action.title}</h3>
      </div>
      <p className="home-action-description">{action.description}</p>
      <span className="home-action-arrow" aria-hidden="true">
        {action.external ? "↗" : "→"}
      </span>
    </>
  );
}

export default function Home() {
  return (
    <main>
      <section className="hero generative-hero">
        <div className="hero-intro">
          <div className="shell hero-shell">
            <div className="hero-copy">
              <p className="eyebrow">
                Computational design / Tutorials + working files
              </p>
              <h1>Learn computational design by building.</h1>
              <p className="hero-description">
                Practical methods for parametric design, creative code,
                generative AI, and digital fabrication.
              </p>
              <div className="button-row hero-actions">
                <a
                  className="button button-primary"
                  href={siteConfig.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Learn on YouTube ↗
                </a>
                <Link className="button button-secondary" href="/scripts">
                  Browse Starter Kits
                </Link>
              </div>
            </div>
          </div>
        </div>
        <GenerativeBackground />
      </section>

      <section className="home-index shell" aria-labelledby="home-index-title">
        <div className="home-index-heading">
          <p className="eyebrow">Choose a path</p>
          <h2 id="home-index-title">Four ways in.</h2>
        </div>
        <div className="home-action-list">
          {homeActions.map((action, index) =>
            action.external ? (
              <a
                className="home-action"
                href={action.href}
                key={action.label}
                target="_blank"
                rel="noreferrer"
              >
                <ActionContent action={action} index={index} />
              </a>
            ) : (
              <Link
                className="home-action"
                href={action.href}
                key={action.label}
              >
                <ActionContent action={action} index={index} />
              </Link>
            ),
          )}
        </div>
      </section>
    </main>
  );
}
