import { prisma } from "@/lib/prisma";
import { ProductPanel } from "@/components/shared/pos/product/ProductPanel";
import type { ProductUI as Product } from "@/app/(dashboard)/products/types/product.types";
import { toCategoryColor } from "@/lib/category-colors";
import { CartPanel } from "@/components/shared/pos/cart/CartPanel";
import { PosInitializer } from "./PosInitializer";

export default async function POSPage() {
  // Fetch products aktif dari database beserta kategori-nya
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: { name: "asc" },
  });

  // Map products ke format yang dibutuhkan UI, termasuk konversi warna kategori
  const uiProducts: Product[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description ?? "",
    sku: p.sku ?? "-",
    price: p.price,
    isActive: p.isActive,
    imageUrl: p.imageUrl ?? undefined,
    categoryType: p.categoryType,
    category: {
      id: p.category.id,
      name: p.category.name,
      color: toCategoryColor(p.category.color),
    },
  }));

  return (

    <div className="h-[calc(100vh-140px)] w-full overflow-hidden animate-in fade-in duration-700 bg-slate-50/30">
      <PosInitializer />

      <div className="h-full w-full p-2 sm:p-4 flex flex-col">

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 h-full min-h-0">

          <div className="md:col-span-7 lg:col-span-8 h-full min-h-0 flex flex-col">
            <ProductPanel products={uiProducts} />
          </div>

          <div className="hidden md:flex md:col-span-5 lg:col-span-4 h-full min-h-0 flex-col">
            <CartPanel />
          </div>

        </div>
      </div>
    </div>
  );
}