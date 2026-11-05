"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-full border border-line bg-surface/50 animate-pulse" />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex items-center justify-center w-8 h-8 rounded-full border border-line bg-surface text-ink hover:border-muted transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
      aria-label="Toggle visual theme"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-accent transition-transform duration-200 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-ink transition-transform duration-200 hover:-rotate-12" />
      )}
    </button>
  );
}

