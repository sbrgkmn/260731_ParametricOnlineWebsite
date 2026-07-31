import type { ReactNode } from "react";

export function SectionHeading({
  index,
  eyebrow,
  title,
  action,
}: {
  index: string;
  eyebrow: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">
          {index} / {eyebrow}
        </p>
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  );
}

