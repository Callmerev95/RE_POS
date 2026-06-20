"use server";

import { prisma } from "@/lib/prisma"; 

export async function getProductSearch() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
      },
    });
    return products;
  } catch (error) {
    console.error("Gagal ambil produk:", error);
    return [];
  }
}