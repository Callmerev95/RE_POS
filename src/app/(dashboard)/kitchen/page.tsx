"use client";

import { useEffect, useState, useCallback, useRef, useMemo, useOptimistic, startTransition } from "react";
import { PremiumHeader } from "@/components/shared/header/PremiumHeader";
import { ChefHat, CheckCircle2, BellRing, Coffee, Pizza, LayoutGrid, Loader2 } from "lucide-react";
import { type OrderItem } from "@/lib/db";
import { getKitchenOrders, updateOrderStatus, updateItemStatus } from "../order/actions";
import { toast } from "sonner";
import { OrderStatus } from "@prisma/client";
import { cn } from "@/lib/utils";
import { createClient } from "@supabase/supabase-js";

const NOTIFICATION_SOUND = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

type KitchenOrderItem = OrderItem;

interface KitchenOrder {
  id: string;
  createdAt: string;
  total: number;
  paid: number;
  paymentMethod: "CASH" | "DANA" | "BCA" | "QRIS";
  customerName: string | null;
  orderType: "Dine In" | "Take Away";
  items: KitchenOrderItem[];
  status: OrderStatus;
  isSynced: boolean;
}

type StationMode = "ALL" | "FOOD" | "DRINK";

type OptimisticAction =
  | { type: "TOGGLE_ITEM"; orderId: string; itemIdx: number; status: boolean }
  | { type: "COMPLETE_ORDER"; orderId: string };

export default function KitchenPage() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [station, setStation] = useState<StationMode>("ALL");

  // State to track which order is currently being processed (to prevent concurrent updates)
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const prevOrdersCount = useRef<number>(0);
  const isFirstLoad = useRef<boolean>(true);

  const [optimisticOrders, addOptimisticAction] = useOptimistic(
    orders,
    (state: KitchenOrder[], action: OptimisticAction) => {
      switch (action.type) {
        case "TOGGLE_ITEM":
          return state.map((order) => {
            if (order.id === action.orderId) {
              const newItems = [...order.items];
              newItems[action.itemIdx] = { ...newItems[action.itemIdx], isDone: action.status };
              return { ...order, items: newItems };
            }
            return order;
          });
        case "COMPLETE_ORDER":
          return state.filter((order) => order.id !== action.orderId);
        default:
          return state;
      }
    }
  );

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    return createClient(url, key);
  }, []);

  const fetchOrders = useCallback(async () => {
    // Prevent fetching if an order is currently being processed to avoid race conditions
    if (isProcessing) return;

    try {
      const res = await getKitchenOrders();
      if (res.success && res.data) {
        const normalized: KitchenOrder[] = res.data.map((o) => {
          const rawItems = (o.items as unknown[]) || [];
          return {
            id: o.id,
            total: Number(o.total || 0),
            paid: Number(o.paid || 0),
            createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : String(o.createdAt),
            items: rawItems.map((item) => {
              const i = item as Record<string, unknown>;
              return {
                id: String(i.id || ""),
                name: String(i.name || ""),
                qty: Number(i.qty || 0),
                price: Number(i.price || 0),
                categoryType: (i.categoryType as "FOOD" | "DRINK") || "FOOD",
                notes: i.notes ? String(i.notes) : null,
                isDone: i.isDone === true || String(i.isDone) === "true"
              };
            }),
            paymentMethod: (o.paymentMethod as KitchenOrder["paymentMethod"]) || "CASH",
            customerName: o.customerName,
            orderType: (o.orderType as KitchenOrder["orderType"]) || "Dine In",
            status: o.status as OrderStatus,
            isSynced: true,
          };
        });

        const activeOrders = normalized.filter(o => o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.CANCELLED);

        if (!isFirstLoad.current && activeOrders.length > prevOrdersCount.current) {
          const audio = new Audio(NOTIFICATION_SOUND);
          audio.play().catch(() => { });
          toast("Pesanan Baru!", {
            icon: <BellRing className="text-orange-500" />,
            description: "Ada pesanan masuk ke dapur bro."
          });
        }

        setOrders(normalized);
        prevOrdersCount.current = activeOrders.length;
        isFirstLoad.current = false;
      }
    } finally {
      setLoading(false);
    }
  }, [isProcessing]); 

  useEffect(() => {
    let isMounted = true;
    fetchOrders();

    const interval = setInterval(() => {
      if (isMounted) void fetchOrders();
    }, 10000);

    if (supabase) {
      const channel = supabase
        .channel("kitchen-realtime")
        .on("postgres_changes", { event: "*", schema: "public", table: "Order" }, () => {
          if (isMounted) void fetchOrders();
        })
        .subscribe();
      return () => {
        isMounted = false;
        clearInterval(interval);
        void supabase.removeChannel(channel);
      };
    }
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [supabase, fetchOrders]);

  const toggleItemDone = async (orderId: string, itemIdx: number, currentStatus: boolean) => {
    if (currentStatus || isProcessing) return;

    const nextStatus = true;
    startTransition(() => {
      addOptimisticAction({ type: "TOGGLE_ITEM", orderId, itemIdx, status: nextStatus });
    });

    try {
      const res = await updateItemStatus(orderId, itemIdx, nextStatus);
      if (!res.success) throw new Error();

      setOrders(prev => prev.map(order => {
        if (order.id === orderId) {
          const newItems = [...order.items];
          newItems[itemIdx] = { ...newItems[itemIdx], isDone: nextStatus };
          return { ...order, items: newItems };
        }
        return order;
      }));
    } catch {
      toast.error("Koneksi bermasalah");
      void fetchOrders();
    }
  };

  const handleStatusChange = async (id: string) => {
    // Block further actions while processing this order
    setIsProcessing(id);

    startTransition(() => {
      addOptimisticAction({ type: "COMPLETE_ORDER", orderId: id });
    });

    try {
      const res = await updateOrderStatus(id, OrderStatus.COMPLETED);
      if (res.success) {
        toast.success("Pesanan selesai!");
        setOrders(prev => prev.filter(o => o.id !== id));
      } else {
        throw new Error();
      }
    } catch {
      toast.error("Gagal update");
      void fetchOrders();
    } finally {
      // Unblock after a short delay to allow UI updates to settle
      setTimeout(() => setIsProcessing(null), 1000);
    }
  };

  const filteredOrders = useMemo(() => {
    return optimisticOrders
      .filter(order => {
        if (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED) return false;
        if (station === "ALL") return true;
        return order.items.some(item => item.categoryType === station);
      })
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [optimisticOrders, station]);

  if (loading && orders.length === 0) {
    return (
      <div className="h-[calc(100vh-180px)] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-700 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0 px-1">
        <PremiumHeader title="KITCHEN DISPLAY" subtitle="MANAJEMEN ANTRIAN REAL-TIME" icon={ChefHat} />
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
          <button onClick={() => setStation("ALL")} className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all", station === "ALL" ? "bg-white text-orange-600 shadow-sm" : "text-slate-400")}><LayoutGrid size={14} /> Semua</button>
          <button onClick={() => setStation("FOOD")} className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all", station === "FOOD" ? "bg-white text-orange-600 shadow-sm" : "text-slate-400")}><Pizza size={14} /> Kitchen</button>
          <button onClick={() => setStation("DRINK")} className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all", station === "DRINK" ? "bg-white text-orange-600 shadow-sm" : "text-slate-400")}><Coffee size={14} /> Barista</button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-50">
            <ChefHat size={48} className="mb-4 text-slate-300" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tidak ada antrian</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 h-full overflow-y-auto pb-10 pr-2 custom-scrollbar">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-4xl border-2 border-slate-100 p-5 flex flex-col h-125 shrink-0 transition-all hover:border-orange-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <span className="text-[14px] font-black text-slate-800 uppercase leading-tight mb-1">{order.customerName || "Guest"}</span>
                    <span className="text-[9px] font-bold text-slate-400 tracking-widest">#{order.id.slice(-6).toUpperCase()}</span>
                  </div>
                  <div className="px-3 py-1 rounded-full text-[8px] font-black uppercase bg-orange-500 text-white">
                    {order.orderType}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto mb-6 space-y-3 custom-scrollbar pr-1">
                  {order.items
                    .filter(item => station === "ALL" || item.categoryType === station)
                    .map((item) => {
                      const originalIdx = order.items.findIndex(i => i.id === item.id);
                      const isDone = item.isDone === true || String(item.isDone) === "true";

                      return (
                        <div
                          key={`${order.id}-${item.id}`}
                          onClick={() => toggleItemDone(order.id, originalIdx, isDone)}
                          className={cn(
                            "flex flex-col p-3 rounded-xl border transition-all relative overflow-hidden",
                            isDone
                              ? "bg-slate-50 border-slate-100 opacity-20 grayscale pointer-events-none select-none"
                              : "bg-orange-50/30 border-orange-100 shadow-sm ring-1 ring-orange-50/50 cursor-pointer"
                          )}
                        >
                          <div className="flex justify-between items-center">
                            <span className={cn(
                              "text-[11px] font-black uppercase tracking-tight",
                              isDone ? "line-through text-slate-400" : "text-slate-800"
                            )}>
                              {item.qty}x {item.name}
                            </span>
                            {isDone ? (
                              <CheckCircle2 size={14} className="text-green-600" />
                            ) : (
                              <div className="w-3 h-3 rounded-full border-2 border-orange-400 animate-pulse" />
                            )}
                          </div>
                          {item.notes && (
                            <p className={cn(
                              "text-[9px] mt-1 font-bold italic",
                              isDone ? "text-slate-300" : "text-orange-600"
                            )}>
                              &quot;{item.notes}&quot;
                            </p>
                          )}
                        </div>
                      );
                    })}
                </div>

                <div className="mt-auto pt-4 border-t border-slate-50">
                  {(() => {
                    const stationItems = order.items.filter(item => station === "ALL" || item.categoryType === station);
                    const allDone = stationItems.length > 0 && stationItems.every(i => i.isDone);
                    const isOrderProcessing = isProcessing === order.id;

                    return (
                      <button
                        disabled={!allDone || isOrderProcessing}
                        onClick={() => handleStatusChange(order.id)}
                        className={cn(
                          "w-full py-4 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all shadow-sm",
                          allDone
                            ? "bg-green-600 text-white hover:bg-green-700 shadow-green-100"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed",
                          isOrderProcessing && "opacity-50 cursor-wait"
                        )}
                      >
                        <CheckCircle2 size={18} />
                        {isOrderProcessing ? "Memproses..." : allDone ? "Selesaikan Pesanan" : "Belum Siap"}
                      </button>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}