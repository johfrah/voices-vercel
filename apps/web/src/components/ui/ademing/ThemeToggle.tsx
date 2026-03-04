"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark";
const THEME_STORAGE_KEY = "theme";

function getSystemTheme(): ThemeMode {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(mode: ThemeMode) {
  const root = window.document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(mode);
  root.style.colorScheme = mode;
}

export const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const classTheme: ThemeMode | null = root.classList.contains("dark")
      ? "dark"
      : root.classList.contains("light")
        ? "light"
        : null;
    const initialTheme: ThemeMode =
      storedTheme === "dark" || storedTheme === "light"
        ? storedTheme
        : classTheme ?? getSystemTheme();

    applyTheme(initialTheme);
    setIsDark(initialTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const nextTheme: ThemeMode = isDark ? "light" : "dark";
    applyTheme(nextTheme);
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    document.cookie = `theme=${nextTheme}; path=/; max-age=31536000; samesite=lax`;
    setIsDark(nextTheme === "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-3 hover:bg-black/5 rounded-full transition-all active:scale-90 text-foreground/60 hover:text-primary"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={24} strokeWidth={1.5} /> : <Moon size={24} strokeWidth={1.5} />}
    </button>
  );
};
