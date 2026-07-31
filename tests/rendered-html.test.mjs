import assert from "node:assert/strict";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the finished home page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Practical systems for computational design/);
  assert.match(html, /Browse tools/);
  assert.match(html, /Parametric Lab/);
  assert.match(html, /Background simulation/);
  assert.match(html, /Cellular automata/);
  assert.match(html, /Reaction/);
  assert.match(html, /Proximity network/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/);
});

test("server-renders the product catalog", async () => {
  const response = await render("/tools");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Folding Facade Panels/);
  assert.match(html, /Parametric Brick Wall/);
  assert.match(html, /Al Bahr Facade System/);
});
