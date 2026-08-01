import type { MetadataRoute } from "next";
import { tutorials, workflowStreams } from "./lib/content";
import { siteConfig } from "./lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    "",
    "/learn",
    "/scripts",
    "/community",
    "/expert-help",
    "/about",
    "/privacy",
    "/terms",
    "/refund-policy",
  ];
  const lastModified = new Date("2026-08-01");

  return [
    ...pages.map((path) => ({
      url: `${siteConfig.origin}${path}`,
      lastModified,
      changeFrequency: path === "" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "" ? 1 : 0.7,
    })),
    ...workflowStreams.map((stream) => ({
      url: `${siteConfig.origin}/workflows/${stream.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...tutorials.map((tutorial) => ({
      url: `${siteConfig.origin}/tutorials/${tutorial.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
  ];
}
