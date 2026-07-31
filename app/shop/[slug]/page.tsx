import { permanentRedirect } from "next/navigation";
import { resolveLegacyProductSlug } from "../../lib/legacyRedirects";

export default async function LegacyShopPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  permanentRedirect(`/tools/${resolveLegacyProductSlug(slug)}`);
}
