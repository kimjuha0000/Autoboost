import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative w-14 h-7 rounded-full transition-all duration-300",
        "bg-secondary border border-border",
        "hover:shadow-md"
      )}
    >
      <div
        className={cn(
          "absolute top-0.5 w-6 h-6 rounded-full transition-all duration-300",
          "flex items-center justify-center",
          theme === "dark"
            ? "left-7 bg-primary"
            : "left-0.5 bg-warning"
        )}
      >
        {theme === "dark" ? (
          <Moon className="w-3.5 h-3.5 text-primary-foreground" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-warning-foreground" />
        )}
      </div>
    </button>
  );
}
