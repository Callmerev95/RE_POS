"use client";

import { z } from "zod";
import { LocalOrderSchema } from "@/lib/db";
import { OrderRow } from "./OrderRow";
import { OrderEmptyState } from "./OrderEmptyState";
import { Spinner } from "@/components/ui/spinner";

type OrderRecord = z.infer<typeof LocalOrderSchema> & { isSynced?: boolean };

interface Props {
  orders: OrderRecord[];
  loading?: boolean;
}

export function OrderTable({ orders, loading }: Props) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Spinner className="text-cyan-500" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">
          Memaksimalkan Data...
        </p>
      </div>
    );
  }

  if (orders.length === 0) return <OrderEmptyState />;

  return (
    <div className="relative min-w-full isolate">
      <table className="w-full text-sm border-separate border-spacing-0">
        <thead>
          <tr className="relative z-30">
            <th className="sticky top-0 z-30 bg-[#f8fafc] w-1 p-0 border-b border-slate-200 first:rounded-tl-3xl" />
            <th className="sticky top-0 z-30 bg-[#f8fafc] px-6 py-4 text-left font-black text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">Waktu</th>
            <th className="sticky top-0 z-30 bg-[#f8fafc] px-6 py-4 text-left font-black text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">Customer</th>
            <th className="sticky top-0 z-30 bg-[#f8fafc] px-6 py-4 text-left font-black text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">Tipe</th>
            <th className="sticky top-0 z-30 bg-[#f8fafc] px-6 py-4 text-left font-black text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">Metode</th>
            <th className="sticky top-0 z-30 bg-[#f8fafc] px-6 py-4 text-right font-black text-slate-500 uppercase tracking-wider text-[10px] last:rounded-tr-3xl border-b border-slate-200">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {orders.map((o) => (
            // Hapus safeParse di sini untuk performa. Validasi sudah dilakukan saat fetch [cite: 2026-01-12]
            <OrderRow key={o.id} order={o} />
          ))}
        </tbody>
      </table>
    </div>
  );
}