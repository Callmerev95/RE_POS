"use client";

import { motion } from "framer-motion";
import { History, ArrowUpRight, Wallet, User, Clock, Monitor } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useOrderStore } from "@/store/useOrderStore";

interface RecentOrder {
  id: string;
  total: number;
  waktu: string;
  tanggal: string;
  customer: string;
  metode: string;
  tipe: string;
}

interface RecentActivitiesProps {
  orders: RecentOrder[];
}

export function RecentActivities({ orders }: RecentActivitiesProps) {
  const router = useRouter();
  const openOrder = useOrderStore((s) => s.openOrder);

  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 xl:p-9 shadow-sm overflow-hidden group transition-all duration-500 hover:border-slate-300">
      {/* Header Area */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-200">
            <History size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
              Live Activities
            </h3>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Real-time Transaction Feed
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push('/order')}
          className="px-5 py-2.5 bg-slate-50 hover:bg-slate-900 hover:text-white active:scale-95 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest transition-all duration-300 flex items-center gap-2 group/btn"
        >
          View Full History
          <ArrowUpRight size={12} strokeWidth={3} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
        </button>
      </div>

      {/* List Area */}
      <div className="flex flex-col gap-3">
        {orders.length > 0 ? (
          orders.map((order, i) => (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              key={order.id}
              onClick={() => openOrder(order.id)}
              className="relative flex items-center justify-between p-4 xl:p-5 bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-xl hover:shadow-slate-200/40 rounded-4xl transition-all duration-300 group/item cursor-pointer active:scale-[0.99]"
            >
              {/* --- ULTIMATE TOOLTIP FIX --- */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-200 opacity-0 
                              hidden xl:group-hover/item:opacity-100 xl:block landscape:xl:block">
                <div className="bg-slate-900 text-[8px] font-black text-white px-3 py-1.5 rounded-lg uppercase tracking-[0.2em] shadow-xl whitespace-nowrap border border-slate-700">
                  Click to see details
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-900" />
                </div>
              </div>

              {/* SISI KIRI: Profil & Waktu */}
              <div className="flex items-center gap-4 xl:gap-6 min-w-0 flex-[1.5]">
                <div className="relative shrink-0">
                  <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center group-hover/item:bg-slate-900 transition-colors duration-300 shadow-sm">
                    <User size={18} className="text-slate-400 group-hover/item:text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-[13px] font-black text-slate-900 uppercase tracking-tight truncate">
                      {order.customer}
                    </h4>
                    <span className="text-[8px] font-black text-slate-300 bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                      ID-{order.id.slice(0, 5)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5">
                      <Clock size={10} className="text-slate-300" />
                      {order.waktu}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-slate-200" />
                    <span className="italic text-slate-500">{order.tipe}</span>
                  </div>
                </div>
              </div>

              {/* SISI TENGAH: Status & Terminal */}
              <div className="hidden lg:flex items-center gap-12 flex-1 justify-center px-4">
                <div className="text-center">
                  <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Status</p>
                  <p className="text-[10px] font-black text-emerald-500 uppercase italic leading-none">Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Terminal</p>
                  <div className="flex items-center gap-1 justify-center">
                    <Monitor size={8} className="text-slate-400" />
                    <p className="text-[10px] font-black text-slate-900 uppercase leading-none">POS-01</p>
                  </div>
                </div>
              </div>

              {/* SISI KANAN: Payment & Total */}
              <div className="flex items-center gap-4 xl:gap-8 shrink-0 text-right justify-end flex-1">
                <div className="hidden sm:block">
                  <div className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all",
                    order.metode.toLowerCase() === 'cash'
                      ? "bg-emerald-50/50 border-emerald-100 text-emerald-600"
                      : "bg-blue-50/50 border-blue-100 text-blue-600"
                  )}>
                    <Wallet size={10} />
                    {order.metode}
                  </div>
                </div>

                <div className="min-w-25">
                  <p className="text-sm xl:text-base font-black text-slate-900 italic tabular-nums leading-none">
                    Rp {order.total.toLocaleString("id-ID")}
                  </p>
                  <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mt-1.5">
                    Verified
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200">
              <History size={24} />
            </div>
            <p className="opacity-30 italic text-[10px] font-black uppercase tracking-widest text-slate-900 text-center">
              Monitoring daily traffic...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}