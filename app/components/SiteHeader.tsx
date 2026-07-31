import Link from "next/link";
import { navItems, siteConfig } from "../lib/site";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="wordmark" href="/" aria-label="Parametric.Online home">
          PARAMETRIC<span>.</span>ONLINE
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
          <a
            className="youtube-link"
            href={siteConfig.youtubeUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Parametric.Online on YouTube (opens in a new tab)"
          >
            <span aria-hidden="true">▶</span>
          </a>
        </nav>
        <details className="mobile-menu">
          <summary aria-label="Open navigation">Menu</summary>
          <nav aria-label="Mobile navigation">
            {navItems.map((item) => (
              <Link href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
            <a href={siteConfig.youtubeUrl} target="_blank" rel="noreferrer">
              YouTube ↗
            </a>
          </nav>
        </details>
      </div>
    </header>
  );
}

