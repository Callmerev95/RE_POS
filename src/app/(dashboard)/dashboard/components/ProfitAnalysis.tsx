"use client";

import { motion } from "framer-motion";
import CountUp from "react-countup";
import { ProfitData } from "../types/dashboard.types";
import { cn } from "@/lib/utils";

interface ProfitAnalysisProps {
  data: ProfitData;
}

export function ProfitAnalysis({ data }: ProfitAnalysisProps) {
  const isLoss = data.netProfit < 0;

  return (
  
    <div className={cn(
      "bg-[#0f172a] rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden h-full group flex flex-col justify-between border border-white/2 transition-all duration-500",
      "p-6 xl:p-9"
    )}>
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/5 blur-[100px] -mr-20 -mt-20 group-hover:bg-emerald-500/15 transition-all duration-1000" />

      <div className="relative z-10 min-w-0"> 
        <div className="flex justify-between items-start mb-6 xl:mb-8 gap-3">
          <p className="text-[9px] xl:text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] opacity-80 truncate">
            Net Profit Analysis
          </p>
          <div className={cn(
            "px-2.5 py-1 xl:px-3 xl:py-1.5 border rounded-full text-[8px] xl:text-[10px] font-black uppercase italic tracking-wider transition-colors shrink-0",
            isLoss
              ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          )}>
            {data.margin.toFixed(1)}% Margin
          </div>
        </div>

        <div className="mb-8 xl:mb-10 min-w-0">
          {/* TRUNCATE PROTECTION */}
          <h2 className={cn(
            "font-black tracking-tighter leading-none flex items-baseline transition-all duration-500 truncate",
            "text-3xl sm:text-4xl lg:text-3xl xl:text-5xl 2xl:text-6xl tabular-nums",
            isLoss ? 'text-rose-500' : 'text-emerald-400'
          )}>
            <span className="text-sm xl:text-xl text-slate-600 italic font-black mr-1.5 shrink-0">Rp</span>
            <span className="truncate">
              <CountUp end={data.netProfit} separator="," duration={2.5} />
            </span>
          </h2>
        </div>

        {/* Breakdown: Truncate pada setiap value */}
        <div className="grid grid-cols-2 gap-2 xl:gap-4 border-t border-white/5 pt-6 xl:pt-7">
          <div className="space-y-1 min-w-0">
            <p className="text-[8px] xl:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">Gross Profit</p>
            <p className="text-[10px] sm:text-xs xl:text-base font-black text-slate-100 tabular-nums truncate">
              Rp {data.grossProfit.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="space-y-1 border-l border-white/10 pl-3 xl:pl-5 min-w-0">
            <p className="text-[8px] xl:text-[9px] font-black text-rose-500/80 uppercase tracking-widest truncate">Op. Expenses</p>
            <p className="text-[10px] sm:text-xs xl:text-base font-black text-rose-400 italic tabular-nums truncate">
              - Rp {data.expenses.toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar & Footer */}
      <div className="relative z-10 space-y-4 xl:space-y-5">
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(Math.max(Math.abs(data.margin), 0), 100)}%` }}
            className={cn(
              "h-full rounded-full transition-all duration-1000",
              isLoss
                ? "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                : "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
            )}
          />
        </div>
        <div className="flex justify-between items-center text-[8px] xl:text-[9px] font-black text-slate-500 uppercase italic tracking-[0.15em] gap-2">
          <span className="truncate mr-auto">Efficiency Rate</span>
          <span className="text-slate-400 bg-white/5 px-2 py-0.5 rounded text-[7px] xl:text-[8px] not-italic shrink-0">Live Terminal</span>
        </div>
      </div>
    </div>
  );
}