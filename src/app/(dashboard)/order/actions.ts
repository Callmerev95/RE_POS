"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { OrderStatus, Prisma } from "@prisma/client";
import { type OrderItem, type LocalOrder } from "@/lib/db";
import {
  ProductFormSchema,
  type ProductFormInput,
} from "../products/types/product.types";

export type ProductWithCategory = Prisma.ProductGetPayload<{
  include: { category: true };
}>;

export async function getOrdersFromCloud(filters?: {
  startDate?: string | Date;
  endDate?: string | Date;
  method?: string;
  type?: string;
  limit?: number;
}) {
  try {
    const where: Prisma.OrderWhereInput = {};

    if (filters?.startDate && filters?.endDate) {
      const startDay =
        typeof filters.startDate === "string"
          ? filters.startDate
          : filters.startDate.toISOString().split("T")[0];
      const endDay =
        typeof filters.endDate === "string"
          ? filters.endDate
          : filters.endDate.toISOString().split("T")[0];

      // Fix: Menambahkan milidetik .000 dan .999 untuk akurasi maksimal di Prisma
      const gte = new Date(`${startDay}T00:00:00.000+07:00`);
      const lte = new Date(`${endDay}T23:59:59.999+07:00`);

      where.createdAt = {
        gte: gte,
        lte: lte,
      };
    }

    if (filters?.method && filters.method !== "all") {
      where.paymentMethod = filters.method;
    }

    if (filters?.type && filters.type !== "all") {
      where.orderType = filters.type;
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: filters?.limit || 50,
    });

    return {
      success: true,
      data: orders.map((o) => ({
        ...o,
        items: (o.items as unknown as OrderItem[]) || [],
      })),
    };
  } catch (error) {
    console.error("GET_ORDERS_CLOUD_ERROR:", error);
    return { success: false, error: "Gagal mengambil data dari cloud" };
  }
}

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
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      select: { items: true },
    });
    let finalItems: OrderItem[] = [];

    if (existingOrder && existingOrder.items) {
      const dbItems = (existingOrder.items as unknown as OrderItem[]) || [];
      const dbItemsMap = new Map(dbItems.map((item) => [item.id, item]));
      items.forEach((newItem) => {
        const dbItem = dbItemsMap.get(newItem.id);
        if (dbItem && newItem.qty > dbItem.qty) {
          finalItems.push({ ...dbItem, qty: dbItem.qty });
          finalItems.push({
            ...newItem,
            id: `${newItem.id}-extra-${Date.now()}`,
            qty: newItem.qty - dbItem.qty,
            isDone: false,
          });
        } else if (dbItem) {
          finalItems.push({ ...newItem, isDone: dbItem.isDone });
        } else {
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
    if (failed.length > 0)
      return { success: false, error: `${failed.length} order gagal` };
    return { success: true };
  } catch (error) {
    console.error("SYNC_BULK_ERROR:", error);
    return { success: false, error: "Gagal sinkronisasi masal" };
  }
}

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
    return {
      success: true,
      data: orders.map((o) => ({
        ...o,
        items: (o.items as unknown as OrderItem[]) || [],
      })),
    };
  } catch (error) {
    console.error("GET_KITCHEN_ORDERS_ERROR:", error);
    return { success: false, error: "Gagal mengambil data kitchen" };
  }
}

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
      const isIndexMatch = typeof itemId === "number" && index === itemId;
      const isIdMatch = item.id === itemId || String(index) === String(itemId);
      return isIndexMatch || isIdMatch
        ? { ...item, isDone: Boolean(isDone) }
        : item;
    });
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { items: updatedItems as unknown as Prisma.InputJsonValue },
    });
    revalidatePath("/(dashboard)/kitchen");
    return { success: true, data: { ...updatedOrder, items: updatedItems } };
  } catch (error) {
    console.error("UPDATE_ITEM_STATUS_ERROR:", error);
    return { success: false, error: "Gagal update status item" };
  }
}

function generateSKU(name: string): string {
  const prefix = name
    .slice(0, 3)
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
  return `${prefix}-${Date.now().toString().slice(-4)}${Math.floor(100 + Math.random() * 900)}`;
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
