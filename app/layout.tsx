import type { CSSProperties } from "react";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { MotionController } from "./components/MotionController";
import { siteConfig } from "./lib/site";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const forwardedProtocol = requestHeaders.get("x-forwarded-proto");
  const protocol = forwardedProtocol ?? (host?.startsWith("localhost") ? "http" : "https");
  const requestOrigin = host ? `${protocol}://${host}` : siteConfig.origin;
  const socialImage = new URL("/og-dark.png", requestOrigin).toString();

  return {
    metadataBase: new URL(requestOrigin),
    title: { default: "Parametric.Online — Practical systems for computational design", template: "%s — Parametric.Online" },
    description: "Grasshopper scripts, ComfyUI workflows, and focused guidance for architects, designers, and educators.",
    openGraph: {
      title: "Parametric.Online",
      description: "Practical systems for computational design.",
      type: "website",
      url: requestOrigin,
      siteName: "Parametric.Online",
      images: [{ url: socialImage, width: 1732, height: 909, alt: "Parametric.Online — Practical systems for computational design." }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Parametric.Online",
      description: "Practical systems for computational design.",
      images: [socialImage],
    },
  };
}

export const viewport: Viewport = { themeColor: "#050505", colorScheme: "dark" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const style = { "--accent": siteConfig.accent } as CSSProperties;
  return (
    <html lang="en" style={style}>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <MotionController />
        <a className="skip-link" href="#main-content">Skip to content</a>
        <SiteHeader />
        <div id="main-content">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
