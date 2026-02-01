"use client";

import { z } from "zod";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon, Layers, WalletCards } from "lucide-react";

import { cn } from "@/lib/utils";
import { LocalOrderSchema } from "@/lib/db";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type OrderType = z.infer<typeof LocalOrderSchema>["orderType"];
type PaymentMethod = z.infer<typeof LocalOrderSchema>["paymentMethod"];

interface OrderHeaderProps {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  type: OrderType | "all";
  setType: (type: OrderType | "all") => void;
  method: PaymentMethod | "all";
  setMethod: (method: PaymentMethod | "all") => void;
}

export function OrderHeader({
  dateRange, setDateRange,
  type, setType,
  method, setMethod
}: OrderHeaderProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 w-full justify-start p-1">
      {/* 1. Date Filter */}
      <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 h-12 rounded-2xl border border-slate-100 shadow-sm hover:border-cyan-200 transition-all group">
        <CalendarIcon size={16} className="text-cyan-600 group-hover:scale-110 transition-transform" />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">Periode</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "h-auto p-0 font-bold text-[13px] hover:bg-transparent transition-none text-slate-700",
                !dateRange && "text-slate-400"
              )}
            >
              {dateRange?.from ? (
                dateRange.to ? (
                  <>{format(dateRange.from, "dd LLL")} - {format(dateRange.to, "dd LLL yyyy")}</>
                ) : (
                  format(dateRange.from, "dd LLL yyyy")
                )
              ) : (
                <span>Pilih Tanggal</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden border border-slate-100 shadow-2xl bg-white z-100" align="start" sideOffset={10}>
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
              className="p-4"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* 2. Type Filter */}
      <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 h-12 rounded-2xl border border-slate-100 shadow-sm hover:border-cyan-200 transition-all group">
        <Layers size={16} className="text-cyan-600 group-hover:scale-110 transition-transform" />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">Tipe</span>
        <Select value={type} onValueChange={(val) => setType(val as OrderType | "all")}>
          <SelectTrigger className="h-auto p-0 border-none shadow-none focus:ring-0 text-[13px] font-bold w-28 bg-transparent text-slate-700">
            <SelectValue placeholder="Semua" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-slate-100 bg-white z-100 shadow-xl border-2">
            <SelectItem value="all" className="text-[13px] font-bold py-2">Semua Tipe</SelectItem>
            <SelectItem value="Dine In" className="text-[13px] font-bold py-2">Dine In</SelectItem>
            <SelectItem value="Take Away" className="text-[13px] font-bold py-2">Take Away</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 3. Method Filter */}
      <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 h-12 rounded-2xl border border-slate-100 shadow-sm hover:border-cyan-200 transition-all group">
        <WalletCards size={16} className="text-cyan-600 group-hover:scale-110 transition-transform" />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">Metode</span>
        <Select value={method} onValueChange={(val) => setMethod(val as PaymentMethod | "all")}>
          <SelectTrigger className="h-auto p-0 border-none shadow-none focus:ring-0 text-[13px] font-bold w-28 bg-transparent text-slate-700">
            <SelectValue placeholder="Semua" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-slate-100 bg-white z-100 shadow-xl border-2">
            <SelectItem value="all" className="text-[13px] font-bold py-2">Semua Bayar</SelectItem>
            <SelectItem value="CASH" className="text-[13px] font-bold py-2">Cash</SelectItem>
            <SelectItem value="BCA" className="text-[13px] font-bold py-2">Bank BCA</SelectItem>
            <SelectItem value="DANA" className="text-[13px] font-bold py-2">E-Wallet Dana</SelectItem>
            <SelectItem value="QRIS" className="text-[13px] font-bold py-2">QRIS Payment</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}