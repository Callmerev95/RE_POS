import { z } from "zod";

/**
 * Skema untuk item pesanan (OrderItem)
 * Menggunakan Zod untuk validasi data dari Prisma JSON
 */
export const OrderItemSchema = z.object({

  id: z.string().optional().default("unknown-id"), 
  name: z.string().default("Produk Tidak Dikenal"),
  price: z.number().default(0),
  qty: z.number().default(0),
  categoryType: z.enum(["FOOD", "DRINK"]).optional(),
});

export type OrderItem = z.infer<typeof OrderItemSchema>;

/**
 * Skema data pesanan yang datang dari Cloud/Database
 */
export const OrderFromCloudSchema = z.object({
  id: z.string(),
  createdAt: z.union([z.date(), z.string()]),
  total: z.number(),
  items: z.any(), // Akan di-parse manual ke OrderItem[]
  customerName: z.string().optional().nullable(),
  paymentMethod: z.string().optional().nullable(),
  orderType: z.string(),
});

export type OrderFromCloud = z.infer<typeof OrderFromCloudSchema>;

/**
 * Skema untuk barang dengan stok rendah
 */
export const LowStockItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  stock: z.number(),
  unitUsage: z.string(),
  minStock: z.number(),
});

export type LowStockItem = z.infer<typeof LowStockItemSchema>;

/**
 * Skema data profit dan margin
 */
export const ProfitDataSchema = z.object({
  revenue: z.number(),
  expenses: z.number(),
  grossProfit: z.number(),
  netProfit: z.number(),
  margin: z.number(),
});

export type ProfitData = z.infer<typeof ProfitDataSchema>;

/**
 * Tipe filter periode dashboard
 */
export type FilterPeriod = "HARI_INI" | "MINGGU_INI" | "BULAN_INI";

/**
 * Interface untuk hasil perhitungan statistik (Stats)
 */
export interface DashboardStats {
  activeRevenue: number;
  activeOrders: number;
  activeFood: number;
  activeDrink: number;
  revenueTrend: number;
  orderTrend: number;
  vsLabel: string;
  chartData: Array<{ name: string; revenue: number }>;
  topProducts: Array<{ name: string; qty: number }>;
  recentOrders: Array<{
    id: string;
    total: number;
    waktu: string;
    tanggal: string;
    customer: string;
    metode: string;
    tipe: string;
  }>;
}