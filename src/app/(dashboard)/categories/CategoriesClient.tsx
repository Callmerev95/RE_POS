"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CategoryUI } from "./types/category.types";
import { CategoryTable } from "./components/CategoryTable";
import { CategoryDialog } from "./components/CategoryDialog";
import { PremiumHeader } from "@/components/shared/header/PremiumHeader";
import { Tag, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  initialData: CategoryUI[];
}

export function CategoriesClient({ initialData }: Props) {
  const router = useRouter();

 
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryUI | null>(null);
  const handleSuccess = () => {
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      {/* HEADER UTAMA */}
      <PremiumHeader
        icon={Tag}
        title="KATEGORI MENU"
        subtitle="MANAJEMEN PENGELOMPOKAN MENU DAN WARNA IDENTITAS"
        actions={
          <Button
            onClick={() => {
              setEditingCategory(null);
              setIsDialogOpen(true);
            }}
            className="rounded-2xl bg-slate-900 text-white text-[11px] font-black uppercase h-11 px-6 shadow-xl shadow-slate-200 transition-all active:scale-95 gap-2 hover:bg-cyan-600"
          >
            <Plus size={16} />
            Tambah Kategori
          </Button>
        }
      />

      {/* TABEL DATA */}
      <CategoryTable
        data={initialData}
        onEdit={(cat) => {
          setEditingCategory(cat);
          setIsDialogOpen(true);
        }}
        onDeleteSuccess={() => router.refresh()}
      />

      {/* MODAL FORM (CREATE/EDIT) */}
      <CategoryDialog
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingCategory(null);
        }}
        editingCategory={editingCategory}
        onSuccess={handleSuccess}
      />
    </div>
  );
}