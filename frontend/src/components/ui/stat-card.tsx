import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "primary" | "success" | "accent" | "warning";
  className?: string;
}

const variantStyles = {
  default: {
    iconBg: "bg-secondary",
    iconColor: "text-foreground",
    glowClass: "",
  },
  primary: {
    iconBg: "bg-primary/20",
    iconColor: "text-primary",
    glowClass: "hover:glow-primary",
  },
  success: {
    iconBg: "bg-success/20",
    iconColor: "text-success",
    glowClass: "",
  },
  accent: {
    iconBg: "bg-accent/20",
    iconColor: "text-accent",
    glowClass: "hover:glow-accent",
  },
  warning: {
    iconBg: "bg-warning/20",
    iconColor: "text-warning",
    glowClass: "",
  },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  className,
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "glass rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] animate-scale-in",
        styles.glowClass,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold tracking-tight animate-count">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  "text-xs font-medium",
                  trend.isPositive ? "text-success" : "text-destructive"
                )}
              >
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-muted-foreground">vs 어제</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            "p-3 rounded-xl",
            styles.iconBg
          )}
        >
          <Icon className={cn("w-6 h-6", styles.iconColor)} />
        </div>
      </div>
    </div>
  );
}
