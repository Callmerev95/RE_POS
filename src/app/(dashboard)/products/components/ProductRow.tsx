"use client";

import { useState } from "react";
import { motion, Variants } from "framer-motion"; 
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { ProductUI } from "../types/product.types";
import { CATEGORY_COLOR_STYLES, toCategoryColor } from "@/lib/category-colors";
import { Button } from "@/components/ui/button";
import { Pencil, ImageIcon, MoreHorizontal, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
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
import { deactivateProduct } from "@/app/(dashboard)/products/actions";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

interface ProductRowProps {
  product: ProductUI;
  onEdit?: (p: ProductUI) => void;
  onDeactivate?: (p: ProductUI) => void;
}

export function ProductRow({ product, onEdit, onDeactivate }: ProductRowProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const colorKey = toCategoryColor(product.category.color);
  const styles = CATEGORY_COLOR_STYLES[colorKey];

  return (
    <motion.tr
      variants={itemVariants}
      layout
      whileHover="hover"
      initial="show" 
      className={cn(
        "group transition-all duration-500 relative border-b border-slate-100/50 bg-white",
        "hover:z-10 hover:bg-white hover:shadow-[0_0_25px_rgba(34,211,238,0.15),0_10px_15px_-3px_rgba(0,0,0,0.05)]"
      )}
    >
      {/* 1. INFO PRODUK */}
      <td className="pl-8 pr-6 py-5 relative">
        <div className="absolute inset-y-0 left-0 w-1 bg-cyan-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-center" />

        <div className="flex gap-5 items-center">
          <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-slate-100 shadow-sm bg-slate-50 flex items-center justify-center group-hover:border-cyan-100 transition-colors">
            <AspectRatio ratio={1}>
              {product.imageUrl ? (
                <>
                  {!isLoaded && <Skeleton className="absolute inset-0" />}
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className={cn(
                      "object-cover transition-opacity duration-500",
                      isLoaded ? "opacity-100" : "opacity-0"
                    )}
                    onLoadingComplete={() => setIsLoaded(true)}
                  />
                </>
              ) : (
                <div className="flex items-center justify-center bg-slate-50 text-slate-300 h-full">
                  <ImageIcon size={18} />
                </div>
              )}
            </AspectRatio>
          </div>

          <div className="flex flex-col">
            <p className="font-black text-slate-700 text-sm uppercase tracking-tight leading-tight group-hover:text-cyan-600 transition-colors">
              {product.name}
            </p>
            <p className="text-[10px] text-slate-400 font-bold line-clamp-1 max-w-45 mt-0.5 uppercase tracking-tighter">
              {product.description || "Tidak ada deskripsi"}
            </p>
          </div>
        </div>
      </td>

      {/* 2. SKU */}
      <td className="px-6 py-5">
        <span className="text-[10px] font-black font-mono text-slate-500 bg-slate-200/50 px-2.5 py-1 rounded-lg border border-slate-300/30 uppercase group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-colors">
          {product.sku}
        </span>
      </td>

      {/* 3. KATEGORI */}
      <td className="px-6 py-5">
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full shrink-0", styles.dot)} />
          <Badge className={cn(styles.badge, "rounded-xl border-none font-black text-[9px] py-0.5 px-3 uppercase tracking-wider shadow-sm whitespace-nowrap")}>
            {product.category.name}
          </Badge>
        </div>
      </td>

      {/* 4. HARGA */}
      <td className="px-6 py-5 text-slate-900 font-black text-sm tracking-tight group-hover:text-cyan-700 transition-colors">
        Rp {product.price.toLocaleString("id-ID")}
      </td>

      {/* 5. STATUS PRODUK */}
      <td className="px-6 py-5">
        <Badge className={cn(
          "rounded-xl font-black text-[9px] uppercase tracking-[0.15em] border-none px-3 py-1 shadow-sm transition-all duration-300",
          product.isActive
            ? "bg-emerald-100 text-emerald-700 shadow-emerald-100/30 group-hover:bg-emerald-500 group-hover:text-white"
            : "bg-slate-100 text-slate-400 shadow-slate-100"
        )}>
          {product.isActive ? "Tersedia" : "Nonaktif"}
        </Badge>
      </td>

      {/* 6. AKSI */}
      <td className="px-6 py-5 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 rounded-xl hover:bg-white hover:shadow-md text-slate-400 hover:text-cyan-500 transition-all active:scale-90"
            >
              <MoreHorizontal size={18} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 rounded-2xl border-slate-100 shadow-2xl p-2 bg-white z-50"
          >
            <DropdownMenuItem
              onClick={() => onEdit?.(product)}
              className="rounded-xl font-bold text-xs text-slate-600 focus:bg-cyan-50 focus:text-cyan-600 py-2.5 gap-2 cursor-pointer"
            >
              <Pencil size={14} /> Edit Produk
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setIsDeleteOpen(true)}
              className="rounded-xl font-bold text-xs text-red-500 focus:bg-red-50 focus:text-red-600 py-2.5 gap-2 cursor-pointer"
            >
              <Trash2 size={14} /> Nonaktifkan
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl p-8 bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-black text-slate-800 uppercase tracking-tight">Nonaktifkan Produk</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400 font-medium">
                Produk <span className="text-slate-900 font-bold">{product.name}</span> tidak akan muncul di POS, tetapi data tetap tersimpan dalam sistem.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-6 gap-3">
              <AlertDialogCancel className="rounded-2xl border-slate-100 bg-slate-50 text-slate-500 font-black text-[11px] uppercase h-12 px-6 hover:bg-slate-100">
                Batal
              </AlertDialogCancel>
              <AlertDialogAction
                className="rounded-2xl bg-red-500 text-white font-black text-[11px] uppercase h-12 px-6 shadow-xl shadow-red-200 hover:bg-red-600 border-none"
                onClick={async () => {
                  try {
                    const result = await deactivateProduct(product.id);
                    // Sesuaikan hasil balik ke ProductUI
                    const updatedProduct: ProductUI = {
                      ...product,
                      isActive: result.isActive
                    };
                    onDeactivate?.(updatedProduct);
                    toast.success("Produk berhasil dinonaktifkan");
                  } catch {
                    toast.error("Gagal menonaktifkan produk");
                  }
                }}
              >
                Nonaktifkan
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </td>
    </motion.tr>
  );
}