import Link from "next/link";
import { navItems } from "../lib/site";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="wordmark" href="/" aria-label="Parametric home">
          PARAMETRIC
        </Link>
        <div className="header-actions">
          <nav className="desktop-nav" aria-label="Primary navigation">
            {navItems.map((item, index) =>
              item.external ? (
                <a
                  href={item.href}
                  key={item.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="nav-index">0{index + 1}</span>
                  {item.label}
                </a>
              ) : (
                <Link href={item.href} key={item.href}>
                  <span className="nav-index">0{index + 1}</span>
                  {item.label}
                </Link>
              ),
            )}
          </nav>
          <ThemeToggle />
          <details className="mobile-menu">
            <summary>Menu</summary>
            <nav aria-label="Mobile navigation">
              {navItems.map((item, index) =>
                item.external ? (
                  <a
                    href={item.href}
                    key={item.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="nav-index">0{index + 1}</span>
                    {item.label}
                  </a>
                ) : (
                  <Link href={item.href} key={item.href}>
                    <span className="nav-index">0{index + 1}</span>
                    {item.label}
                  </Link>
                ),
              )}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
