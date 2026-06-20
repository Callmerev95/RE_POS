"use client";

import { useSyncExternalStore } from "react";
import { Clock } from "lucide-react";

// Helper untuk subscribe ke perubahan waktu
function subscribe(callback: () => void) {
  const id = setInterval(callback, 1000);
  return () => clearInterval(id);
}

// Snapshot untuk mendapatkan waktu saat ini dalam detik
const getSnapshot = () => Math.floor(new Date().getTime() / 1000);
const getServerSnapshot = () => null;

export function HeaderClock() {
  const seconds = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  if (!seconds) {
    return (
      <div className="flex items-center gap-3 px-3 py-1.5 opacity-0">
        <div className="h-8 w-8" />
        <div className="w-20 h-8" />
      </div>
    );
  }

  // Konversi detik ke objek Date
  const time = new Date(seconds * 1000);

  return (
    <div className="flex items-center gap-2 md:gap-3 px-2.5 md:px-4 py-1.5 bg-white border border-slate-100 rounded-2xl shadow-sm shadow-slate-100/50">
      <div className="hidden sm:flex h-7 w-7 md:h-8 md:w-8 items-center justify-center bg-slate-50 rounded-xl text-slate-400">
        <Clock size={14} className="md:w-4 md:h-4" />
      </div>
      <div className="flex flex-col">
        <p className="text-[11px] md:text-sm font-black text-slate-900 tracking-tight leading-none">
          {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':')}
        </p>
        <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5 md:mt-1 leading-none">
          {time.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
        </p>
      </div>
    </div>
  );
}