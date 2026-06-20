

export interface ReportData {
  foodRevenue: number;
  drinkRevenue: number;
  totalRevenue: number;
  foodQty: number;
  drinkQty: number;
  count: number;
  cashTotal: number;
  qrisTotal: number;
  bcaTotal: number;
  danaTotal: number;
  percentages: {
    cash: string;
    qris: string;
    bca: string;
    dana: string;
  };
}

export interface ChartDataPoint {
  name: string;
  Makanan: number;
  Minuman: number;
}

// Tambahkan tipe untuk item pesanan
export interface OrderItem {
  price: number;
  qty: number;
  categoryType: string; 
}
