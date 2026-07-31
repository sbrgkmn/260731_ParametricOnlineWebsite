"use client";

import { useState } from "react";
import { LessonCard } from "../components/LessonCard";
import type { Lesson, LessonCategory } from "../lib/lessons";

const filters: (LessonCategory | "All")[] = [
  "All",
  "Grasshopper",
  "ComfyUI",
  "AI + Geometry",
  "Digital Fabrication",
];

export function LessonLibrary({ lessons }: { lessons: Lesson[] }) {
  const [active, setActive] = useState<(typeof filters)[number]>("All");
  const visible = active === "All" ? lessons : lessons.filter((lesson) => lesson.category === active);

  return (
    <>
      <div className="filter-row filter-buttons" aria-label="Filter lessons">
        {filters.map((filter) => (
          <button
            className={filter === active ? "filter-active" : ""}
            type="button"
            aria-pressed={filter === active}
            onClick={() => setActive(filter)}
            key={filter}
          >
            {filter} <span>{filter === "All" ? lessons.length : lessons.filter((lesson) => lesson.category === filter).length}</span>
          </button>
        ))}
      </div>
      <div className="lesson-grid">
        {visible.map((lesson) => <LessonCard lesson={lesson} key={lesson.title} />)}
      </div>
    </>
  );
}

