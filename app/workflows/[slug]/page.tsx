import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonCard } from "../../components/LessonCard";
import { ProductCard } from "../../components/ProductCard";
import {
  getStream,
  getTutorialsForStream,
  scriptProducts,
  workflowStreams,
} from "../../lib/content";
import { siteConfig } from "../../lib/site";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return workflowStreams.map((stream) => ({ slug: stream.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const stream = getStream(slug);
  if (!stream) return {};
  return {
    title: stream.title,
    description: stream.introduction,
    alternates: { canonical: `/workflows/${stream.slug}` },
  };
}

export default async function WorkflowPage({ params }: PageProps) {
  const { slug } = await params;
  const stream = getStream(slug);
  if (!stream) notFound();

  const streamTutorials = getTutorialsForStream(stream.slug);
  const startHere = streamTutorials.filter(
    (tutorial) => tutorial.stage === "start",
  );
  const goDeeper = streamTutorials.filter(
    (tutorial) => tutorial.stage === "deeper",
  );
  const relatedProducts = stream.slug === "generative-ai" ? scriptProducts : [];

  return (
    <main>
      <section className="page-hero shell workflow-hero">
        <p className="eyebrow">Workflow stream</p>
        <h1>{stream.title}</h1>
        <p>{stream.introduction}</p>
        <div className="tag-row">
          {stream.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </section>

      <section className="section shell">
        <div className="friendly-heading compact-heading">
          <div>
            <p className="eyebrow">Start here</p>
            <h2>Build the core workflow.</h2>
          </div>
        </div>
        <div className="tutorial-grid tutorial-grid-three">
          {startHere.map((tutorial) => (
            <LessonCard tutorial={tutorial} key={tutorial.id} />
          ))}
        </div>
      </section>

      {goDeeper.length > 0 && (
        <section className="section section-tinted">
          <div className="shell">
            <div className="friendly-heading compact-heading">
              <div>
                <p className="eyebrow">Go deeper</p>
                <h2>Extend the method.</h2>
              </div>
            </div>
            <div className="tutorial-grid tutorial-grid-three">
              {goDeeper.map((tutorial) => (
                <LessonCard tutorial={tutorial} key={tutorial.id} />
              ))}
            </div>
          </div>
        </section>
      )}

      {relatedProducts.length > 0 && (
        <section className="section shell">
          <div className="friendly-heading compact-heading">
            <div>
              <p className="eyebrow">Related downloads</p>
              <h2>Open the working files.</h2>
            </div>
          </div>
          <div className="script-grid">
            {relatedProducts.map((product) => (
              <ProductCard product={product} key={product.id} />
            ))}
          </div>
        </section>
      )}

      <section className="workflow-actions shell">
        <div>
          <p className="eyebrow">Questions</p>
          <h2>Compare methods with the community.</h2>
          {siteConfig.discordUrl ? (
            <a
              className="text-link"
              href={siteConfig.discordUrl}
              target="_blank"
              rel="noreferrer"
            >
              Discuss on Discord ↗
            </a>
          ) : (
            <Link className="text-link" href="/community">
              Community details →
            </Link>
          )}
        </div>
        <div>
          <p className="eyebrow">Stuck on a project?</p>
          <h2>Work through it with an expert.</h2>
          <Link className="text-link" href="/expert-help">
            Book help →
          </Link>
        </div>
      </section>
    </main>
  );
}
