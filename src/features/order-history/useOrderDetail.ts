"use client";

import { useEffect, useState, useCallback } from "react";
import { getOrderById } from "@/lib/db";

export type OrderDetail = {
  id: string;
  createdAt: string;
  total: number;
  paid: number;
  paymentMethod: string;
  orderType: string;
  customerName?: string;
  items: {
    name: string;
    qty: number;
    price: number;
  }[];
};

export function useOrderDetail(orderId: string | null) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(false);

  // Fungsi untuk fetch detail order berdasarkan ID
  const fetchDetail = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const data = await getOrderById(id);
      setOrder(data as OrderDetail);
    } catch (err) {
      console.error("Error fetching order detail:", err);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Jika tidak ada orderId, reset state dan jangan panggil API
    if (!orderId) {
      setOrder(null);
      return;
    }

    // Panggil fungsi fetch
    fetchDetail(orderId);
    
  }, [orderId, fetchDetail]); // Tambahkan fetchDetail ke dependency array untuk memastikan referensi stabil

  return {
    order,
    loading,
  };
}