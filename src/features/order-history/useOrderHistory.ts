"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { z } from "zod";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import * as XLSX from "xlsx";

import {
  upsertOrdersFromCloud,
  LocalOrderSchema,
  type OrderItem,
  getAllOrders,
} from "@/lib/db";
import { getOrdersFromCloud } from "@/app/(dashboard)/order/actions";

export type OrderRecord = z.infer<typeof LocalOrderSchema>;
type OrderType = OrderRecord["orderType"];
type PaymentMethod = OrderRecord["paymentMethod"];

export function useOrderHistory() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [method, setMethod] = useState<PaymentMethod | "all">("all");
  const [type, setType] = useState<OrderType | "all">("all");

  // State untuk filter tanggal, default ke hari ini
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });

  const isFetching = useRef(false);

  const loadOrders = useCallback(async () => {
    if (isFetching.current) return;
    isFetching.current = true;

    setLoading(true);
    setOrders([]); // Reset orders saat mulai load untuk menghindari data lama muncul saat filter berubah

    try {
      const startStr = dateRange?.from
        ? format(dateRange.from, "yyyy-MM-dd")
        : undefined;
      const endStr = dateRange?.to
        ? format(dateRange.to, "yyyy-MM-dd")
        : undefined;

      const cloudResponse = await getOrdersFromCloud({
        startDate: startStr,
        endDate: endStr,
        method,
        type,
        limit: 100,
      });

      if (cloudResponse.success && cloudResponse.data) {
        const normalizedOrders: OrderRecord[] = cloudResponse.data.map(
          (order) => ({
            id: order.id,
            createdAt: new Date(order.createdAt).toISOString(),
            total: order.total,
            paid: order.paid,
            paymentMethod: order.paymentMethod as PaymentMethod,
            customerName: order.customerName || "Guest",
            orderType: order.orderType as OrderType,
            items: (order.items as unknown as OrderItem[]) || [],
            isSynced: true,
            status: order.status || "COMPLETED",
          }),
        );
        setOrders(normalizedOrders);
        upsertOrdersFromCloud(normalizedOrders).catch(console.error);
      } else {
        const localData = await getAllOrders();
        setOrders(localData);
      }
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [dateRange, method, type]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = orders.filter((o) => {
    const searchLower = search.toLowerCase();
    return (
      !search ||
      o.customerName?.toLowerCase().includes(searchLower) ||
      o.id.toLowerCase().includes(searchLower)
    );
  });

  const onExport = useCallback(() => {
    if (filteredOrders.length === 0) return alert("Tidak ada data.");
    const excelData = filteredOrders.map((o) => ({
      "ID Transaksi": o.id,
      Waktu: format(new Date(o.createdAt), "dd/MM/yyyy HH:mm"),
      Customer: o.customerName || "Guest",
      Tipe: o.orderType,
      Metode: o.paymentMethod,
      Total: o.total,
      Status: o.status,
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Riwayat");
    XLSX.writeFile(
      workbook,
      `Laporan_${format(new Date(), "dd-MM-yyyy")}.xlsx`,
    );
  }, [filteredOrders]);

  return {
    orders: filteredOrders,
    loading,
    reload: loadOrders,
    search,
    setSearch,
    method,
    setMethod,
    type,
    setType,
    dateRange,
    setDateRange,
    onExport,
  };
}
