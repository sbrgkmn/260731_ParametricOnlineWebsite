import type { Lesson } from "../lib/lessons";

export function LessonCard({ lesson }: { lesson: Lesson }) {
  return (
    <article className="lesson-card">
      <a href={lesson.youtubeUrl} target="_blank" rel="noreferrer">
        <div className="lesson-visual" aria-hidden="true">
          <span className="play-button">▶</span>
          <span className="lesson-code">{lesson.category.slice(0, 3).toUpperCase()}</span>
        </div>
        <div className="lesson-copy">
          <div className="meta-row">
            <span>{lesson.category}</span>
            <span>{lesson.duration}</span>
            <span>{lesson.level}</span>
          </div>
          <h3>{lesson.title}</h3>
          <p>{lesson.summary}</p>
          <span className="text-link">Watch lesson ↗</span>
        </div>
      </a>
    </article>
  );
}

