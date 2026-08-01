import type { ScriptProduct } from "../lib/content";

export function ProductCard({ product }: { product: ScriptProduct }) {
  return (
    <article className="script-card">
      <a href={product.downloadUrl} target="_blank" rel="noreferrer">
        <div className="script-thumbnail">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.thumbnailUrl}
            alt={`Output preview for ${product.title}`}
            loading="lazy"
            width="480"
            height="360"
          />
        </div>
        <div className="script-card-copy">
          <div className="meta-row">
            <span>{product.software.join(" + ")}</span>
            <span>{product.difficulty}</span>
          </div>
          <h3>{product.title}</h3>
          <p>{product.outcome}</p>
          <div className="script-card-footer">
            <span>{product.accessType}</span>
            <strong>
              Download <span aria-hidden="true">↗</span>
            </strong>
          </div>
        </div>
      </a>
    </article>
  );
}
