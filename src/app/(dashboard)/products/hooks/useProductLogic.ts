import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductUI } from "../types/product.types";
import { deactivateProduct } from "../actions"; 
import { toast } from "sonner";


type StatusType = "all" | "active" | "inactive";

export function useProductLogic(initialProducts: ProductUI[]) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<ProductUI[]>(initialProducts);
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductUI | null>(null);

  const statusFilter = useMemo(() => {
    const s = searchParams.get("status");
    if (s === "active" || s === "inactive") return s as StatusType;
    return "all" as StatusType;
  }, [searchParams]);

  const handleCreated = (newProduct: ProductUI) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleUpdated = (updated: ProductUI) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  };

  /**
   * Fungsi untuk menonaktifkan produk
   * Menerima ID string sesuai kebutuhan ProductList/ProductRow
   */
  const handleDeactivate = async (id: string) => {
    try {
      const result = await deactivateProduct(id);
      
      // Update state local agar UI langsung berubah
      setProducts((prev) =>
        prev.map((p) => 
          p.id === id ? { ...p, isActive: result.isActive } : p
        )
      );

      toast.success("Produk berhasil dinonaktifkan");
    } catch (err: unknown) {
      
      const errorMessage = err instanceof Error ? err.message : "Gagal menonaktifkan produk";
      toast.error(errorMessage);
      console.error(err);
    }
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (statusFilter === "active" && !p.isActive) return false;
        if (statusFilter === "inactive" && p.isActive) return false;
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products, statusFilter]);

  const handleStatusChange = (v: string) => {
    router.replace(`?status=${v}`, { scroll: false });
  };

  return {
    products: filteredProducts,
    statusFilter,
    open,
    setOpen,
    editingProduct,
    setEditingProduct,
    handleCreated,
    handleUpdated,
    handleStatusChange,
    handleDeactivate, 
  };
}