import type { Metadata } from "next";
import { ProductCard } from "../components/ProductCard";
import { products } from "../lib/products";

export const metadata: Metadata = {
  title: "Computational Design Tools",
  description:
    "Grasshopper scripts, ComfyUI workflows, and free resources for computational designers.",
  alternates: { canonical: "/tools" },
};

export default function ToolsPage() {
  return (
    <main>
      <section className="page-hero shell">
        <p className="eyebrow">Tools / Catalog</p>
        <h1>Systems for making, testing, and teaching.</h1>
        <p>
          Clear files, documented inputs, and practical outcomes. Every paid
          tool is delivered securely through Lemon Squeezy.
        </p>
      </section>
      <section className="shell section tools-catalog">
        <div className="filter-row" aria-label="Tool categories">
          <a href="#all" className="filter-active">All <span>{products.length}</span></a>
          <a href="#grasshopper">Grasshopper <span>{products.filter((p) => p.category === "Grasshopper").length}</span></a>
          <a href="#comfyui">ComfyUI <span>0</span></a>
          <a href="#free-resources">Free resources <span>0</span></a>
        </div>
        <div className="product-grid" id="all">
          {products.map((product) => (
            <ProductCard product={product} key={product.slug} />
          ))}
        </div>
        <div className="catalog-note">
          <p className="eyebrow">Next release</p>
          <h2>ComfyUI architectural study kit</h2>
          <p>
            A documented node workflow for repeatable material, lighting, and
            composition studies. Join the list on the home page for release notes.
          </p>
        </div>
      </section>
    </main>
  );
}
