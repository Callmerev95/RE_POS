"use client";

import { useOrderStore } from "@/store/useOrderStore";
import { OrderDrawer } from "./OrderDrawer";

/**
 * GlobalOrderDrawer bertindak sebagai penghubung antara 
 * Global State (Zustand) dengan UI Component (OrderDrawer).
 * * Keuntungan: OrderDrawer tetap modular dan tidak terikat 
 * langsung ke state store tertentu.
 */
export function GlobalOrderDrawer() {
  // Ambil state secara spesifik untuk menghindari re-render yang tidak perlu
  const isOpen = useOrderStore((s) => s.isOpen);
  const closeOrder = useOrderStore((s) => s.closeOrder);
  const selectedOrderId = useOrderStore((s) => s.selectedOrderId);


  return (
    <OrderDrawer
      open={isOpen}
      onClose={closeOrder}
      orderId={selectedOrderId}
    />
  );
}