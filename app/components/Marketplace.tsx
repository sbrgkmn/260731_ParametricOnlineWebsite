"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { MarketplaceProduct } from "../lib/content";

const categories = [
  "All",
  "Grasshopper",
  "Scripting",
  "Generative AI / ComfyUI",
] as const;

type Category = (typeof categories)[number];

export function Marketplace({ products }: { products: MarketplaceProduct[] }) {
  const [category, setCategory] = useState<Category>("All");
  const [email, setEmail] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const visibleProducts = useMemo(
    () =>
      category === "All"
        ? products
        : products.filter((product) => product.category === category),
    [category, products],
  );

  function unlockDownloads(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (event.currentTarget.reportValidity()) {
      setUnlocked(true);
    }
  }

  return (
    <>
      <div className="marketplace-segments" aria-label="Marketplace categories">
        {categories.map((item) => (
          <button
            aria-pressed={category === item}
            key={item}
            onClick={() => setCategory(item)}
            type="button"
          >
            {item}
          </button>
        ))}
      </div>

      <section className="free-access" id="free-access">
        <div>
          <p className="eyebrow">Free access</p>
          <h2>Enter your email once. Download any free file.</h2>
          <p>
            Email delivery is in preview mode. Your address unlocks downloads
            in this browser but is not stored until an email provider is
            connected.
          </p>
        </div>
        {unlocked ? (
          <div className="access-confirmation" role="status">
            <strong>Free downloads unlocked.</strong>
            <span>{email}</span>
          </div>
        ) : (
          <form className="access-form" onSubmit={unlockDownloads}>
            <label htmlFor="marketplace-email">Email address</label>
            <div>
              <input
                autoComplete="email"
                id="marketplace-email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                type="email"
                value={email}
              />
              <button className="button button-primary" type="submit">
                Unlock free downloads
              </button>
            </div>
          </form>
        )}
      </section>

      <div className="marketplace-grid">
        {visibleProducts.map((product, index) => {
          const downloadable =
            product.status === "available" && Boolean(product.downloadUrl);

          return (
            <article className="marketplace-card" id={product.id} key={product.id}>
              <div className="marketplace-card-visual">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={product.imageAlt}
                  height="900"
                  loading="lazy"
                  src={product.imageUrl}
                  width="1200"
                />
                <span aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <strong aria-hidden="true">{product.access}</strong>
              </div>
              <div className="marketplace-card-copy">
                <div className="meta-row">
                  <span>{product.category}</span>
                  <span>
                    {downloadable
                      ? product.access === "Free"
                        ? "Free download"
                        : "Available"
                      : "Coming soon"}
                  </span>
                </div>
                <h2>{product.title}</h2>
                <p>{product.summary}</p>
                <div className="marketplace-card-action">
                  <strong>{product.access}</strong>
                  {downloadable && unlocked ? (
                    <a
                      className="text-link"
                      href={product.downloadUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Download now ↗
                    </a>
                  ) : downloadable ? (
                    <a className="text-link" href="#free-access">
                      Enter email to download ↑
                    </a>
                  ) : (
                    <span>Coming soon</span>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
