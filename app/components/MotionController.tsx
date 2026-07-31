"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const revealSelector = [
  "main > section:not(.hero):not(.page-hero):not(.lab-hero)",
  "main > div.section",
  ".section-heading",
  ".product-card",
  ".lesson-card",
  ".category-card",
  ".session-card",
  ".benefit-grid article",
  ".principle-grid article",
  ".detail-content > section",
  ".contact-options > a",
  ".process-strip > div",
].join(",");

export function MotionController() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let scrollFrame = 0;
    const updateScrollProgress = () => {
      scrollFrame = 0;
      const available = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1,
      );
      const progress = Math.min(Math.max(window.scrollY / available, 0), 1);
      root.style.setProperty("--scroll-progress", `${progress * 100}%`);
    };
    const onScroll = () => {
      if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScrollProgress);
    };

    updateScrollProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    if (reducedMotion) {
      return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
        if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
      };
    }

    body.classList.add("motion-ready");
    const revealItems = Array.from(
      document.querySelectorAll<HTMLElement>(revealSelector),
    );

    revealItems.forEach((item, index) => {
      item.classList.add("scroll-reveal");
      item.style.setProperty("--reveal-delay", `${(index % 3) * 70}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    revealItems.forEach((item) => observer.observe(item));

    return () => {
      observer.disconnect();
      revealItems.forEach((item) => {
        item.classList.remove("scroll-reveal", "is-visible");
        item.style.removeProperty("--reveal-delay");
      });
      body.classList.remove("motion-ready");
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
    };
  }, [pathname]);

  return null;
}

