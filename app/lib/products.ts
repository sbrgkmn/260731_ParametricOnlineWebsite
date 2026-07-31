import alBahrRaw from "../../content/products/al-bahr-facade.md?raw";
import brickWallRaw from "../../content/products/brick-wall.md?raw";
import comfyStudyRaw from "../../content/products/comfyui-architectural-study-kit.md?raw";
import foldingFacadeRaw from "../../content/products/folding-facade-panels.md?raw";

export type ProductCategory = "Grasshopper" | "ComfyUI" | "Free Resources";

export type Product = {
  title: string;
  slug: string;
  summary: string;
  category: ProductCategory;
  price: string;
  checkoutUrl: string;
  featuredImage: string;
  gallery: string[];
  videoUrl: string;
  difficulty: string;
  software: string;
  softwareVersion: string;
  requirements: string[];
  testedDate: string;
  includedFiles: string[];
  licenseOptions: string[];
  updatePolicy: string;
  supportPolicy: string;
  changelog: string[];
  relatedTutorials: string[];
  featured: boolean;
  status: string;
  body: string;
};

function parseValue(value: string): unknown {
  const clean = value.trim();
  if (clean === "true") return true;
  if (clean === "false") return false;
  if (clean.startsWith("[") || clean.startsWith("{")) {
    return JSON.parse(clean);
  }
  return clean.replace(/^['\"]|['\"]$/g, "");
}

function parseProduct(raw: string): Product {
  const [, frontmatter = "", body = ""] = raw.split("---");
  const data = Object.fromEntries(
    frontmatter
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const separator = line.indexOf(":");
        const key = line.slice(0, separator).trim();
        const value = line.slice(separator + 1);
        return [key, parseValue(value)];
      }),
  );

  return { ...data, body: body.trim() } as Product;
}

export const products = [foldingFacadeRaw, brickWallRaw, comfyStudyRaw, alBahrRaw].map(
  parseProduct,
);

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getRelatedProducts(product: Product) {
  return products
    .filter((candidate) => candidate.slug !== product.slug)
    .slice(0, 2);
}
