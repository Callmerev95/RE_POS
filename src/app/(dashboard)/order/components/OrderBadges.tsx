"use client";

import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { LocalOrderSchema } from "@/lib/db"; 

// Ambil tipe enum dari Zod agar sinkron dengan database
type OrderType = z.infer<typeof LocalOrderSchema>["orderType"];
type PaymentMethod = z.infer<typeof LocalOrderSchema>["paymentMethod"];

type Props = {
  type: "method" | "type";
  value: OrderType | PaymentMethod | string; 
};

export function OrderBadge({ type, value }: Props) {

  const map: Record<string, string> = {

    CASH: "bg-emerald-600 text-white border-none",
    QRIS: "bg-purple-600 text-white border-none",
    BCA: "bg-indigo-600 text-white border-none",
    DANA: "bg-sky-500 text-white border-none",


    DINE_IN: "bg-green-50 text-green-700 border-green-200",
    TAKE_AWAY: "bg-amber-50 text-amber-700 border-amber-200",
  };

  // Normalisasi value agar cocok dengan key mapping (misal: "Dine In" -> "DINE_IN")
  const normalizedKey = value.toUpperCase().replace(/\s+/g, "_");

  const formatDisplay = (val: string) => {
    if (type === "method") return val.toUpperCase();
    return val
      .replace("_", " ")
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const isMethod = type === "method";

  return (
    <Badge
      variant="secondary"
      className={`
        gap-2 font-black text-[10px] uppercase tracking-wide px-3 py-1 shadow-sm transition-all
        ${map[normalizedKey] ?? "bg-slate-100 text-slate-700"}
        ${isMethod ? "rounded-lg" : "rounded-full"} 
      `}
    >
      {/* DOT hanya muncul untuk Tipe Pesanan (Soft Model) */}
      {!isMethod && (
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60 animate-pulse" />
      )}

      <span className={isMethod ? "tracking-widest" : ""}>
        {formatDisplay(value)}
      </span>
    </Badge>
  );
}