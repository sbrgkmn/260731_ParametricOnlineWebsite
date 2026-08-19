"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const applyTheme = (theme: Theme) => {
  document.documentElement.dataset.theme = theme;
  try {
    window.localStorage.setItem("parametric-theme", theme);
  } catch {
    // The visible theme still works when storage is unavailable.
  }
  window.dispatchEvent(new Event("parametric-theme-change"));
};

const subscribe = (onStoreChange: () => void) => {
  window.addEventListener("parametric-theme-change", onStoreChange);
  return () =>
    window.removeEventListener("parametric-theme-change", onStoreChange);
};

const getTheme = (): Theme =>
  document.documentElement.dataset.theme === "dark" ? "dark" : "light";

const getServerTheme = (): Theme => "dark";

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getTheme, getServerTheme);

  const nextTheme: Theme = theme === "light" ? "dark" : "light";

  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={() => {
        applyTheme(nextTheme);
      }}
      aria-label={`Switch to ${nextTheme} theme`}
      title={`Switch to ${nextTheme} theme`}
    >
      <span aria-hidden="true">{theme}</span>
      <span aria-hidden="true">/</span>
      <span aria-hidden="true">{nextTheme}</span>
    </button>
  );
}
