import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the finished home page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Learn computational design by building/);
  assert.match(html, /Explore Workflows/);
  assert.match(html, /15K\+ YouTube subscribers/);
  assert.match(html, /Parametric Design/);
  assert.match(html, /Creative Scripting/);
  assert.match(html, /Generative AI/);
  assert.match(html, /Digital Fabrication/);
  assert.match(html, /Background system/);
  assert.match(html, /Cellular automata/);
  assert.match(html, /Reaction-diffusion/);
  assert.match(html, /Radiolaria Voronoi mesh/);
  assert.match(html, /Fractal basin/);
  assert.match(html, /Auto on/);
  assert.match(html, /Switch to dark theme/);
  assert.match(html, /generative-stage/);
  assert.doesNotMatch(html, /Background simulation/);
  assert.doesNotMatch(
    html,
    /codex-preview|SkeletonPreview|react-loading-skeleton/,
  );
});

test("server-renders four curated learning streams", async () => {
  const response = await render("/learn");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Brick Wall From Parametric Surface/);
  assert.match(html, /Scripting 2D Cellular Automata Using AI/);
  assert.match(html, /Introduction to ComfyUI/);
  assert.match(html, /Unrolling Parts/);
});

test("server-renders only verified downloads", async () => {
  const response = await render("/scripts");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Introduction to ComfyUI Workflow/);
  assert.match(html, /AI Mesh Generation Workflow/);
  assert.match(html, /drive\.google\.com/);
  assert.doesNotMatch(html, /Lemon Squeezy|Buy now/);
});

test("server-renders a tutorial detail page with privacy-enhanced video", async () => {
  const response = await render("/tutorials/comfyui-controlnets");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /ComfyUI Controlnets/);
  assert.match(html, /youtube-nocookie\.com/);
  assert.match(html, /Watch Free/);
});

test("unverified community and booking destinations stay disabled", async () => {
  const [communityResponse, expertResponse] = await Promise.all([
    render("/community"),
    render("/expert-help"),
  ]);
  const [communityHtml, expertHtml] = await Promise.all([
    communityResponse.text(),
    expertResponse.text(),
  ]);
  assert.match(communityHtml, /Discord invite unavailable/);
  assert.doesNotMatch(communityHtml, /discord\.gg/);
  assert.match(expertHtml, /Booking link unavailable/);
  assert.match(expertHtml, /Inquiry submission is currently unavailable/);
  assert.doesNotMatch(expertHtml, /calendly\.com/);
});

test("responsive and reduced-motion fallbacks remain defined", async () => {
  const css = await readFile(
    new URL("../app/friendly.css", import.meta.url),
    "utf8",
  );
  assert.match(css, /@media \(max-width: 720px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /--paper: #fbfbf8/);
  assert.match(css, /--field-accent: #ff5c35/);
  assert.match(css, /--field-warm: #f2ad2e/);
  assert.match(css, /:root\[data-theme="dark"\]/);
  assert.match(
    css,
    /\.generative-background\s*\{[^}]*inset: 0;[^}]*width: 100%;/,
  );
  assert.match(css, /\.generative-canvas\s*\{\s*display: none;/);
  assert.match(css, /\.generative-fallback\s*\{\s*z-index: 0;/);
});
