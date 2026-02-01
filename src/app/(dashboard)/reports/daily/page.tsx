import { getDailyReportData } from "@/app/actions/report-actions";
import { ReportStatsSection } from "@/components/shared/reports/ReportStatsSection";
import { PaymentMethodGrid } from "@/components/shared/reports/PaymentMethodGrid";
import { RevenueAreaChart } from "@/components/shared/reports/RevenueAreaChart";
import { DailyReportHeader } from "./components/DailyReportHeader";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * DAILY REPORT PAGE - SERVER COMPONENT [cite: 2026-01-12]
 */
export default async function DailyReportPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>; // Next.js 15 mewajibkan Promise [cite: 2026-01-12]
}) {
  // 0. Unwrap SearchParams (Wajib di v15+)
  const resolvedParams = await searchParams;

  // 1. Inisialisasi Tanggal
  const d = new Date();
  const today = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;

  // Ambil tanggal dari URL search params hasil await
  const selectedDate = resolvedParams.date || today;

  // 2. Fetch Data dari Server Cache (SAT SET!) [cite: 2026-01-12]
  const { reportData, chartData } = await getDailyReportData(selectedDate);

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] gap-4 animate-in fade-in duration-700 overflow-hidden pr-2">
      <DailyReportHeader selectedDate={selectedDate} />

      <ReportStatsSection {...reportData} />

      <PaymentMethodGrid data={reportData} />

      <RevenueAreaChart
        data={chartData}
        isEmpty={reportData.count === 0}
        title="Tren Penjualan Per Jam"
      />

      <p className="text-center text-[9px] text-slate-300 font-bold uppercase tracking-[0.3em] shrink-0 pt-2 pb-1">
        2026 Padhe Coffee POS System • Arsitektur Global Store v2.0
      </p>
    </div>
  );
}