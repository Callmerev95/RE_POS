"use server"

import { prisma as db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Fungsi untuk menambah bahan ke dalam resep produk
export async function addRecipeItem(data: {
  productId: string;
  ingredientId: string;
  quantity: number;
}) {
  try {
    await db.recipe.create({
      data: {
        productId: data.productId,
        ingredientId: data.ingredientId,
        quantity: data.quantity,
      },
    });
    revalidatePath("/inventory/recipes");
    return { success: true };
  } catch (error) {
    console.error("ADD_RECIPE_ERROR:", error);
    return { success: false, error: "Gagal menambah resep" };
  }
}

// Fungsi untuk memperbarui jumlah bahan dalam resep
export async function updateRecipeItem(id: string, quantity: number) {
  try {
    await db.recipe.update({
      where: { id },
      data: { quantity },
    });
    revalidatePath("/inventory/recipes");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal memperbarui jumlah bahan" };
  }
}

// Fungsi untuk menghapus item resep
export async function deleteRecipeItem(id: string) {
  try {
    await db.recipe.delete({ where: { id } });
    revalidatePath("/inventory/recipes");
    return { success: true };
  } catch  {
    return { success: false, error: "Gagal menghapus item resep" };
  }
}