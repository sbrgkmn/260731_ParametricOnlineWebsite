import Link from "next/link";
import { navItems, siteConfig } from "../lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <Link className="wordmark footer-mark" href="/">
            PARAMETRIC <span>/</span> ONLINE
          </Link>
          <p>Learn computational design by building.</p>
        </div>
        <div className="footer-links">
          <p className="eyebrow">Explore</p>
          {navItems.map((item) =>
            item.external ? (
              <a
                href={item.href}
                key={item.href}
                target="_blank"
                rel="noreferrer"
              >
                {item.label} ↗
              </a>
            ) : (
              <Link href={item.href} key={item.href}>
                {item.label}
              </Link>
            ),
          )}
        </div>
        <div className="footer-links">
          <p className="eyebrow">Elsewhere</p>
          <a href={siteConfig.youtubeUrl} target="_blank" rel="noreferrer">
            YouTube ↗
          </a>
          <a href={siteConfig.portfolioUrl} target="_blank" rel="noreferrer">
            Sabri Gokmen ↗
          </a>
        </div>
      </div>
      <div className="shell footer-base">
        <span>© {new Date().getFullYear()} Parametric Online</span>
        <div>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/refund-policy">Refunds</Link>
        </div>
      </div>
    </footer>
  );
}
