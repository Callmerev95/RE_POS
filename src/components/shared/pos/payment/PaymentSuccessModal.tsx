"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Home, Printer, Loader2 } from "lucide-react";
import { useReceiptStore } from "@/store/useReceiptStore";
import { getPrinterSettings } from "@/app/(dashboard)/user/printerActions";
import { PrinterSettings } from "@/app/(dashboard)/settings/printer/types/printer.types";
import { printReceiptBluetooth, type ReceiptData } from "@/lib/printer-utils";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function PaymentSuccessModal({ open, onClose }: Props) {
  const { receipt } = useReceiptStore();
  const [isPrinting, setIsPrinting] = useState(false);
  const [printerConfig, setPrinterConfig] = useState<PrinterSettings | null>(null);

  useEffect(() => {
    if (open) {
      getPrinterSettings().then((res) => {
        // ✅ Melakukan pengecekan data sebelum set state
        if (res.success && res.data) {
          setPrinterConfig(res.data as unknown as PrinterSettings);
        }
      });
    }
  }, [open]);

  const handlePrint = async () => {
    if (!printerConfig) {
      toast.error("Sedang mengambil setting printer, tunggu bentar bro...");
      return;
    }

    if (!receipt) {
      toast.error("Waduh, data struknya ilang. Coba cek lagi.");
      return;
    }

    setIsPrinting(true);

    try {
      // ✅ Mapping Type-Safe tanpa 'any'
      // Jika properti tax/charge tidak ada di interface store, TS akan memberikan error
      // Solusinya adalah akses aman atau default value melalui nullish coalescing
      const printData: ReceiptData = {
        header: printerConfig.header,
        address: printerConfig.address,
        footer: printerConfig.footer,
        kasir: receipt.cashierName,
        customerName: receipt.customerName,
        orderType: receipt.orderType,
        items: receipt.items.map(item => ({
          name: item.name,
          qty: item.qty,
          price: item.price
        })),
        subtotal: receipt.subtotal,
        total: receipt.total,
        paid: receipt.paid,
        change: receipt.change ?? 0,
        // ✅ Menggunakan optional chaining yang valid jika properti mungkin tidak ada
        tax: ("tax" in receipt) ? (receipt as { tax: number }).tax : 0,
        charge: ("charge" in receipt) ? (receipt as { charge: number }).charge : 0
      };

      const result = await printReceiptBluetooth(printData);

      if (result.success) {
        toast.success("Struk meluncur! 🚀");
      } else {
        toast.error(result.error || "Gagal nyetak, cek printernya bro.");
      }
    } catch (error) {
      console.error("PRINT_ERROR:", error);
      toast.error("Ada masalah koneksi ke printer.");
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none rounded-[2.5rem] bg-slate-50">
        <DialogHeader className="sr-only">
          <DialogTitle>Pembayaran Berhasil</DialogTitle>
          <DialogDescription>Detail transaksi dan cetak struk bluetooth.</DialogDescription>
        </DialogHeader>

        <div className="p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-200 rounded-full animate-ping opacity-25" />
              <div className="relative bg-emerald-500 text-white p-6 rounded-full shadow-lg shadow-emerald-200">
                <CheckCircle2 size={56} strokeWidth={2.5} />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight italic">
              SUCCESS!
            </h2>
            {receipt && (
              <div className="bg-emerald-50 py-2 px-4 rounded-xl inline-block border border-emerald-100">
                <p className="text-emerald-700 font-black text-xl">
                  KEMBALI: Rp {(receipt.change ?? 0).toLocaleString("id-ID")}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 pt-4">
            <Button
              onClick={handlePrint}
              disabled={isPrinting}
              className="h-16 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white shadow-xl shadow-cyan-100 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
            >
              {isPrinting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Printer size={22} />}
              <span className="font-black uppercase tracking-widest text-sm">Cetak Struk Bluetooth</span>
            </Button>

            <Button
              onClick={onClose}
              variant="ghost"
              className="h-14 rounded-2xl text-slate-400 hover:text-slate-900 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2"
            >
              <Home size={18} />
              Selesai & Pesanan Baru
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}