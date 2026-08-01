import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getScriptProduct,
  getStream,
  getTutorial,
  tutorials,
} from "../../lib/content";
import { siteConfig } from "../../lib/site";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return tutorials.map((tutorial) => ({ slug: tutorial.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tutorial = getTutorial(slug);
  if (!tutorial) return {};
  return {
    title: tutorial.title,
    description: tutorial.summary,
    alternates: { canonical: `/tutorials/${tutorial.slug}` },
    openGraph: {
      images: [
        {
          url: tutorial.thumbnailUrl,
          width: 480,
          height: 360,
          alt: tutorial.title,
        },
      ],
    },
  };
}

export default async function TutorialPage({ params }: PageProps) {
  const { slug } = await params;
  const tutorial = getTutorial(slug);
  if (!tutorial) notFound();
  const stream = getStream(tutorial.stream);
  const relatedScript = getScriptProduct(tutorial.relatedScriptId);

  return (
    <main>
      <section className="tutorial-detail shell">
        <div className="tutorial-detail-copy">
          <p className="eyebrow">{stream?.title} / Free tutorial</p>
          <h1>{tutorial.title}</h1>
          <div className="meta-row tutorial-meta">
            <span>{tutorial.software.join(" + ")}</span>
            <span>{tutorial.difficulty}</span>
            <span>{tutorial.duration}</span>
          </div>
          <p className="tutorial-lead">{tutorial.summary}</p>
          <div className="tutorial-actions">
            <a
              className="button button-primary"
              href={tutorial.youtubeUrl}
              target="_blank"
              rel="noreferrer"
            >
              Watch Free ↗
            </a>
            {relatedScript && (
              <a
                className="button button-secondary"
                href={relatedScript.downloadUrl}
                target="_blank"
                rel="noreferrer"
              >
                Download Code ↗
              </a>
            )}
            {siteConfig.discordUrl && (
              <a
                className="text-link"
                href={siteConfig.discordUrl}
                target="_blank"
                rel="noreferrer"
              >
                Discuss on Discord ↗
              </a>
            )}
            <Link className="text-link" href="/expert-help">
              Book Help →
            </Link>
          </div>
        </div>
        <div className="video-frame">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${tutorial.id}`}
            title={`${tutorial.title} video tutorial`}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </section>

      <section className="section shell tutorial-notes">
        <div>
          <p className="eyebrow">Key concepts</p>
          <ul className="plain-list">
            {tutorial.keyConcepts.map((concept) => (
              <li key={concept}>{concept}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow">Required software</p>
          <ul className="plain-list">
            {tutorial.requirements.map((requirement) => (
              <li key={requirement}>{requirement}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow">Continue</p>
          <Link className="text-link" href={`/workflows/${tutorial.stream}`}>
            Return to {stream?.title} →
          </Link>
        </div>
      </section>
    </main>
  );
}
