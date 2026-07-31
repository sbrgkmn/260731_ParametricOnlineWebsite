import type { MetadataRoute } from "next";
import { products } from "./lib/products";
import { siteConfig } from "./lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/tools", "/learn", "/sessions", "/lab", "/about", "/contact", "/privacy", "/terms", "/refund-policy"];
  return [
    ...pages.map((path) => ({ url: `${siteConfig.origin}${path}`, lastModified: new Date("2026-07-31"), changeFrequency: path === "" ? "weekly" as const : "monthly" as const, priority: path === "" ? 1 : 0.7 })),
    ...products.map((product) => ({ url: `${siteConfig.origin}/tools/${product.slug}`, lastModified: new Date(product.testedDate), changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}

