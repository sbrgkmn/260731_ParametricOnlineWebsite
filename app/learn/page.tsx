import type { Metadata } from "next";
import Link from "next/link";
import { LessonCard } from "../components/LessonCard";
import {
  getTutorialsForStream,
  tutorials,
  workflowStreams,
} from "../lib/content";
import { siteConfig } from "../lib/site";

export const metadata: Metadata = {
  title: "Learn Computational Design",
  description:
    "Free computational-design tutorials organized into parametric design, creative scripting, generative AI, and digital fabrication workflows.",
  alternates: { canonical: "/learn" },
};

export default function LearnPage() {
  const videos = tutorials.map((tutorial) => ({
    "@type": "VideoObject",
    name: tutorial.title,
    description: tutorial.summary,
    duration: `PT${tutorial.durationSeconds}S`,
    thumbnailUrl: tutorial.thumbnailUrl,
    embedUrl: `https://www.youtube.com/embed/${tutorial.id}`,
    url: tutorial.youtubeUrl,
  }));

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": videos,
          }),
        }}
      />
      <section className="page-hero shell">
        <p className="eyebrow">Learn / Curated workflow streams</p>
        <h1>Free tutorials for building computational systems.</h1>
        <p>
          Twelve selected lessons from the Parametric channel, arranged around
          practical outcomes rather than software categories.
        </p>
        <a
          className="text-link"
          href={siteConfig.youtubeUrl}
          target="_blank"
          rel="noreferrer"
        >
          Visit the full YouTube archive ↗
        </a>
      </section>

      <section className="section shell" id="workflows">
        <div className="stream-directory">
          {workflowStreams.map((stream, index) => (
            <Link href={`/workflows/${stream.slug}`} key={stream.slug}>
              <span>0{index + 1}</span>
              <h2>{stream.title}</h2>
              <p>{stream.shortDescription}</p>
              <strong>
                {getTutorialsForStream(stream.slug).length} tutorials →
              </strong>
            </Link>
          ))}
        </div>
      </section>

      {workflowStreams.map((stream) => (
        <section
          className="section section-tinted stream-preview"
          key={stream.slug}
        >
          <div className="shell">
            <div className="friendly-heading compact-heading">
              <div>
                <p className="eyebrow">{stream.title}</p>
                <h2>{stream.introduction}</h2>
              </div>
              <Link className="text-link" href={`/workflows/${stream.slug}`}>
                Open stream →
              </Link>
            </div>
            <div className="tutorial-grid tutorial-grid-three">
              {getTutorialsForStream(stream.slug).map((tutorial) => (
                <LessonCard tutorial={tutorial} key={tutorial.id} />
              ))}
            </div>
          </div>
        </section>
      ))}
    </main>
  );
}
