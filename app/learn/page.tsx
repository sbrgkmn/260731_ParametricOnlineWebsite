import type { Metadata } from "next";
import { lessons } from "../lib/lessons";
import { siteConfig } from "../lib/site";
import { LessonLibrary } from "./LessonLibrary";

export const metadata: Metadata = {
  title: "Learn Computational Design",
  description: "Selected Grasshopper, ComfyUI, geometry, and fabrication lessons from Parametric.Online.",
  alternates: { canonical: "/learn" },
};

export default function LearnPage() {
  const videos = lessons.filter((lesson) => lesson.youtubeId).map((lesson) => ({
    "@type": "VideoObject",
    name: lesson.title,
    description: lesson.summary,
    thumbnailUrl: `https://i.ytimg.com/vi/${lesson.youtubeId}/maxresdefault.jpg`,
    embedUrl: `https://www.youtube.com/embed/${lesson.youtubeId}`,
    url: lesson.youtubeUrl,
  }));
  const jsonLd = { "@context": "https://schema.org", "@graph": videos };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="page-hero shell">
        <p className="eyebrow">Learn / Video library</p>
        <h1>Understand the system behind the result.</h1>
        <p>Selected lessons for computational designers—organized locally, with no YouTube API dependency.</p>
        <a className="text-link" href={siteConfig.youtubeUrl} target="_blank" rel="noreferrer">Visit the channel ↗</a>
      </section>
      <section className="shell section">
        <LessonLibrary lessons={lessons} />
      </section>
    </main>
  );
}
