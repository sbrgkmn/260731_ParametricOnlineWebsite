import Link from "next/link";
import type { Product } from "../lib/products";
import { ProductVisual } from "./ProductVisual";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="product-card">
      <Link href={`/tools/${product.slug}`} className="card-visual-link">
        <ProductVisual
          variant={product.featuredImage}
          label={product.title}
          compact
        />
      </Link>
      <div className="product-card-copy">
        <div className="meta-row">
          <span>{product.category}</span>
          <span>{product.softwareVersion}</span>
          <span>{product.difficulty}</span>
        </div>
        <h3>
          <Link href={`/tools/${product.slug}`}>{product.title}</Link>
        </h3>
        <p>{product.summary}</p>
        <div className="card-footer">
          <span>{product.price}</span>
          <Link href={`/tools/${product.slug}`}>View system →</Link>
        </div>
      </div>
    </article>
  );
}

