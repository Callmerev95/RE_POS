import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";
import { getLowStockSummary } from "../inventory/ingredients/actions";
import { getDashboardProfitData } from "./actions";
import { OrderFromCloud } from "./types/dashboard.types";

export const revalidate = 0;
export const runtime = "nodejs";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  // Ambil data secara paralel tanpa menunggu satu per satu
  const [orders, lowStockRes, profitAnalysis] = await Promise.all([
    prisma.order.findMany({
      where: {
        createdAt: { gte: last30Days }
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        createdAt: true,
        total: true,
        items: true,
        customerName: true,
        paymentMethod: true,
        orderType: true,
      }
    }),
    getLowStockSummary(),
    getDashboardProfitData()
  ]);

  // mapping profit data dengan fallback nilai 0 jika gagal
  const profitData = {
    revenue: profitAnalysis.success ? (profitAnalysis.revenue ?? 0) : 0,
    expenses: profitAnalysis.success ? (profitAnalysis.expenses ?? 0) : 0,
    grossProfit: profitAnalysis.success ? (profitAnalysis.grossProfit ?? 0) : 0,
    netProfit: profitAnalysis.success ? (profitAnalysis.netProfit ?? 0) : 0,
    margin: profitAnalysis.success ? (profitAnalysis.margin ?? 0) : 0,
  };

  return (
    <DashboardClient
      initialOrders={orders as unknown as OrderFromCloud[]}
      lowStockItems={lowStockRes.success && lowStockRes.data ? lowStockRes.data : []}
      profitData={profitData}
    />
  );
}