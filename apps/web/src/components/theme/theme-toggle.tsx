"use client";

import { Monitor, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAppTheme } from "@/components/theme/theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useAppTheme();
  const nextTheme = theme === "dark" ? "light" : theme === "light" ? "system" : "dark";
  const label = theme === "dark" ? "Switch to light theme" : theme === "light" ? "Use system theme" : "Switch to dark theme";

  return (
    <Button type="button" variant="ghost" size="icon" aria-label={label} title={label} onClick={() => setTheme(nextTheme)}>
      {theme === "dark" ? <Moon aria-hidden={true} size={18} /> : theme === "light" ? <Sun aria-hidden={true} size={18} /> : <Monitor aria-hidden={true} size={18} />}
    </Button>
  );
}
