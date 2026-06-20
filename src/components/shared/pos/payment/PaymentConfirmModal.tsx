"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import type { PaymentMethod } from "./payment.types";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useReceiptStore } from "@/store/useReceiptStore";
import { generateOrderId } from "@/lib/generateOrderId";
import { saveOrder, type LocalOrder, type OrderItem } from "@/lib/db";
import { syncOrderToCloud } from "@/app/(dashboard)/order/actions";
import { cn } from "@/lib/utils";
import { Calculator, Loader2, Copy, RotateCcw } from "lucide-react";
import { toast } from "sonner";

const PAYMENT_INFO: Record<string, { label: string; account: string; owner: string }> = {
  DANA: { label: "DANA", account: "0821-4394-4219", owner: "Kurniawan Adi Prasetya" },
  QRIS: { label: "QRIS", account: "Stiker di Meja Kasir", owner: "Coffee POS" },
  TRANSFER: { label: "BANK BCA", account: "725-810-3561", owner: "Kurniawan Adi Prasetya" },
  BCA: { label: "BANK BCA", account: "725-810-3561", owner: "Kurniawan Adi Prasetya" },
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  method: PaymentMethod;
};

export function PaymentConfirmModal({ open, onClose, onSuccess, method }: Props) {
  const subtotal = useCartStore((s) => s.getSubtotal());
  const items = useCartStore((s) => s.items);
  const orderType = useCartStore((s) => s.orderType);
  const customerName = useCartStore((s) => s.customerName);
  const activeOrderId = useCartStore((s) => s.activeOrderId);
  const setReceipt = useReceiptStore((s) => s.setReceipt);

  const [cashReceived, setCashReceived] = useState<number | "">("");
  const [isProcessing, setIsProcessing] = useState(false);

  const paidAmount = typeof cashReceived === "number" ? cashReceived : subtotal;
  const isCashEnough = method !== "CASH" || (typeof cashReceived === "number" && cashReceived >= subtotal);
  const change = typeof cashReceived === "number" ? cashReceived - subtotal : 0;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Nomor berhasil disalin!");
  };

  async function onConfirm() {
    if (isProcessing) return;
    setIsProcessing(true);

    const orderId = activeOrderId && activeOrderId !== "" ? activeOrderId : generateOrderId("POS-");
    const createdAt = new Date().toISOString();

    const formattedItems: OrderItem[] = items.map((i) => ({
      id: i.productId,
      name: i.name,
      qty: i.qty,
      price: i.price,
      categoryType: i.categoryType,
      notes: i.notes || "",
      isDone: false,
    }));

    const isPayOnly = activeOrderId && activeOrderId !== "";

    const orderData: LocalOrder = {
      id: orderId,
      createdAt,
      total: subtotal,
      paid: Number(paidAmount),
      paymentMethod: method,
      customerName: customerName || "Guest",
      orderType: orderType as "Dine In" | "Take Away",
      status: isPayOnly ? "COMPLETED" : "PENDING",
      items: formattedItems,
      isSynced: false,
    };

    setReceipt({
      orderId: orderId,
      subtotal: subtotal,
      createdAt,
      items: formattedItems,
      tax: 0,
      charge: 0,
      total: subtotal,
      paid: Number(paidAmount),
      change: Number(paidAmount) - subtotal,
      customerName: orderData.customerName ?? "Guest",
      cashierName: "Revangga",
      orderType: orderData.orderType,
      paymentMethod: method,
    });

    try {
      const response = await syncOrderToCloud(orderData);
      await saveOrder({ ...orderData, isSynced: response?.success ?? false });
      useCartStore.getState().clearCart();
      toast.success("Pesanan berhasil diproses!");
    } catch (err) {
      console.error("SYNC_ERROR:", err);
      await saveOrder({ ...orderData, isSynced: false });
      toast.error("Gagal sinkronisasi, data tersimpan secara lokal.");
    } finally {
      setIsProcessing(false);
      onClose();
      onSuccess();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none rounded-[2.5rem] bg-white">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
              <Calculator size={18} />
            </div>
            <DialogTitle className="text-lg font-black uppercase tracking-tight">Konfirmasi Bayar</DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-6 pt-2 space-y-5">
          <div className="bg-slate-900 p-5 rounded-3xl flex justify-between items-center text-white">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Total Bill</span>
            <span className="text-2xl font-black tabular-nums">Rp {subtotal.toLocaleString("id-ID")}</span>
          </div>

          {method === "CASH" ? (
            <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                  Pilih Nominal Cepat
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {/* Shortcut Uang Pas */}
                  <button
                    type="button"
                    onClick={() => setCashReceived(subtotal)}
                    className="py-3 text-[10px] font-black bg-slate-900 text-white rounded-xl hover:bg-black transition-all active:scale-95 shadow-lg shadow-slate-200"
                  >
                    PAS
                  </button>

                  {[5000, 10000, 20000, 50000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCashReceived((prev) => (Number(prev) || 0) + amt)}
                      className="py-3 text-[11px] font-black bg-slate-50 border border-slate-100 rounded-xl hover:bg-white hover:border-slate-900 transition-all active:scale-95"
                    >
                      +{amt / 1000}k
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end px-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Uang Diterima
                  </label>
                  <button
                    type="button"
                    onClick={() => setCashReceived("")}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-orange-600 hover:text-orange-700 transition-colors uppercase tracking-tight"
                  >
                    <RotateCcw size={12} />
                    Reset
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value ? Number(e.target.value) : "")}
                    className="h-16 rounded-2xl border-2 border-slate-100 bg-white text-2xl font-black focus:border-slate-900 focus:ring-0 px-6 transition-all tabular-nums"
                    placeholder="0"
                    autoFocus
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 font-black text-xl pointer-events-none">Rp</div>
                </div>
              </div>

              <div className={cn(
                "p-5 rounded-2xl border-2 transition-all flex justify-between items-center",
                change < 0 ? "bg-red-50 border-red-100 text-red-600" : "bg-emerald-50 border-emerald-100 text-emerald-600"
              )}>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                    {change < 0 ? "Kurang Bayar" : "Kembalian"}
                  </span>
                  <span className="text-xl font-black tabular-nums">
                    Rp {Math.abs(change).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className={cn("p-2 rounded-full bg-white shadow-sm", change < 0 ? "text-red-500" : "text-emerald-500")}>
                  <Calculator size={20} />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-400">
              <div className="p-5 rounded-3xl bg-cyan-50 border border-cyan-100 space-y-4 relative overflow-hidden">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-cyan-600">Instruksi {method}</p>
                  <p className="text-xs text-cyan-800/70 font-medium">Informasi pembayaran manual:</p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-cyan-200/50 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Account {PAYMENT_INFO[method]?.label || method}</p>
                      <p className="text-base font-black text-slate-900 tracking-tight">{PAYMENT_INFO[method]?.account || "N/A"}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(PAYMENT_INFO[method]?.account || "")}
                      className="p-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Atas Nama</p>
                    <p className="text-sm font-bold text-slate-800">{PAYMENT_INFO[method]?.owner || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Button
            className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-black text-white shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:bg-slate-100"
            disabled={!isCashEnough || isProcessing}
            onClick={onConfirm}
          >
            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <span className="font-black uppercase tracking-widest text-xs">Konfirmasi Selesai</span>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}