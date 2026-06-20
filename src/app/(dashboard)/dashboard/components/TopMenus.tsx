"use client";

import { Trophy, ChevronRight, BarChart2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TopProduct {
  name: string;
  qty: number;
}

interface TopMenusProps {
  products: TopProduct[];
}

export function TopMenus({ products }: TopMenusProps) {
  const router = useRouter();

  return (
    <div className={cn(
      "bg-white border border-slate-100 rounded-[2.5rem] shadow-sm flex flex-col group transition-all duration-500 hover:border-slate-300",
      "h-full w-full overflow-hidden",
      "p-6 xl:p-9"
    )}>
      {/* Header Area */}
      <div className="flex items-center justify-between mb-8 xl:mb-10 shrink-0">
        <div>
          <h3 className="text-lg xl:text-xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
            Top Menus
          </h3>
          <p className="text-[9px] xl:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
            Best Seller Items
          </p>
        </div>
        <div className="p-2.5 xl:p-3 bg-amber-50 text-amber-500 rounded-2xl shadow-sm shadow-amber-100/50 shrink-0">
          <Trophy size={18} className="xl:w-5 xl:h-5" strokeWidth={2.5} />
        </div>
      </div>

      {/* Daftar Produk Terlaris - TooltipProvider */}
      <TooltipProvider delayDuration={200}>
        <div className="space-y-1 xl:space-y-2 flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-0">
          {products.length > 0 ? (
            products.map((p, i) => (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <div
                    className="flex items-center justify-between group/item p-3 xl:p-3.5 rounded-3xl border border-transparent hover:bg-slate-50 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-center gap-4 xl:gap-5 min-w-0">
                      <span className="text-[10px] xl:text-[11px] font-black text-slate-200 group-hover/item:text-slate-900 transition-colors italic tabular-nums shrink-0">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[12px] xl:text-[13px] font-black text-slate-800 uppercase tracking-tight group-hover/item:text-slate-900 transition-colors truncate">
                          {p.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5 xl:mt-1 text-[9px] xl:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <BarChart2 size={10} className="text-emerald-500 shrink-0" />
                          <span className="truncate">{p.qty} Items Sold</span>
                        </div>
                      </div>
                    </div>

                    <div className="w-7 h-7 xl:w-8 xl:h-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-300 group-hover/item:bg-slate-900 group-hover/item:text-white group-hover/item:translate-x-1 transition-all duration-300 shrink-0">
                      <ChevronRight size={14} className="xl:w-4 xl:h-4" strokeWidth={3} />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom" 
                  sideOffset={8} 
                  className="bg-slate-900 text-white border-slate-800 rounded-xl px-4 py-2 shadow-2xl z-50"
                >
                  <p className="text-[10px] font-black uppercase tracking-widest leading-tight">
                    {p.name}
                  </p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">
                    Total: <span className="text-emerald-400">{p.qty} Menus Sold</span>
                  </p>
                </TooltipContent>
              </Tooltip>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-10 opacity-20">
              <p className="text-[9px] xl:text-[10px] font-black uppercase italic tracking-widest">No Sales Recorded</p>
            </div>
          )}
        </div>
      </TooltipProvider>

      {/* Tombol Aksi Bawah */}
      <div className="mt-6 xl:mt-8 shrink-0">
        <button
          onClick={() => router.push('/inventory/ingredients')}
          className="w-full py-3.5 xl:py-4 bg-slate-900 text-white rounded-2xl text-[9px] xl:text-[10px] font-black uppercase tracking-[0.2em] italic hover:bg-slate-800 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-300 active:scale-[0.98]"
        >
          Check Raw Materials
        </button>
      </div>
    </div>
  );
}