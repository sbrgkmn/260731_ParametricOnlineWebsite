import Link from "next/link";
import type { Tutorial } from "../lib/content";

export function LessonCard({ tutorial }: { tutorial: Tutorial }) {
  return (
    <article className="tutorial-card">
      <Link href={`/tutorials/${tutorial.slug}`}>
        <div className="tutorial-thumbnail">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={tutorial.thumbnailUrl}
            alt={`Tutorial output for ${tutorial.title}`}
            loading="lazy"
            width="480"
            height="360"
          />
          <span className="play-badge" aria-hidden="true">
            Play
          </span>
        </div>
        <div className="tutorial-card-copy">
          <div className="meta-row">
            <span>{tutorial.software.join(" + ")}</span>
            <span>{tutorial.duration}</span>
            <span>{tutorial.difficulty}</span>
          </div>
          <h3>{tutorial.title}</h3>
          <p>{tutorial.summary}</p>
          <span className="text-link">
            Open tutorial <span aria-hidden="true">→</span>
          </span>
        </div>
      </Link>
    </article>
  );
}
