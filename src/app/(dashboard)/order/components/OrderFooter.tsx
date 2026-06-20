"use client";

import { Database } from "lucide-react";

interface Props {
  count: number;
  label: string;
}

export function OrderFooter({ count, label }: Props) {
  return (
    <div className="bg-white px-10 py-4 border-t border-slate-50 flex justify-between items-center shrink-0 z-10 rounded-b-[3rem]">
      {/* Label Statistik */}
      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
        Total {count.toLocaleString("id-ID")} {label}
      </p>

      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2.5 bg-slate-50/50 px-4 py-1.5 rounded-full border border-slate-100/50">
          <Database size={14} className="text-green-500/80" />
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
            </span>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
              Cloud Connected
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}