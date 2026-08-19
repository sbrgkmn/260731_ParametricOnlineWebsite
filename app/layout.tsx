import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { MotionController } from "./components/MotionController";
import { siteConfig } from "./lib/site";
import "./globals.css";
import "./friendly.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const forwardedProtocol = requestHeaders.get("x-forwarded-proto");
  const protocol =
    forwardedProtocol ?? (host?.startsWith("localhost") ? "http" : "https");
  const requestOrigin = host ? `${protocol}://${host}` : siteConfig.origin;
  const socialImage = new URL("/og-friendly.png", requestOrigin).toString();

  return {
    metadataBase: new URL(requestOrigin),
    title: {
      default: "Parametric Online — Learn computational design by building",
      template: "%s — Parametric Online",
    },
    description:
      "Free tutorials, downloadable scripts, community, and expert support for architects and designers working with computational design.",
    openGraph: {
      title: "Parametric Online",
      description: "Learn computational design by building.",
      type: "website",
      url: requestOrigin,
      siteName: "Parametric Online",
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: "Parametric Online — Learn computational design by building.",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Parametric Online",
      description: "Learn computational design by building.",
      images: [socialImage],
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfbf8" },
    { media: "(prefers-color-scheme: dark)", color: "#10120f" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{var theme=localStorage.getItem("parametric-theme");if(theme==="dark"||theme==="light"){document.documentElement.dataset.theme=theme}}catch(error){}',
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <MotionController />
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <SiteHeader />
        <div id="main-content">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
