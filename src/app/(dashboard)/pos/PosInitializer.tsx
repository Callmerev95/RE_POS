"use client";

import { useEffect } from "react";
import { useHoldOrderStore } from "@/store/useHoldOrderStore";

export function PosInitializer() {
  useEffect(() => {
    // Jalankan inisialisasi data Hold Order dari IndexedDB saat pertama kali load
    useHoldOrderStore.getState().initialize();
  }, []);

  return null; 
}