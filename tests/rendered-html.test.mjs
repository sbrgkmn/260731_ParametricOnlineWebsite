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
  assert.match(html, /Marketplace/);
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

test("server-renders the segmented marketplace", async () => {
  const response = await render("/scripts");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Marketplace categories/);
  assert.match(html, /Grasshopper/);
  assert.match(html, /Scripting/);
  assert.match(html, /Generative AI \/ ComfyUI/);
  assert.match(html, /ComfyUI Free Sample/);
  assert.match(html, /ComfyUI Starter Kit/);
  assert.match(html, /ComfyUI Design Workflow/);
  assert.match(html, /Grasshopper Free Sample/);
  assert.match(html, /Grasshopper Starter Kit/);
  assert.match(html, /Grasshopper Design Library/);
  assert.match(html, /Scripting Library/);
  assert.match(html, /Scripting Starter Kit/);
  assert.match(html, /\$9/);
  assert.match(html, /\$19/);
  assert.match(html, /\$15/);
  assert.match(html, /\$29/);
  assert.match(html, /Coming soon/);
  assert.match(html, /Enter your email once/);
  assert.match(html, /drive\.google\.com/);
  assert.doesNotMatch(html, /marketplace\/marketplace-hero\.webp/);
  assert.match(html, /marketplace\/comfyui-free-sample\.png/);
  assert.match(html, /marketplace\/grasshopper-free-sample\.png/);
  assert.match(html, /marketplace\/scripting-library\.png/);
  assert.match(html, /marketplace\/scripting-starter-kit\.png/);
  assert.match(html, /marketplace\/comfyui-design-workflow\.png/);
  assert.match(html, /marketplace\/grasshopper-design-library\.png/);
  assert.match(html, /marketplace\/grasshopper-starter-kit\.png/);
  assert.match(html, /marketplace\/comfyui-starter-kit\.png/);
  assert.doesNotMatch(html, /Introduction to ComfyUI Workflow/);
  assert.doesNotMatch(html, /AI Mesh Generation Workflow/);
  assert.doesNotMatch(html, /Creative Scripting Starter Files/);
  assert.doesNotMatch(html, /Grasshopper Python Script Pack/);
  assert.match(html, /api\/checkout\/grasshopper-starter-kit/);
  assert.match(html, /Buy now/);
  assert.doesNotMatch(html, /Lemon Squeezy/);
});

test("server-renders a tutorial detail page with privacy-enhanced video", async () => {
  const response = await render("/tutorials/comfyui-controlnets");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /ComfyUI Controlnets/);
  assert.match(html, /youtube-nocookie\.com/);
  assert.match(html, /Watch Free/);
});

test("community and expert-help destinations reflect their configuration", async () => {
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
  if (expertHtml.includes("Book a Working Session")) {
    assert.match(expertHtml, /Book a Working Session/);
    assert.match(
      expertHtml,
      /https:\/\/calendar\.app\.google\/9GrNWLWSBdhA7QSC7/,
    );
    assert.doesNotMatch(expertHtml, /Booking link unavailable/);
  } else {
    assert.match(expertHtml, /Booking link unavailable/);
  }
  assert.match(expertHtml, /Inquiry submission is currently unavailable/);
  assert.match(expertHtml, /Bring a Grasshopper definition/);
  assert.match(expertHtml, /\$49/);
  assert.match(expertHtml, /60 minutes/);
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
