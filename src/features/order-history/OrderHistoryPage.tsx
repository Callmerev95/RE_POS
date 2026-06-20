"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { History, Download, CloudSync } from "lucide-react";
import { useOrderHistory } from "./useOrderHistory";
import { useOrderStore } from "@/store/useOrderStore";
import { OrderHeader } from "@/app/(dashboard)/order/components/OrderHeader";
import { OrderTable } from "@/app/(dashboard)/order/components/OrderTable";
import { OrderFooter } from "@/app/(dashboard)/order/components/OrderFooter"; 
import { PremiumHeader } from "@/components/shared/header/PremiumHeader";
import { Button } from "@/components/ui/button";

export function OrderHistoryPage() {
  const {
    orders,
    loading,
    dateRange,
    setDateRange,
    method,
    setMethod,
    type,
    setType,
    onExport,
  } = useOrderHistory();

  const searchParams = useSearchParams();
  const orderIdFromUrl = searchParams.get("id");
  const openOrder = useOrderStore((s) => s.openOrder);

  // Jika ada orderId di URL, buka order tersebut secara otomatis
  useEffect(() => {
    if (orderIdFromUrl) {
      openOrder(orderIdFromUrl);
    }
  }, [orderIdFromUrl, openOrder]);

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 overflow-hidden pr-2">

      {/* 1. Header Area */}
      <div className="shrink-0">
        <PremiumHeader
          icon={History}
          title="RIWAYAT TRANSAKSI"
          subtitle="MONITORING AKTIVITAS PENJUALAN REAL-TIME"
          actions={
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="rounded-2xl border-orange-100 bg-orange-50/50 text-orange-600 text-[10px] font-black uppercase hover:bg-orange-100 h-11 px-5 shadow-sm border-2 gap-2 transition-all active:scale-95"
              >
                <CloudSync size={16} className="text-orange-500 animate-[spin_6s_linear_infinite]" />
                Sync Cloud
              </Button>
              <Button
                onClick={onExport}
                className="rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase h-11 px-6 shadow-xl shadow-slate-200 transition-all hover:bg-slate-800 active:scale-95"
              >
                <Download size={16} className="mr-2" />
                Export Data
              </Button>
            </div>
          }
        />
      </div>

      {/* 2. Filter Bar */}
      <div className="bg-white/60 backdrop-blur-md p-2 rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/30 shrink-0">
        <OrderHeader
          dateRange={dateRange}
          setDateRange={setDateRange}
          method={method}
          setMethod={setMethod}
          type={type}
          setType={setType}
        />
      </div>

      {/* 3. Main Content - Table Area */}
      <div className="flex-1 min-h-0 flex flex-col bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden transition-all duration-500 hover:border-cyan-100">
        <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#f8fafc]">
          <OrderTable orders={orders} loading={loading} />
        </div>

        <OrderFooter
          count={orders.length}
          label="Transaksi Terbaru"
        />
      </div>

      {/* 4. Global Footer Label */}
      <p className="text-center text-[9px] text-slate-300 font-black uppercase tracking-[0.4em] shrink-0 pt-2 pb-1">
        © 2026 RE_POS • Premium Order Management System
      </p>
    </div>
  );
}