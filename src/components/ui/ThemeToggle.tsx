"use client";

import { useTheme } from "@/context/ThemeContext";
import { Button } from "./Button";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
console.log("current theme:", theme);

  return (
    <Button
      aria-label="Toggle light/dark theme"
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
    >
      <span aria-hidden="true" className="text-lg">
        {theme === "light" ? "🌙" : "☀️"}
      </span>
    </Button>
  );
};
