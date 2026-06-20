"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { type CategoryColor, CATEGORY_COLOR_STYLES } from "@/lib/category-colors";

type Variant = "category" | "status";

type ProductBadgeProps = {
  variant: Variant;
  value: string;
  color?: CategoryColor;
};

export function ProductBadge({ variant, value, color = "slate" }: ProductBadgeProps) {

  const base = "px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider border-none shadow-sm transition-all duration-300";

  if (variant === "status") {
    const isActive = value.toLowerCase() === "aktif" || value.toLowerCase() === "active" || value.toLowerCase() === "tersedia";

    const cls = isActive
      ? "bg-emerald-100 text-emerald-700 shadow-emerald-100/30"
      : "bg-slate-100 text-slate-400 shadow-slate-100";

    return (
      <Badge className={cn(base, cls)}>
        {isActive ? "Tersedia" : value}
      </Badge>
    );
  }

  const styles = CATEGORY_COLOR_STYLES[color];

  return (
    <Badge className={cn(base, styles.badge)}>
      <span className={cn("h-1.5 w-1.5 rounded-full mr-2 inline-block", styles.dot)} />
      {value}
    </Badge>
  );
}