import { getMonthlyReportData } from "@/app/actions/report-actions";
import { ReportStatsSection } from "@/components/shared/reports/ReportStatsSection";
import { PaymentMethodGrid } from "@/components/shared/reports/PaymentMethodGrid";
import { RevenueAreaChart } from "@/components/shared/reports/RevenueAreaChart";
import { MonthlyReportHeader } from "./components/MonthlyReportHeader";

export default async function MonthlyReportPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const resolvedParams = await searchParams;
  const currentMonth = new Date().toISOString().slice(0, 7);
  const selectedMonth = resolvedParams.month || currentMonth;

  const { reportData, chartData } = await getMonthlyReportData(selectedMonth);

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] gap-4 animate-in fade-in duration-700 overflow-hidden pr-2">
      <MonthlyReportHeader selectedMonth={selectedMonth} />

      <ReportStatsSection {...reportData} />
      <PaymentMethodGrid data={reportData} />

      <RevenueAreaChart
        data={chartData}
        isEmpty={reportData.count === 0}
        title="Tren Penjualan Harian"
      />

      <p className="text-center text-[9px] text-slate-300 font-bold uppercase tracking-[0.3em] shrink-0 pt-2 pb-1">
        2026 RE_POS System • Arsitektur Global Store v2.0
      </p>
    </div>
  );
}