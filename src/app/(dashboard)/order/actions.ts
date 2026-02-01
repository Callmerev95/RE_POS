"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { OrderStatus, Prisma } from "@prisma/client";
import { type OrderItem, type LocalOrder } from "@/lib/db";

// Import Types dari folder products
import {
  ProductFormSchema,
  type ProductFormInput,
} from "../products/types/product.types";

/* =========================
   ORDER ACTIONS (CLOUD & SYNC)
========================= */

/**
 * Sinkronisasi order dari local ke cloud.
 * ✅ FIX: Update 'total' & 'status' agar sinkron saat penambahan menu [cite: 2026-01-12]
 * ✅ FIX: Smart Unstacking - Memisahkan item tambahan agar KDS tidak reset porsi lama [cite: 2026-01-12]
 * ✅ TYPE: Menggunakan LocalOrder, dilarang menggunakan 'any' [cite: 2026-01-10]
 */
export async function syncOrderToCloud(orderData: LocalOrder) {
  try {
    const {
      id,
      items,
      customerName,
      total,
      paid,
      paymentMethod,
      orderType,
      status,
      createdAt,
    } = orderData;

    // 1. Ambil data lama dari cloud untuk membandingkan jumlah item sebelumnya [cite: 2026-01-12]
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      select: { items: true },
    });

    let finalItems: OrderItem[] = [];

    if (existingOrder && existingOrder.items) {
      const dbItems = (existingOrder.items as unknown as OrderItem[]) || [];

      // Gunakan Map untuk mempercepat pencarian item di DB [cite: 2026-01-12]
      const dbItemsMap = new Map(dbItems.map((item) => [item.id, item]));

      items.forEach((newItem) => {
        const dbItem = dbItemsMap.get(newItem.id);

        if (dbItem && newItem.qty > dbItem.qty) {
          // Kasus: Jumlah bertambah (misal 1 jadi 2) [cite: 2026-01-12]
          // 1. Pertahankan porsi lama yang sudah selesai di database [cite: 2026-01-12]
          finalItems.push({
            ...dbItem,
            qty: dbItem.qty,
          });

          // 2. Tambahkan porsi baru sebagai baris terpisah [cite: 2026-01-12]
          finalItems.push({
            ...newItem,
            id: `${newItem.id}-extra-${Date.now()}`,
            qty: newItem.qty - dbItem.qty,
            isDone: false,
          });
        } else if (dbItem) {
          // Kasus: Qty tetap atau berkurang, ikuti status penyelesaian di DB [cite: 2026-01-12]
          finalItems.push({
            ...newItem,
            isDone: dbItem.isDone,
          });
        } else {
          // Menu baru yang benar-benar baru dipesan [cite: 2026-01-12]
          finalItems.push(newItem);
        }
      });
    } else {
      finalItems = items;
    }

    const syncedOrder = await prisma.order.upsert({
      where: { id },
      update: {
        total: Number(total),
        paid: Number(paid),
        // Kembalikan ke PENDING jika ada item baru agar KDS menampilkannya [cite: 2026-01-12]
        status: (status as OrderStatus) || OrderStatus.PENDING,
        items: finalItems as unknown as Prisma.InputJsonValue,
        paymentMethod,
      },
      create: {
        id,
        customerName: customerName || "Guest",
        total: Number(total),
        paid: Number(paid),
        paymentMethod,
        orderType,
        status: (status as OrderStatus) || OrderStatus.PENDING,
        items: finalItems as unknown as Prisma.InputJsonValue,
        createdAt: new Date(createdAt),
      },
    });

    // Jalankan revalidasi secara efisien [cite: 2026-01-12]
    (revalidateTag as (tag: string) => void)("reports");
    revalidatePath("/(dashboard)/history");
    revalidatePath("/(dashboard)/kitchen");
    revalidatePath("/(dashboard)/order");

    return { success: true, data: syncedOrder };
  } catch (error) {
    console.error("SYNC_ORDER_ERROR:", error);
    return { success: false, error: "Gagal sinkron ke cloud" };
  }
}

export async function syncBulkOrders(orders: LocalOrder[]) {
  try {
    const results = await Promise.all(
      orders.map((order) => syncOrderToCloud(order)),
    );

    const failed = results.filter((r) => !r.success);

    if (failed.length > 0) {
      return {
        success: false,
        error: `${failed.length} order gagal disinkronkan`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("SYNC_BULK_ERROR:", error);
    return { success: false, error: "Gagal sinkronisasi masal" };
  }
}

/**
 * Mengambil semua order dari cloud.
 */
export async function getOrdersFromCloud() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
    });

    const normalizedOrders = orders.map((order) => ({
      ...order,
      items: (order.items as unknown as OrderItem[]) || [],
    }));

    return { success: true, data: normalizedOrders };
  } catch (error) {
    console.error("GET_ORDERS_CLOUD_ERROR:", error);
    return { success: false, error: "Gagal mengambil data dari cloud" };
  }
}

/**
 * Mengambil order untuk Kitchen (Status: PENDING, PREPARING, READY).
 */
export async function getKitchenOrders() {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: {
          in: [OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.READY],
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const normalizedOrders = orders.map((order) => ({
      ...order,
      items: (order.items as unknown as OrderItem[]) || [],
    }));

    return { success: true, data: normalizedOrders };
  } catch (error) {
    console.error("GET_KITCHEN_ORDERS_ERROR:", error);
    return { success: false, error: "Gagal mengambil data kitchen" };
  }
}

/**
 * Update status utama sebuah Order (KDS).
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    revalidatePath("/(dashboard)/kitchen");
    (revalidateTag as (tag: string) => void)("reports");

    return {
      success: true,
      data: { ...order, items: (order.items as unknown as OrderItem[]) || [] },
    };
  } catch (error) {
    console.error("UPDATE_ORDER_STATUS_ERROR:", error);
    return { success: false, error: "Gagal update status order" };
  }
}

/**
 * Update status per-item di dalam field Json.
 */
export async function updateItemStatus(
  orderId: string,
  itemId: string | number,
  isDone: boolean,
) {
  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error("Order tidak ditemukan");

    const items = (order.items as unknown as OrderItem[]) || [];

    const updatedItems = items.map((item, index) => {
      const match =
        typeof itemId === "number" ? index === itemId : item.id === itemId;
      return match ? { ...item, isDone: Boolean(isDone) } : item;
    });

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        items: updatedItems as unknown as Prisma.InputJsonValue,
      },
    });

    revalidatePath("/(dashboard)/kitchen");

    return {
      success: true,
      data: { ...updatedOrder, items: updatedItems },
    };
  } catch (error) {
    console.error("UPDATE_ITEM_STATUS_ERROR:", error);
    return { success: false, error: "Gagal update status item" };
  }
}

/* =========================
   PRODUCT ACTIONS (MANAGEMENT)
========================= */

export type ProductWithCategory = Prisma.ProductGetPayload<{
  include: { category: true };
}>;

function generateSKU(name: string): string {
  const prefix = name
    .slice(0, 3)
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${timestamp}${random}`;
}

export async function getProducts(): Promise<ProductWithCategory[]> {
  try {
    return await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("GET_PRODUCTS_ERROR:", error);
    return [];
  }
}

export async function createProduct(
  rawInput: ProductFormInput,
): Promise<ProductWithCategory> {
  const validated = ProductFormSchema.parse(rawInput);
  const sku = generateSKU(validated.name);

  const product = await prisma.product.create({
    data: {
      name: validated.name,
      description: validated.description ?? null,
      price: validated.price,
      sku: sku,
      categoryId: validated.categoryId,
      categoryType: validated.categoryType,
      imageUrl: validated.imageUrl ?? null,
      isActive: validated.isActive ?? true,
    },
    include: { category: true },
  });

  revalidatePath("/(dashboard)/products");
  return product;
}

export async function updateProduct(
  rawInput: ProductFormInput,
): Promise<ProductWithCategory> {
  if (!rawInput.id) throw new Error("ID Produk diperlukan untuk update");
  const validated = ProductFormSchema.parse(rawInput);

  const product = await prisma.product.update({
    where: { id: validated.id },
    data: {
      name: validated.name,
      description: validated.description ?? null,
      price: validated.price,
      categoryId: validated.categoryId,
      categoryType: validated.categoryType,
      imageUrl: validated.imageUrl ?? null,
      isActive: validated.isActive,
    },
    include: { category: true },
  });

  revalidatePath("/(dashboard)/products");
  return product;
}

export async function deactivateProduct(
  id: string,
): Promise<ProductWithCategory> {
  const product = await prisma.product.update({
    where: { id },
    data: { isActive: false },
    include: { category: true },
  });

  revalidatePath("/(dashboard)/products");
  return product;
}
