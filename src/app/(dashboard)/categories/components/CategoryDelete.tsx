"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { deleteCategory } from "@/app/(dashboard)/categories/actions";
import { toast } from "sonner";
import { useState } from "react";

interface CategoryDeleteProps {
  id: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: (id: string) => void;
}

export function CategoryDelete({
  id,
  open,
  onClose,
  onSuccess,
}: CategoryDeleteProps) {
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    try {
      setLoading(true);
      await deleteCategory(id);
      toast.success("Kategori berhasil dihapus");
      onSuccess?.(id);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menghapus kategori";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(val) => !val && onClose()}>
      <AlertDialogContent className="rounded-[2.5rem] border-none p-8 bg-white shadow-2xl z-110">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-black text-slate-800 uppercase tracking-tight">
            Hapus Kategori?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm font-medium text-slate-500 leading-relaxed">
            Apakah Anda yakin? Tindakan ini tidak dapat dibatalkan dan mungkin mempengaruhi produk yang terhubung dengan kategori ini.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-3 mt-6">
          <AlertDialogCancel
            disabled={loading}
            className="rounded-2xl font-black text-slate-400 border-none bg-slate-50 hover:bg-slate-100 uppercase text-[11px] h-12 px-6"
          >
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault(); 
              onDelete();
            }}
            disabled={loading}
            className="rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black uppercase text-[11px] h-12 px-8 shadow-xl shadow-red-100 border-none transition-all active:scale-95"
          >
            {loading ? "Menghapus..." : "Ya, Hapus Kategori"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}