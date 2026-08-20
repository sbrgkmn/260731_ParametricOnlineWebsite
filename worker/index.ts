/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  PRODUCT_FILES: R2Bucket;
  PRODUCT_UPLOAD_TOKEN?: string;
  STRIPE_SECRET_KEY?: string;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

const starterKitObjectKey = "grasshopper-starter-kit-test.zip";

async function createGrasshopperCheckout(request: Request, env: Env) {
  if (!env.STRIPE_SECRET_KEY) {
    return new Response("Stripe Checkout is not configured.", { status: 503 });
  }

  const requestUrl = new URL(request.url);
  const form = new URLSearchParams({
    mode: "payment",
    success_url: `${requestUrl.origin}/api/download/grasshopper-starter-kit?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${requestUrl.origin}/scripts#grasshopper-starter-kit`,
    customer_creation: "always",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": "0",
    "line_items[0][price_data][product_data][name]":
      "Grasshopper Starter Kit — Download Test",
    "line_items[0][price_data][product_data][description]":
      "Private file-delivery test for the Grasshopper Starter Kit sample.",
    "line_items[0][quantity]": "1",
    "metadata[product_id]": "grasshopper-starter-kit-test",
  });

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Stripe-Version": "2023-08-16",
    },
    body: form,
  });
  const checkout = (await response.json()) as {
    error?: { message?: string };
    url?: string;
  };

  if (!response.ok || !checkout.url) {
    console.error("Stripe Checkout error", checkout.error?.message ?? response.status);
    return new Response("Unable to start the test checkout.", { status: 502 });
  }

  return Response.redirect(checkout.url, 303);
}

async function downloadGrasshopperStarterKit(request: Request, env: Env) {
  if (!env.STRIPE_SECRET_KEY) {
    return new Response("Stripe Checkout is not configured.", { status: 503 });
  }

  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId || !/^cs_test_[A-Za-z0-9_]+$/.test(sessionId)) {
    return new Response("A valid test checkout is required.", { status: 400 });
  }

  const stripeResponse = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
    { headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` } },
  );
  const session = (await stripeResponse.json()) as {
    amount_total?: number;
    metadata?: Record<string, string>;
    status?: string;
  };

  const verified =
    stripeResponse.ok &&
    session.status === "complete" &&
    session.amount_total === 0 &&
    session.metadata?.product_id === "grasshopper-starter-kit-test";

  if (!verified) {
    return new Response("Checkout confirmation could not be verified.", {
      status: 403,
    });
  }

  const file = await env.PRODUCT_FILES.get(starterKitObjectKey);
  if (!file) {
    return new Response("The test download is not available.", { status: 404 });
  }

  return new Response(file.body, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": 'attachment; filename="Grasshopper Starter Kit.zip"',
      "Content-Length": String(file.size),
      "Content-Type": "application/zip",
    },
  });
}

async function uploadGrasshopperStarterKit(request: Request, env: Env) {
  const authorization = request.headers.get("Authorization");
  if (
    !env.PRODUCT_UPLOAD_TOKEN ||
    authorization !== `Bearer ${env.PRODUCT_UPLOAD_TOKEN}`
  ) {
    return new Response("Not found", { status: 404 });
  }

  const contentLength = Number(request.headers.get("Content-Length") ?? 0);
  if (!request.body || contentLength > 10 * 1024 * 1024) {
    return new Response("Invalid product file.", { status: 400 });
  }

  await env.PRODUCT_FILES.put(starterKitObjectKey, request.body, {
    httpMetadata: { contentType: "application/zip" },
  });
  return new Response(null, { status: 204 });
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (
      request.method === "GET" &&
      url.pathname === "/api/checkout/grasshopper-starter-kit"
    ) {
      return createGrasshopperCheckout(request, env);
    }

    if (
      request.method === "GET" &&
      url.pathname === "/api/download/grasshopper-starter-kit"
    ) {
      return downloadGrasshopperStarterKit(request, env);
    }

    if (
      request.method === "PUT" &&
      url.pathname === "/api/admin/product-files/grasshopper-starter-kit"
    ) {
      return uploadGrasshopperStarterKit(request, env);
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;
