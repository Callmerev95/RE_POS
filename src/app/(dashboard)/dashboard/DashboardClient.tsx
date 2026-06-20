"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Import Komponen Modular ---
import { LowStockAlert } from "@/components/shared/inventory/LowStockAlert";
import { RevenueCard } from "./components/RevenueCard";
import { ProfitAnalysis } from "./components/ProfitAnalysis";
import { SalesChart } from "./components/SalesChart";
import { TopMenus } from "./components/TopMenus";
import { RecentActivities } from "./components/RecentActivities";

// --- Import Logic & Types ---
import { useDashboardStats } from "./hooks/useDashboardStats";
import {
  OrderFromCloud,
  LowStockItem,
  ProfitData,
  FilterPeriod
} from "./types/dashboard.types";

interface DashboardClientProps {
  initialOrders: OrderFromCloud[];
  lowStockItems: LowStockItem[];
  profitData: ProfitData;
}

export default function DashboardClient({
  initialOrders,
  lowStockItems,
  profitData
}: DashboardClientProps) {
  const [filter, setFilter] = useState<FilterPeriod>("HARI_INI");
  const router = useRouter();

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    return createClient(url, key);
  }, []);

  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('dashboard-realtime-ux')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'Order' },
        () => {
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router]);

  const stats = useDashboardStats(initialOrders, filter);

  return (
    <div className="flex flex-col gap-6 pb-10 max-w-425 mx-auto px-4 lg:px-8">

      {/* 1. HEADER SECTION & FILTER CONTROL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
            <Activity size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase italic leading-none">
              Intelligence Dashboard
            </h1>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1.5 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Padhe Coffee • Real-time Terminal
            </p>
          </div>
        </div>

        <div className="flex bg-slate-100/50 p-1 rounded-2xl border border-slate-200/40 backdrop-blur-md">
          {(["HARI_INI", "MINGGU_INI", "BULAN_INI"] as FilterPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setFilter(p)}
              className={cn(
                "px-5 py-2 rounded-xl text-[9px] font-black tracking-widest transition-all duration-300",
                filter === p ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {p.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <LowStockAlert items={lowStockItems} />

      {/* 2. MASTER GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-stretch">

        {/* Kolom Kiri: Finansial */}
        <div className="md:col-span-1 lg:col-span-4 flex flex-col gap-6 h-full">
          <RevenueCard
            revenue={stats.activeRevenue}
            trend={stats.revenueTrend}
            food={stats.activeFood}
            drink={stats.activeDrink}
          />
          <div className="flex-1">
            <ProfitAnalysis data={profitData} />
          </div>
        </div>

        {/* Kolom Tengah: Sales Graph  */}
        <div className="md:col-span-1 lg:col-span-5 min-w-0 flex flex-col">
          <div className="flex-1 min-h-100">
            <SalesChart data={stats.chartData} />
          </div>
        </div>

        {/* Kolom Kanan: Top Performers */}
        <div className="md:col-span-2 lg:col-span-3 min-w-0 flex flex-col">
          <div className="flex-1">
            <TopMenus products={stats.topProducts} />
          </div>
        </div>
      </div>

      {/* 3. FOOTER SECTION: Aktivitas Terbaru */}
      <RecentActivities orders={stats.recentOrders} />
    </div>
  );
}