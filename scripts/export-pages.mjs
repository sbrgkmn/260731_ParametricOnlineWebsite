import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const outputDirectory = join(projectRoot, "dist-pages");
const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("export", `${Date.now()}`);
const { default: worker } = await import(workerUrl.href);

const environment = {
  ASSETS: {
    fetch: async () => new Response("Not found", { status: 404 }),
  },
};
const executionContext = {
  waitUntil() {},
  passThroughOnException() {},
};

async function render(pathname) {
  return worker.fetch(
    new Request(new URL(pathname, "https://parametric.online")),
    environment,
    executionContext,
  );
}

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });
await cp(join(projectRoot, "dist", "client"), outputDirectory, {
  recursive: true,
});

const sitemapResponse = await render("/sitemap.xml");
if (!sitemapResponse.ok) {
  throw new Error(`Unable to render sitemap: ${sitemapResponse.status}`);
}
const sitemap = await sitemapResponse.text();
const paths = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(
  ([, location]) => new URL(location).pathname,
);

for (const pathname of paths) {
  const response = await render(pathname);
  if (!response.ok) {
    throw new Error(`Unable to render ${pathname}: ${response.status}`);
  }
  const destination =
    pathname === "/"
      ? join(outputDirectory, "index.html")
      : join(outputDirectory, pathname.slice(1), "index.html");
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, await response.text());
}

const robotsResponse = await render("/robots.txt");
await writeFile(join(outputDirectory, "robots.txt"), await robotsResponse.text());
await writeFile(join(outputDirectory, "sitemap.xml"), sitemap);
await writeFile(join(outputDirectory, "CNAME"), "parametric.online\n");
await writeFile(join(outputDirectory, ".nojekyll"), "");

const notFoundResponse = await render("/__github_pages_not_found__");
await writeFile(join(outputDirectory, "404.html"), await notFoundResponse.text());

console.log(`Exported ${paths.length} routes to ${outputDirectory}`);
