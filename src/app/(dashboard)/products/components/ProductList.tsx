"use client";

import { ProductRow } from "./ProductRow";
import { ProductUI } from "../types/product.types";

interface ProductListProps {
  products: ProductUI[]; 
  onEdit?: (p: ProductUI) => void;
  onDeactivate?: (p: ProductUI) => void;
  emptyMessage?: string;
}

export function ProductList({
  products,
  onEdit,
  onDeactivate,
  emptyMessage,
}: ProductListProps) {
  
  if (products.length === 0) {
    return (
      <div className="p-20 text-center text-sm font-bold text-slate-400 uppercase tracking-widest">
        {emptyMessage ?? "Tidak ada produk ditemukan"}
      </div>
    );
  }

  return (
    <div className="relative min-w-full isolate">
      <table className="w-full text-sm border-separate border-spacing-0">
        <thead>
          <tr className="relative z-10">
            <th className="sticky top-0 z-20 bg-[#fafbfc] px-6 py-4 text-left font-black text-slate-400 uppercase tracking-widest text-[9px] border-b border-slate-100">
              Info Produk
            </th>
            <th className="sticky top-0 z-20 bg-[#fafbfc] px-6 py-4 text-left font-black text-slate-400 uppercase tracking-widest text-[9px] border-b border-slate-100">
              SKU
            </th>
            <th className="sticky top-0 z-20 bg-[#fafbfc] px-6 py-4 text-left font-black text-slate-400 uppercase tracking-widest text-[9px] border-b border-slate-100">
              Kategori
            </th>
            <th className="sticky top-0 z-20 bg-[#fafbfc] px-6 py-4 text-left font-black text-slate-400 uppercase tracking-widest text-[9px] border-b border-slate-100">
              Harga
            </th>
            <th className="sticky top-0 z-20 bg-[#fafbfc] px-6 py-4 text-left font-black text-slate-400 uppercase tracking-widest text-[9px] border-b border-slate-100">
              Status
            </th>
            <th className="sticky top-0 z-20 bg-[#fafbfc] px-6 py-4 text-right font-black text-slate-400 uppercase tracking-widest text-[9px] border-b border-slate-100">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50/50">
          {products.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              onEdit={onEdit}
              onDeactivate={onDeactivate}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}