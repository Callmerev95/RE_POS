"use client";

import { Button } from "@/components/ui/button";
import { Plus, Filter, Coffee, PackageSearch } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { PremiumHeader } from "@/components/shared/header/PremiumHeader";


type ProductHeaderProps = {
  total: number;
  onAdd?: () => void;
  statusFilter?: "all" | "active" | "inactive";
  onStatusChange?: (v: string) => void; 
};

export function ProductHeader({
  total,
  onAdd,
  statusFilter = "all",
  onStatusChange,
}: ProductHeaderProps) {
  return (
    <div className="flex flex-col gap-2">
      <PremiumHeader
        icon={Coffee}
        title="DAFTAR PRODUK"
        subtitle="PENGATURAN MENU DAN MANAJEMEN STOK INVENTORI"
        actions={
          <Button
            onClick={onAdd}
            className="rounded-2xl bg-slate-900 text-white text-[11px] font-black uppercase h-11 px-6 shadow-xl shadow-slate-200 transition-transform active:scale-95 gap-2"
          >
            <Plus size={16} />
            Tambah Produk
          </Button>
        }
      />

    
      <div className="bg-white/60 backdrop-blur-md p-2 rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/30 flex items-center justify-between px-6 h-14">
        <div className="flex items-center gap-3">
          <div className="bg-cyan-50 p-2 rounded-xl">
            <PackageSearch size={16} className="text-cyan-600" />
          </div>
          <div className="flex flex-col">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] leading-none">
              Status Inventori
            </p>
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-tight mt-0.5">
              {total} Item Menu Terdaftar
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="rounded-xl border-slate-100 bg-white text-slate-600 text-[10px] font-black uppercase hover:bg-slate-50 h-9 px-4 shadow-sm border-2 gap-2 transition-all"
              >
                <Filter size={12} className="text-slate-400" />
                Filter: <span className="text-cyan-600">{statusFilter.toUpperCase()}</span>
              </Button>
            </DropdownMenuTrigger>


            <DropdownMenuContent
              align="end"
              className="w-56 rounded-2xl border-slate-100 shadow-2xl p-2 bg-white z-50"
            >
              <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">
                Pilih Status
              </DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={statusFilter}
                onValueChange={(v) => onStatusChange?.(v)}
              >
                <DropdownMenuRadioItem 
                  value="all" 
                  className="text-[11px] font-bold py-2.5 rounded-xl cursor-pointer focus:bg-cyan-50 focus:text-cyan-600 transition-colors"
                >
                  Semua Produk
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem 
                  value="active" 
                  className="text-[11px] font-bold py-2.5 rounded-xl cursor-pointer focus:bg-cyan-50 focus:text-cyan-600 transition-colors"
                >
                  Hanya Aktif
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem 
                  value="inactive" 
                  className="text-[11px] font-bold py-2.5 rounded-xl cursor-pointer focus:bg-cyan-50 focus:text-cyan-600 transition-colors"
                >
                  Nonaktif
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
