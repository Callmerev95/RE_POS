"use client";

import { motion } from "framer-motion";
import { Wallet } from "lucide-react";
import CountUp from "react-countup";
import { cn } from "@/lib/utils";

interface RevenueCardProps {
  revenue: number;
  trend: number;
  food: number;
  drink: number;
}

export function RevenueCard({ revenue, trend, food, drink }: RevenueCardProps) {
  const isDown = trend < 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "bg-white border border-slate-100 p-6 xl:p-9 rounded-[2.5rem] shadow-sm flex flex-col justify-between h-85 group transition-all duration-500 relative overflow-hidden",
        "hover:border-slate-300 hover:shadow-2xl hover:shadow-slate-200/50"
      )}
    >
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-slate-50 rounded-full blur-3xl group-hover:bg-slate-100/80 transition-colors duration-700" />

      <div className="relative z-10 flex justify-between items-start">
        <div className="p-3 xl:p-4 bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-200 transition-all duration-500 group-hover:scale-105">
          <Wallet className="w-5 h-5 xl:w-6 xl:h-6" strokeWidth={2.5} />
        </div>

        <div className={cn(
          "px-3 py-1.5 rounded-full text-[9px] xl:text-[10px] font-black italic tracking-wider transition-colors shadow-sm",
          isDown ? "bg-rose-50 text-rose-500 border border-rose-100" : "bg-emerald-50 text-emerald-500 border border-emerald-100"
        )}>
          {trend >= 0 ? "+" : ""}{trend.toFixed(1)}%
        </div>
      </div>

      <div className="relative z-10 my-4 xl:my-0">
        <p className="text-[9px] xl:text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-2">
          Gross Revenue
        </p>
        <h2 className={cn(
          "font-black text-slate-900 tracking-tighter flex items-center flex-wrap",
          "text-3xl sm:text-4xl xl:text-5xl transition-all duration-500"
        )}>
          <span className="text-base xl:text-xl text-slate-300 mr-2 italic font-black self-center translate-y-0.5 xl:translate-y-1">Rp</span>
          <CountUp end={revenue} separator="," duration={2.5} />
        </h2>
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-2 xl:gap-4 border-t border-slate-200/60 pt-6 xl:pt-7">
        <div className="flex flex-col space-y-1">
          <span className="text-[8px] xl:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">Food Items</span>
          <span className="text-sm xl:text-base font-black text-slate-800 tabular-nums truncate">
            Rp {food.toLocaleString("id-ID")}
          </span>
        </div>

        <div className="flex flex-col space-y-1 border-l border-slate-200/60 pl-3 xl:pl-6">
          <span className="text-[8px] xl:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">Drink Items</span>
          <span className="text-sm xl:text-base font-black text-slate-800 tabular-nums truncate">
            Rp {drink.toLocaleString("id-ID")}
          </span>
        </div>
      </div>
    </motion.div>
  );
}