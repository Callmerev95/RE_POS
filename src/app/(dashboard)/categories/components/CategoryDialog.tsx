"use client";

import { useState, useEffect } from "react";
import { type CategoryColor, CATEGORY_COLOR_STYLES } from "@/lib/category-colors";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { createCategory, updateCategory } from "@/app/(dashboard)/categories/actions";
import { toast } from "sonner";
import { Tag, Check } from "lucide-react";
import { motion } from "framer-motion"; 
import { CategoryUI } from "../types/category.types";

interface CategoryDialogProps {
  open: boolean;
  onClose: () => void;
  editingCategory: CategoryUI | null;
  onSuccess?: () => void;
}

export function CategoryDialog({
  open,
  onClose,
  editingCategory,
  onSuccess
}: CategoryDialogProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState<CategoryColor>("slate");
  const [loading, setLoading] = useState(false);

  // Sync state saat modal dibuka atau kategori yang diedit berganti
  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
      setColor(editingCategory.color);
    } else {
      setName("");
      setColor("slate");
    }
  }, [editingCategory, open]);

  const COLORS = Object.keys(CATEGORY_COLOR_STYLES) as CategoryColor[];

  async function onSubmit() {
    if (!name.trim()) return toast.error("Nama kategori wajib diisi");

    try {
      setLoading(true);
      if (editingCategory) {
        await updateCategory(editingCategory.id, name.trim(), color);
        toast.success("Kategori berhasil diperbarui");
      } else {
        await createCategory(name.trim(), color);
        toast.success("Kategori berhasil ditambahkan");
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="rounded-[2.5rem] border-none p-8 max-w-md shadow-2xl bg-white overflow-hidden z-100">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
            <div className="bg-black p-2.5 rounded-2xl text-white shadow-lg shadow-slate-200">
              <Tag size={20} />
            </div>
            {editingCategory ? "Edit Kategori" : "Kategori Baru"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Nama Kategori
            </Label>
            <input
              placeholder="Contoh: Espresso Based, Makanan Utama..."
              className="w-full flex h-12 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-2 text-sm ring-offset-white focus:bg-white transition-all font-bold text-slate-700 placeholder:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/20"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Pilih Warna Identitas
            </Label>
            <div className="grid grid-cols-6 gap-3 p-4 bg-slate-50/50 rounded-3xl border border-slate-100">
              {COLORS.map((c) => (
                <motion.button
                  key={c}
                  type="button"
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setColor(c)}
                  className={cn(
                    "relative h-9 w-9 rounded-full flex items-center justify-center transition-all",
                    CATEGORY_COLOR_STYLES[c].dot,
                    color === c ? "ring-4 ring-white shadow-xl scale-110 z-10" : "opacity-40 hover:opacity-100 shadow-sm"
                  )}
                >
                  {color === c && <Check size={16} className="text-white drop-shadow-md" />}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-50">
            <Button
              variant="ghost"
              onClick={onClose}
              className="rounded-xl font-bold text-slate-400 hover:text-slate-600 h-11 px-6 transition-colors"
            >
              Batal
            </Button>
            <Button
              onClick={onSubmit}
              disabled={loading}
              className="rounded-2xl bg-slate-900 hover:bg-cyan-600 text-white font-black uppercase text-[11px] px-10 h-11 shadow-xl shadow-slate-200 transition-all active:scale-95"
            >
              {loading ? "Memproses..." : editingCategory ? "Simpan Perubahan" : "Buat Kategori"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}