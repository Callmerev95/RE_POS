"use client";

import { useState } from "react";
import { z } from "zod";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Printer, Loader2 } from "lucide-react";

// Local Assets & Logic
import { useOrderDetail } from "@/features/order-history/useOrderDetail";
import { LocalOrderSchema, type OrderItem } from "@/lib/db";
import { toast } from "sonner";
import { printReceiptBluetooth, type ReceiptData } from "@/lib/printer-utils";
import { getPrinterSettings } from "@/app/(dashboard)/user/printerActions";
import { PrinterSettings } from "@/app/(dashboard)/settings/printer/types/printer.types";
import { useReceiptStore } from "@/store/useReceiptStore";

// Inferensi tipe dari Zod
type OrderRecord = z.infer<typeof LocalOrderSchema>;

type Props = {
  open: boolean;
  onClose: () => void;
  orderId: string | null;
};

export function OrderDrawer({ open, onClose, orderId }: Props) {
  const { order, loading } = useOrderDetail(orderId) as {
    order: OrderRecord | null;
    loading: boolean
  };

  const [isPrinting, setIsPrinting] = useState(false);

  async function onPrint() {
    if (!order) return;

    setIsPrinting(true);
    try {
      const res = await getPrinterSettings();

      if (res.success && res.data) {
        const s = res.data as unknown as PrinterSettings;

        const paidAmount = order.paid ?? order.total;
        const calculateChange = paidAmount - order.total;

        /**
         * ✅ PENENTUAN NAMA KASIR (NO ANY & SAFE FALLBACK)
         * 1. Cek di Database (Order)
         * 2. Ambil dari Store
         * 3. Fallback ke Nama lo "Revangga"
         */
        const dbCashier = ("cashierName" in order && typeof order.cashierName === "string")
          ? order.cashierName
          : null;

        const cashierName = dbCashier || useReceiptStore.getState().receipt?.cashierName || "Revangga";

        const printData: ReceiptData = {
          header: s.header || "PADHE COFFEE",
          address: s.address || "",
          footer: s.footer || "Terima Kasih!",
          kasir: cashierName,
          paymentMethod: order.paymentMethod || "CASH",
          customerName: order.customerName || "Guest",
          orderType: order.orderType,
          items: order.items.map((i: OrderItem) => ({
            name: i.name,
            qty: i.qty,
            price: i.price,
          })),
          subtotal: order.total,
          total: order.total,
          paid: paidAmount,
          change: calculateChange > 0 ? calculateChange : 0,
          tax: ("tax" in order) ? (order as { tax: number }).tax : 0,
          charge: ("charge" in order) ? (order as { charge: number }).charge : 0
        };

        const result = await printReceiptBluetooth(printData);

        if (result.success) {
          toast.success("Struk berhasil dicetak! 🚀");
        } else {
          toast.error(result.error || "Gagal mencetak struk.");
        }
      } else {
        toast.error("Atur printer di menu Settings terlebih dahulu");
      }
    } catch (err) {
      console.error("PRINT_ERROR:", err);
      toast.error("Terjadi kesalahan pada koneksi printer.");
    } finally {
      setIsPrinting(false);
    }
  }

  return (
    <Drawer open={open} onOpenChange={onClose} direction="right">
      <DrawerContent className="w-105 sm:w-120 h-full flex flex-col outline-none focus:outline-none">
        <DrawerHeader className="shrink-0 border-b">
          <DrawerTitle className="text-xl font-bold tracking-tight">Detail Transaksi</DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <p className="text-sm text-muted-foreground animate-pulse">Memuat detail transaksi...</p>
            </div>
          ) : order ? (
            <>
              {/* INFO SECTION */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Order ID</span>
                  <span className="font-mono text-[11px] bg-slate-100 px-2 py-1 rounded text-slate-600">
                    #{order.id.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Waktu Transaksi</span>
                  <span className="text-slate-700 font-semibold">
                    {new Date(order.createdAt).toLocaleString("id-ID", {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Nama Pelanggan</span>
                  <span className="font-bold text-slate-800">{order.customerName || "Guest"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Metode & Tipe</span>
                  <div className="flex gap-2">
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded uppercase border border-emerald-100">
                      {order.paymentMethod}
                    </span>
                    <span className="bg-blue-50 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded uppercase border border-blue-100">
                      {order.orderType}
                    </span>
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-100" />

              {/* ITEMS SECTION */}
              <div className="space-y-4">
                <p className="font-black text-[10px] uppercase text-slate-400 tracking-[0.2em]">Rincian Pesanan</p>
                <div className="space-y-4">
                  {order.items.map((item: OrderItem, idx: number) => (
                    <div key={`${order.id}-${idx}`} className="flex justify-between items-start gap-4 group">
                      <div className="flex flex-col flex-1">
                        <span className="font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
                          {item.name}
                        </span>
                        <span className="text-xs font-medium text-slate-400">
                          {item.qty} x Rp {item.price.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <span className="font-black text-slate-900 text-sm">
                        Rp {(item.qty * item.price).toLocaleString("id-ID")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p className="text-center py-10 text-slate-400">Data order tidak ditemukan.</p>
          )}
        </div>

        {/* FOOTER ACTION */}
        {!loading && order && (
          <div className="shrink-0 p-6 border-t bg-white shadow-[0_-10px_20px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex justify-between items-center bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
              <span className="text-sm font-bold text-emerald-800 uppercase tracking-widest">Total Bayar</span>
              <span className="text-2xl font-black text-emerald-600">
                Rp {order.total.toLocaleString("id-ID")}
              </span>
            </div>

            <Button
              className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-2xl py-7 text-sm font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50"
              onClick={onPrint}
              disabled={isPrinting}
            >
              {isPrinting ? (
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
              ) : (
                <Printer className="mr-3 h-5 w-5" />
              )}
              {isPrinting ? "Memproses..." : "Cetak Struk"}
            </Button>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}