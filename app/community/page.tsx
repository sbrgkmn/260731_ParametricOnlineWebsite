import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "../lib/site";

export const metadata: Metadata = {
  title: "Parametric Online Community",
  description:
    "Ask workflow questions, share experiments, and follow new computational-design tutorials and tools.",
  alternates: { canonical: "/community" },
};

export default function CommunityPage() {
  return (
    <main>
      <section className="page-hero shell community-hero">
        <p className="eyebrow">Community / Discord</p>
        <h1>Build with the community.</h1>
        <p>
          Ask workflow questions, share experiments and follow new Parametric
          Online tutorials and tools.
        </p>
        <a
          className="button button-primary"
          href={siteConfig.discordUrl}
          target="_blank"
          rel="noreferrer"
        >
          Join the discussion on Discord ↗
        </a>
      </section>

      <section className="section shell community-principles">
        <article>
          <span>01</span>
          <h2>Ask with context</h2>
          <p>
            Share the goal, software, files, and the point where the workflow
            stops behaving as expected.
          </p>
        </article>
        <article>
          <span>02</span>
          <h2>Show experiments</h2>
          <p>
            Post unfinished studies and compare the decisions behind different
            computational approaches.
          </p>
        </article>
        <article>
          <span>03</span>
          <h2>Follow new work</h2>
          <p>
            Keep up with new tutorials, scripts, and workflow notes without a
            separate course platform.
          </p>
        </article>
      </section>

      <section className="workflow-actions shell single-action">
        <div>
          <p className="eyebrow">Need focused help?</p>
          <h2>Move a specific project forward one-to-one.</h2>
          <Link className="text-link" href="/expert-help">
            See expert-help formats →
          </Link>
        </div>
      </section>
    </main>
  );
}
