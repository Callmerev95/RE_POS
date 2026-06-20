"use client";

import { useState, useEffect } from "react";
import { Settings2, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { savePrinterSettings, getPrinterSettings } from "@/app/(dashboard)/user/printerActions";
import { PrinterPreview } from "./components/PrinterPreview";
import { PrinterSettings, BluetoothNavigator } from "./types/printer.types";

export default function PrinterPage() {
  const [loading, setLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [settings, setSettings] = useState<PrinterSettings>({
    name: "Printer Kasir",
    paperSize: 58,
    header: "PADHE COFFEE",
    address: "Jl. Perjuangan No. 88",
    footer: "Terima kasih atas kunjungan Anda!",
  });

  useEffect(() => {
    async function loadData() {
      const res = await getPrinterSettings();
      if (res.success && res.data) {
        setSettings(res.data as unknown as PrinterSettings);
      }
    }
    loadData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await savePrinterSettings(settings);
    setLoading(false);
    if (res.success) toast.success("Pengaturan printer disimpan!");
    else toast.error(res.error);
  }

  async function handleBluetoothTestPrint() {
    setIsConnecting(true);
    try {
      const nav = navigator as unknown as BluetoothNavigator;

      if (!nav.bluetooth) {
        toast.error("Browser ini tidak mendukung Web Bluetooth. Gunakan Chrome.");
        return;
      }

      const device = await nav.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
      });

      if (!device.gatt) {
        toast.error("GATT tidak tersedia pada perangkat ini.");
        return;
      }

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
      const characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');

      const encoder = new TextEncoder();
      const textToPrint =
        `${settings.header}\n` +
        `${settings.address}\n` +
        `--------------------------------\n` +
        `TEST KONEKSI BERHASIL!\n` +
        `PRINTER SIAP DIGUNAKAN\n` +
        `--------------------------------\n` +
        `${settings.footer}\n\n\n\n`;

      const data = encoder.encode(textToPrint);
      await characteristic.writeValue(data);
      toast.success("Berhasil! Printer merespon.");

    } catch (error) {
      console.error(error);
      toast.error("Koneksi dibatalkan atau printer tidak ditemukan.");
    } finally {
      setIsConnecting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tighter uppercase italic">Printer Setup</h1>
        <p className="text-slate-500 font-medium text-sm">Konfigurasi struk thermal dan koneksi bluetooth.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 space-y-6">
          <div className="flex items-center gap-3 text-cyan-600">
            <Settings2 className="w-5 h-5" />
            <h2 className="font-black text-xs uppercase tracking-[0.2em]">Konfigurasi</h2>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Nama Cafe (Header)</label>
              <input
                value={settings.header}
                onChange={(e) => setSettings({ ...settings, header: e.target.value })}
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-cyan-500 transition-all"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Alamat Outlet</label>
              <input
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-cyan-500 transition-all"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Pesan Footer</label>
              <textarea
                value={settings.footer}
                onChange={(e) => setSettings({ ...settings, footer: e.target.value })}
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-cyan-500 min-h-24 resize-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white rounded-2xl py-5 font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Konfigurasi
          </button>
        </form>

        <PrinterPreview 
          settings={settings} 
          isConnecting={isConnecting} 
          onTestPrint={handleBluetoothTestPrint} 
        />
      </div>
    </div>
  );
}