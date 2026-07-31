const legacyProductSlugs: Record<string, string> = {
  "folding-facade-panels": "folding-facade-panels",
  "brick-wall": "brick-wall",
  "al-bahr-towers-facade": "al-bahr-facade",
};

export function resolveLegacyProductSlug(slug: string) {
  return legacyProductSlugs[slug] ?? slug;
}

