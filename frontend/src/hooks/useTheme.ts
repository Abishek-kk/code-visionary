import { useEffect, useState } from "react";

type Theme = "dark" | "light";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(
        "algovision-theme"
      ) as Theme | null;
      if (stored) {
        setTheme(stored);
        document.documentElement.setAttribute(
          "data-theme", stored
        );
      }
    }
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("algovision-theme", next);
      document.documentElement.setAttribute(
        "data-theme", next
      );
    }
  }

  return { theme, toggleTheme };
}
