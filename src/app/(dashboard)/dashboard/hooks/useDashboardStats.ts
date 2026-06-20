import { useMemo } from "react";
import { Prisma } from "@prisma/client";
import {
  OrderFromCloud,
  FilterPeriod,
  DashboardStats,
  OrderItemSchema,
  OrderItem,
} from "../types/dashboard.types";

export function useDashboardStats(
  initialOrders: OrderFromCloud[],
  filter: FilterPeriod,
): DashboardStats {
  return useMemo(() => {
    const now = new Date();
    const todayStr = now.toDateString();

    const parseItems = (items: Prisma.JsonValue): OrderItem[] => {
      try {
        const parsed = typeof items === "string" ? JSON.parse(items) : items;
        if (!Array.isArray(parsed)) return [];
        return parsed.map((item) => OrderItemSchema.parse(item));
      } catch (e) {
        console.error("Gagal parsing order items:", e);
        return [];
      }
    };

    // --- 1. LOGIKA FILTER UTAMA ---
    const filteredOrders = initialOrders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      if (filter === "HARI_INI") return orderDate.toDateString() === todayStr;
      if (filter === "MINGGU_INI") {
        const lastWeek = new Date(now);
        lastWeek.setDate(now.getDate() - 7);
        return orderDate >= lastWeek && orderDate <= now;
      }
      if (filter === "BULAN_INI") {
        return (
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }
      return true;
    });

    // --- 2. TREND COMPARISON ---
    const getPrevPeriodStats = () => {
      const prevOrders = initialOrders.filter((o) => {
        const d = new Date(o.createdAt);
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        if (filter === "HARI_INI")
          return d.toDateString() === yesterday.toDateString();
        return false;
      });
      return {
        revenue: prevOrders.reduce((sum, o) => sum + (o.total || 0), 0),
        count: prevOrders.length,
      };
    };

    const prevStats = getPrevPeriodStats();

    // --- 3. CALCULATE STATS ---
    const totalRevenue = filteredOrders.reduce(
      (sum, o) => sum + (o.total || 0),
      0,
    );
    const totalOrders = filteredOrders.length;
    let totalFood = 0;
    let totalDrink = 0;

    filteredOrders.forEach((order) => {
      parseItems(order.items).forEach((item) => {
        const sub = item.price * item.qty;
        if (item.categoryType === "FOOD") totalFood += sub;
        if (item.categoryType === "DRINK") totalDrink += sub;
      });
    });

    const calculateTrend = (curr: number, prev: number): number => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / prev) * 100;
    };

    // --- 4. CHART DATA (7 DAYS) ---
    const chartData = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      const dailyTotal = initialOrders
        .filter(
          (o) => new Date(o.createdAt).toDateString() === d.toDateString(),
        )
        .reduce((sum, o) => sum + (o.total || 0), 0);
      return { name: dayName, revenue: dailyTotal };
    });

    // --- 5. TOP PRODUCTS ---
    const productSales: Record<string, { name: string; qty: number }> = {};
    filteredOrders.forEach((order) => {
      parseItems(order.items).forEach((item) => {
        if (!productSales[item.id]) {
          productSales[item.id] = { name: item.name, qty: 0 };
        }
        productSales[item.id].qty += item.qty;
      });
    });

    return {
      activeRevenue: totalRevenue,
      activeOrders: totalOrders,
      activeFood: totalFood,
      activeDrink: totalDrink,
      revenueTrend: calculateTrend(totalRevenue, prevStats.revenue),
      orderTrend: calculateTrend(totalOrders, prevStats.count),
      vsLabel:
        filter === "HARI_INI"
          ? "vs yesterday"
          : filter === "MINGGU_INI"
            ? "vs last week"
            : "vs last month",
      chartData,
      topProducts: Object.values(productSales)
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5),

      // --- 6. RECENT ORDERS ---
      recentOrders: [...filteredOrders]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 10)
        .map((o) => ({
          id: o.id,
          total: o.total,
          waktu: new Date(o.createdAt).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          tanggal: new Date(o.createdAt).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
          }),
          customer: o.customerName || "GUEST",
          metode: o.paymentMethod || "CASH",
          tipe: (o.orderType || "").toLowerCase().includes("dine")
            ? "Dine In"
            : "Take Away",
        })),
    };
  }, [initialOrders, filter]);
}
