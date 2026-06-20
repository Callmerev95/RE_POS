"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Receipt, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { restockIngredient } from "../ingredients/actions";
import { IngredientUI } from "../ingredients/types/ingredient.types";

interface RestockFormProps {
  ingredients: IngredientUI[];
}

export function RestockForm({ ingredients }: RestockFormProps) {
  const [loading, setLoading] = useState(false);
  const [qty, setQty] = useState<string>("");
  const [total, setTotal] = useState<string>("");
  const router = useRouter();

  // Hitung estimasi harga per unit 
  const pricePerUnit = useMemo(() => {
    const q = parseFloat(qty);
    const t = parseFloat(total);
    if (q > 0 && t > 0) return t / q;
    return 0;
  }, [qty, total]);

  async function handleSubmit(formData: FormData) {
    setLoading(true);

    const ingredientId = formData.get("ingredientId") as string;
    const currentQty = parseFloat(qty);
    const currentTotal = parseInt(total);

    if (!ingredientId || currentQty <= 0 || currentTotal <= 0) {
      toast.error("Mohon lengkapi data dengan benar");
      setLoading(false);
      return;
    }

    const unitPrice = currentTotal / currentQty;

    const data = {
      ingredientId,
      quantity: currentQty,
      purchasePrice: unitPrice,
      note: formData.get("note") as string,
    };

    const result = await restockIngredient(data);
    setLoading(false);

    if (result.success) {
      toast.success("Stok & HPP berhasil diperbarui!");
      router.push("/inventory/ingredients");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-8">
      <div className="space-y-3">
        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Pilih Bahan Baku</Label>
        <Select name="ingredientId" required>
          <SelectTrigger className="rounded-2xl h-14 bg-slate-50 border-none font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner">
            <SelectValue placeholder="Cari bahan..." />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-none shadow-2xl">
            {ingredients.map((item) => (
              <SelectItem key={item.id} value={item.id} className="font-bold py-3 uppercase text-[10px]">
                {item.name} <span className="ml-2 text-slate-400 italic font-medium">(Sisa: {item.stock} {item.unitUsage})</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Jumlah Beli</Label>
          <div className="relative">
            <Input 
              name="quantity" 
              type="number" 
              step="0.01" 
              placeholder="0.00" 
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              required 
              className="rounded-2xl h-14 bg-slate-50 border-none font-black text-slate-700 shadow-inner focus:bg-white transition-all pl-6" 
            />
          </div>
        </div>
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Total Nota (Rp)</Label>
          <div className="relative">
            <Input 
              name="totalPrice" 
              type="number"
              placeholder="0" 
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              required 
              className="rounded-2xl h-14 bg-slate-50 border-none font-black text-emerald-600 shadow-inner focus:bg-white transition-all pl-6" 
            />
          </div>
        </div>
      </div>

      {/* Info Panel: Menampilkan estimasi HPP baru */}
      {pricePerUnit > 0 && (
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-5 flex items-center justify-between animate-in zoom-in duration-300">
          <div className="flex items-center gap-4">
            <div className="bg-white p-2.5 rounded-2xl shadow-sm text-emerald-600">
              <Calculator size={18} />
            </div>
            <div>
              <p className="text-[8px] font-black text-emerald-600/60 uppercase tracking-widest leading-none">Harga Satuan Baru</p>
              <p className="text-sm font-black text-emerald-700 mt-1 italic">Rp {pricePerUnit.toLocaleString('id-ID', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
          <Receipt size={20} className="text-emerald-200" />
        </div>
      )}

      <div className="space-y-3">
        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Catatan</Label>
        <Input name="note" placeholder="Contoh: Supplier ABC / Nota #123" className="rounded-2xl h-14 bg-slate-50 border-none font-bold shadow-inner focus:bg-white transition-all pl-6" />
      </div>

      <Button 
        type="submit" 
        disabled={loading} 
        className="w-full bg-slate-900 hover:bg-emerald-600 h-14 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-xl shadow-slate-200 transition-all active:scale-95 group"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <span className="flex items-center gap-2">
            Update Stok & HPP <CheckCircle2 className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </span>
        )}
      </Button>
    </form>
  );
}