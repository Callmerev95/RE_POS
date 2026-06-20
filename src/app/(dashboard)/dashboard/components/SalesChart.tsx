"use client";

import { Sparkles } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { cn } from "@/lib/utils";

interface SalesChartProps {
  data: Array<{
    name: string;
    revenue: number;
  }>;
}

export function SalesChart({ data }: SalesChartProps) {
  return (
    <div className={cn(
      "bg-white border border-slate-100 rounded-[2.5rem] shadow-sm flex flex-col group transition-all duration-500 hover:border-slate-300",
      "h-full w-full overflow-hidden",
      "p-6 xl:p-9"
    )}>
      {/* Header Grafik */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 xl:mb-8 gap-4 shrink-0">
        <div>
          <h3 className="text-lg xl:text-xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
            Sales Graph
          </h3>
          <p className="text-[9px] xl:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
            Revenue Flow Weekly
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 xl:px-4 xl:py-2 bg-orange-50/50 border border-orange-100 rounded-xl text-[8px] xl:text-[9px] font-black text-orange-600 tracking-widest shadow-sm shrink-0">
          <Sparkles size={12} className="text-orange-500 animate-pulse" />
          <span className="truncate uppercase">AI LIVE FEED</span>
        </div>
      </div>

      <div className="flex-1 w-full relative min-h-0">
        <div className="absolute inset-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="pcGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />

              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b' }}
                dy={15}
                tickFormatter={(val: string) => val.substring(0, 3).toUpperCase()}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                width={60}
                tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }}
                tickFormatter={(v: number) => `Rp ${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
              />

              <Tooltip
                contentStyle={{
                  borderRadius: '20px',
                  border: '1px solid #f1f5f9',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
                  padding: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(8px)'
                }}
                itemStyle={{ fontWeight: 900, fontSize: '12px', color: '#0f172a' }}
                cursor={{ stroke: '#0f172a', strokeWidth: 1, strokeDasharray: '4 4' }}
                // FIX TYPE ERROR: Tangani undefined secara eksplisit
                formatter={(value: number | string | undefined) => {
                  const numValue = value !== undefined ? Number(value) : 0;
                  return [`Rp ${numValue.toLocaleString("id-ID")}`, "Revenue"];
                }}
              />

              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#0f172a"
                strokeWidth={4}
                fill="url(#pcGrad)"
                dot={{ r: 4, fill: '#0f172a', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0, fill: '#0f172a' }}
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between items-center text-[8px] xl:text-[9px] font-black text-slate-400 uppercase italic tracking-widest gap-2 shrink-0">
        <span className="truncate uppercase">Terminal: POS-MAIN-01</span>
        <span className="text-emerald-500 shrink-0 uppercase">Synced</span>
      </div>
    </div>
  );
}