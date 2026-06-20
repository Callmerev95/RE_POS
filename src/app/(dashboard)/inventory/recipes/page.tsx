import { prisma as db } from "@/lib/prisma";
import { Coffee, Utensils, ChefHat, Search } from "lucide-react";
import { ManageRecipeDialog } from "./ManageRecipeDialog";
import { PremiumHeader } from "@/components/shared/header/PremiumHeader";

// INTERFACES
interface RecipeItemUI {
  id: string;
  quantity: number;
  ingredient: {
    name: string;
    unitUsage: string;
    averagePrice: number;
  };
}

interface ProductWithRecipesUI {
  id: string;
  name: string;
  sku: string | null;
  categoryType: string;
  category: { name: string } | null;
  recipes: RecipeItemUI[];
}

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || "";

  // Ambil data dengan casting yang tepat di awal
  const products = (await db.product.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { sku: { contains: query, mode: 'insensitive' } }
      ]
    },
    include: {
      recipes: {
        include: {
          ingredient: true
        },
      },
      category: true
    },
    orderBy: { name: "asc" },
  })) as unknown as ProductWithRecipesUI[];

  const ingredients = await db.ingredient.findMany({
    orderBy: { name: "asc" }
  });

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-700 overflow-hidden pr-2">
      <div className="shrink-0">
        <PremiumHeader
          icon={ChefHat}
          title="RESEP MENU"
          subtitle={`MENGELOLA ${products.length} TOTAL MENU TERDAFTAR`}
        />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              // Hitung total HPP berdasarkan resep dan harga rata-rata bahan
              const totalHpp = product.recipes.reduce((acc, item) => {
                const price = item.ingredient.averagePrice || 0;
                return acc + (item.quantity * price);
              }, 0);

              const isFood = product.categoryType === "FOOD";

              return (
                <div key={product.id} className="group bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 hover:-translate-y-1 flex flex-col h-full relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-50 rounded-full group-hover:bg-cyan-50 transition-colors duration-500" />

                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div>
                      <h3 className="font-black text-slate-900 uppercase tracking-tight text-lg group-hover:text-cyan-600 transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-[10px] font-black text-cyan-600/60 uppercase tracking-widest mt-1">
                        {product.category?.name || 'REGULAR'}
                      </p>
                    </div>
                    <div className="p-3 text-slate-400 group-hover:text-cyan-600 transition-colors bg-white rounded-2xl shadow-sm border border-slate-50">
                      {isFood ? <Utensils size={20} /> : <Coffee size={20} />}
                    </div>
                  </div>

                  <div className="flex-1 space-y-2 mb-6">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4 text-center border-b border-slate-50 pb-2">Komposisi Bahan</p>
                    {product.recipes.length > 0 ? (
                      product.recipes.slice(0, 4).map((r) => (
                        <div key={r.id} className="flex justify-between items-center bg-slate-50/50 px-4 py-2 rounded-xl">
                          <span className="text-[10px] font-bold text-slate-600 uppercase truncate pr-2">{r.ingredient.name}</span>
                          <span className="text-[10px] font-black text-slate-900 tabular-nums shrink-0">
                            {r.quantity} <span className="text-[8px] text-slate-400 font-bold">{r.ingredient.unitUsage}</span>
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="py-4 px-4 rounded-2xl bg-amber-50/50 border border-dashed border-amber-200">
                        <p className="text-[10px] font-bold text-amber-600 uppercase text-center tracking-wider italic">Resep belum diatur</p>
                      </div>
                    )}
                    {product.recipes.length > 4 && (
                      <p className="text-[9px] text-center font-bold text-slate-400">+{product.recipes.length - 4} bahan lainnya</p>
                    )}
                  </div>

                  <div className="mb-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Estimasi HPP</span>
                    <span className="text-sm font-black text-cyan-600 tracking-tight">
                      Rp {Math.round(totalHpp).toLocaleString('id-ID')}
                    </span>
                  </div>

                  <ManageRecipeDialog
                    product={product as unknown as ProductWithRecipesUI}
                    ingredients={ingredients}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4 py-20">
            <Search size={48} className="opacity-10" />
            <p className="font-bold text-sm uppercase tracking-widest opacity-40">Menu tidak ditemukan</p>
          </div>
        )}
      </div>
    </div>
  );
}