import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "../../components/ProductCard";
import { ProductVisual } from "../../components/ProductVisual";
import {
  getProduct,
  getRelatedProducts,
  products,
} from "../../lib/products";
import { siteConfig } from "../../lib/site";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: product.title,
    description: product.summary,
    alternates: { canonical: `/tools/${product.slug}` },
    openGraph: {
      title: `${product.title} — Parametric.Online`,
      description: product.summary,
      type: "website",
      url: `${siteConfig.origin}/tools/${product.slug}`,
    },
  };
}

export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const related = getRelatedProducts(product);
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: product.title,
    description: product.summary,
    applicationCategory: "DesignApplication",
    operatingSystem: "Windows, macOS",
    softwareVersion: product.softwareVersion,
    offers: {
      "@type": "Offer",
      price: product.price.replace(/[^0-9.]/g, ""),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: product.checkoutUrl,
    },
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <section className="product-hero shell">
        <div className="product-preview-stack">
          <ProductVisual variant={product.featuredImage} label={product.title} />
          <div className="preview-tabs" aria-label="Available previews">
            {product.gallery.map((item, index) => (
              <span className={index === 0 ? "active" : ""} key={item}>
                0{index + 1} / {item.replaceAll("-", " ")}
              </span>
            ))}
          </div>
        </div>
        <div className="product-purchase">
          <Link className="back-link" href="/tools">← All tools</Link>
          <div className="meta-row">
            <span>{product.category}</span>
            <span>{product.status}</span>
          </div>
          <h1>{product.title}</h1>
          <p className="product-outcome">{product.summary}</p>
          <div className="price-line">
            <span>{product.price}</span>
            <small>USD · secure checkout</small>
          </div>
          <label className="select-label" htmlFor="license">License</label>
          <select id="license" name="license" defaultValue={product.licenseOptions[0]}>
            {product.licenseOptions.map((license) => (
              <option key={license}>{license}</option>
            ))}
          </select>
          <a
            className="button button-primary checkout-button"
            href={product.checkoutUrl}
            target="_blank"
            rel="noreferrer"
          >
            Buy with Lemon Squeezy ↗
          </a>
          <p className="purchase-note">
            Instant delivery by Lemon Squeezy. Product files are never stored
            in this public website repository.
          </p>
          <dl className="compatibility-list">
            <div><dt>Software</dt><dd>{product.software}</dd></div>
            <div><dt>Version</dt><dd>{product.softwareVersion}</dd></div>
            <div><dt>Difficulty</dt><dd>{product.difficulty}</dd></div>
            <div><dt>Last tested</dt><dd>{product.testedDate}</dd></div>
          </dl>
        </div>
      </section>

      <section className="product-detail shell section">
        <div className="detail-nav">
          <a href="#overview">Overview</a>
          <a href="#included">Included</a>
          <a href="#tutorial">Tutorial</a>
          <a href="#changelog">Changelog</a>
          <a href="#faq">FAQ</a>
        </div>
        <div className="detail-content">
          <section id="overview">
            <p className="eyebrow">01 / Outcome</p>
            <h2>A system you can read, adapt, and reuse.</h2>
            <p className="large-copy">{product.body}</p>
            <div className="outcome-grid">
              <div><span>INPUT</span><strong>Project geometry</strong></div>
              <div><span>LOGIC</span><strong>Exposed controls</strong></div>
              <div><span>OUTPUT</span><strong>Editable system</strong></div>
            </div>
          </section>
          <section id="included">
            <p className="eyebrow">02 / Package</p>
            <h2>Included files</h2>
            <ul className="ruled-list">
              {product.includedFiles.map((file, index) => (
                <li key={file}><span>0{index + 1}</span>{file}</li>
              ))}
            </ul>
            <h3>Requirements</h3>
            <ul className="check-list">
              {product.requirements.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </section>
          <section id="tutorial">
            <p className="eyebrow">03 / Tutorial</p>
            <h2>See the logic in motion.</h2>
            <a className="tutorial-panel" href={product.videoUrl} target="_blank" rel="noreferrer">
              <span className="play-button">▶</span>
              <div><strong>Open related video lesson</strong><span>YouTube ↗</span></div>
            </a>
            <div className="related-tutorials">
              {product.relatedTutorials.map((tutorial) => <span key={tutorial}>{tutorial}</span>)}
            </div>
          </section>
          <section id="changelog">
            <p className="eyebrow">04 / Version history</p>
            <h2>Changelog</h2>
            <ul className="ruled-list">
              {product.changelog.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <div className="policy-grid">
              <div><span>Updates</span><p>{product.updatePolicy}</p></div>
              <div><span>Support</span><p>{product.supportPolicy}</p></div>
            </div>
          </section>
          <section id="faq">
            <p className="eyebrow">05 / FAQ</p>
            <h2>Before you download</h2>
            <details><summary>Can I use this in commercial work?</summary><p>Yes, with an active Individual or Studio license. You may not redistribute the source files.</p></details>
            <details><summary>Will the file work on macOS?</summary><p>Yes. The definition is platform-independent, subject to the listed Rhino and plug-in requirements.</p></details>
            <details><summary>Are refunds available?</summary><p>Digital products are generally final sale after download. Review the placeholder refund policy before launch.</p></details>
          </section>
        </div>
      </section>

      <section className="shell section related-section">
        <p className="eyebrow">Related systems</p>
        <div className="product-grid product-grid-two">
          {related.map((item) => <ProductCard product={item} key={item.slug} />)}
        </div>
      </section>
    </main>
  );
}

