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
  assert.match(html, /Learn on YouTube/);
  assert.match(html, /Starter Kits/);
  assert.match(html, /Work Together/);
  assert.match(html, /https:\/\/discord\.gg\/XdKRyBajp/);
  assert.match(html, /Four ways in/);
  assert.doesNotMatch(html, /15K\+ YouTube subscribers/);
  assert.doesNotMatch(html, /Choose a system|Configure \+|Auto on/);
  assert.match(html, /data-theme="dark"/);
  assert.match(html, /Switch to light theme/);
  assert.match(html, /aria-label="Parametric home"/);
  assert.match(html, /generative-stage/);
  assert.doesNotMatch(html, /generative-control-dock/);
  assert.doesNotMatch(html, /Workflow streams|Featured tutorials/);
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

test("community links to Discord while booking destinations stay disabled", async () => {
  const [communityResponse, expertResponse] = await Promise.all([
    render("/community"),
    render("/expert-help"),
  ]);
  const [communityHtml, expertHtml] = await Promise.all([
    communityResponse.text(),
    expertResponse.text(),
  ]);
  assert.match(communityHtml, /Join the discussion on Discord/);
  assert.match(communityHtml, /https:\/\/discord\.gg\/XdKRyBajp/);
  assert.match(expertHtml, /Booking link unavailable/);
  assert.match(expertHtml, /Inquiry submission is currently unavailable/);
  assert.doesNotMatch(expertHtml, /calendly\.com/);
  assert.match(expertHtml, /Bring a Grasshopper definition/);
  assert.doesNotMatch(expertHtml, /Share context before the call/);
  assert.doesNotMatch(expertHtml, /Work directly on the difficult part/);
  assert.doesNotMatch(expertHtml, /Leave with a clear next step/);
});

test("responsive and reduced-motion fallbacks remain defined", async () => {
  const [css, generativeSource] = await Promise.all([
    readFile(new URL("../app/friendly.css", import.meta.url), "utf8"),
    readFile(
      new URL("../app/components/GenerativeBackground.tsx", import.meta.url),
      "utf8",
    ),
  ]);
  assert.match(css, /@media \(max-width: 720px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /--paper: #fbfbf8/);
  assert.match(css, /--field-accent: #e11d48/);
  assert.match(css, /--field-warm: #ff4d6d/);
  assert.match(css, /--accent: #22d3ee/);
  assert.match(css, /--field-warm: #06b6d4/);
  assert.match(
    css,
    /:root\[data-theme="dark"\]\s*\{[^}]*--ink: #ffffff;[^}]*--muted: #ffffff;[^}]*--copy: #ffffff;/,
  );
  assert.match(css, /:root\[data-theme="dark"\]/);
  assert.match(
    css,
    /\.generative-background\s*\{[^}]*inset: 0;[^}]*width: 100%;/,
  );
  assert.match(css, /\.generative-stage\s*\{[^}]*border-block: 1px solid var\(--ink\);/);
  assert.match(css, /\.generative-canvas\s*\{\s*display: none;/);
  assert.match(css, /\.generative-fallback\s*\{\s*z-index: 0;/);
  assert.doesNotMatch(generativeSource, /venation/i);
});
