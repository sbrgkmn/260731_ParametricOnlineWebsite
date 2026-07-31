import type { Metadata } from "next";
import { siteConfig } from "../lib/site";

export const metadata: Metadata = {
  title: "Parametric Lab Community",
  description: "A free community for computational designers, with a future Lab Plus membership.",
  alternates: { canonical: "/lab" },
};

export default function LabPage() {
  return (
    <main>
      <section className="lab-hero shell">
        <div>
          <p className="eyebrow">Parametric Lab / Free community</p>
          <h1>A shared workspace for computational designers.</h1>
          <p>Show unfinished work. Compare methods. Ask better technical questions. Build a practice around systems—not isolated tricks.</p>
          <a className="button button-primary" href={siteConfig.skoolUrl} target="_blank" rel="noreferrer">Join free on Skool ↗</a>
        </div>
        <div className="community-map" aria-label="Diagram connecting questions, workflows, feedback, and shared outcomes">
          <span>QUESTIONS</span><span>WORKFLOWS</span><span>FEEDBACK</span><span>OUTPUTS</span><strong>LAB</strong>
        </div>
      </section>
      <section className="shell section">
        <div className="benefit-grid">
          <article><span>01</span><h2>Working notes</h2><p>Share what you tried, where it failed, and what changed the outcome.</p></article>
          <article><span>02</span><h2>Peer feedback</h2><p>Get practical responses from people who understand node systems and design constraints.</p></article>
          <article><span>03</span><h2>Resource drops</h2><p>Receive templates, reference lists, and small reusable files from the Parametric.Online archive.</p></article>
        </div>
      </section>
      <section className="lab-plus-section">
        <div className="shell split-copy">
          <div><p className="eyebrow">Future / Lab Plus</p><h2>A deeper working membership.</h2></div>
          <div><p>Lab Plus is planned as an optional paid layer with monthly working sessions, detailed file reviews, and extended resource drops.</p><p className="form-note">Lab Plus is not yet available. No subscription is being sold on this site.</p></div>
        </div>
      </section>
    </main>
  );
}
