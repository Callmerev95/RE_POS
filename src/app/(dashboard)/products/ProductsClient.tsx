"use client";

import { ProductList } from "./components/ProductList";
import { ProductHeader } from "./components/ProductHeader";
import { CreateProductDialog } from "./components/CreateProductDialog";
import { OrderFooter } from "@/app/(dashboard)/order/components/OrderFooter";
import { CreditNote } from "@/app/(dashboard)/order/components/CreditNote";
import { ProductUI } from "./types/product.types";
import { useProductLogic } from "./hooks/useProductLogic";

type CategoryOption = { id: string; name: string };

interface Props {
  initialProducts: ProductUI[];
  initialCategories?: CategoryOption[];
}

export function ProductsClient({ initialProducts, initialCategories }: Props) {
  const {
    products,
    statusFilter,
    open,
    setOpen,
    editingProduct,
    setEditingProduct,
    handleCreated,
    handleUpdated,
    handleStatusChange,
    handleDeactivate, 
  } = useProductLogic(initialProducts);

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] gap-4 animate-in fade-in duration-700 overflow-hidden pr-2">

      <div className="shrink-0">
        <ProductHeader
          total={products.length}
          statusFilter={statusFilter}
          onStatusChange={handleStatusChange}
          onAdd={() => {
            setEditingProduct(null);
            setOpen(true);
          }}
        />
      </div>

      <CreateProductDialog
        open={open}
        onClose={() => {
          setOpen(false);
          setEditingProduct(null);
        }}
        onCreated={handleCreated}
        onUpdated={handleUpdated}
        initialCategories={initialCategories}
        product={editingProduct}
      />

      <div className="flex-1 min-h-0 flex flex-col bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden transition-all duration-500 hover:border-cyan-100">
        <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#fafbfc] pb-12">
        
          <ProductList
            products={products}
            onEdit={(p) => {
              setEditingProduct(p);
              setOpen(true);
            }}
        
            onDeactivate={(p) => handleDeactivate(p.id)}
          />
        </div>

        <OrderFooter count={products.length} label="Produk Terdaftar" />
      </div>

      <CreditNote />
    </div>
  );
}