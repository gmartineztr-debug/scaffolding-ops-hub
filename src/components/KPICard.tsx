import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: "default" | "warning" | "danger" | "success";
}

const variantStyles = {
  default: "border-l-primary",
  warning: "border-l-warning",
  danger: "border-l-destructive",
  success: "border-l-success",
};

export function KPICard({ title, value, icon: Icon, variant = "default" }: KPICardProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-lg border border-l-4 p-5 animate-fade-in",
        variantStyles[variant]
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold font-mono mt-1">{value}</p>
        </div>
        <Icon className="h-8 w-8 text-muted-foreground/40" />
      </div>
    </div>
  );
}
