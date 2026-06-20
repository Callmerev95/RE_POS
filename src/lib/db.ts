import { z } from "zod";
import { type HoldOrder } from "@/store/holdOrder.types";

// 1. Define Zod Schemas
export const OrderItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  qty: z.number(),
  price: z.number(),
  categoryType: z.enum(["FOOD", "DRINK"]),
  notes: z.string().optional().nullable(),
  isDone: z.boolean().default(false),
});

export const LocalOrderSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  total: z.number(),
  paid: z.number(),
  paymentMethod: z.enum(["CASH", "DANA", "BCA", "QRIS"]),
  customerName: z.string().optional().nullable(),
  orderType: z.enum(["Dine In", "Take Away"]),
  items: z.array(OrderItemSchema),
  isSynced: z.boolean().optional().default(false),

  status: z
    .enum(["PENDING", "PREPARING", "READY", "COMPLETED", "CANCELLED"])
    .optional()
    .default("PENDING"),
});

// 2. Export Type
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type LocalOrder = z.infer<typeof LocalOrderSchema>;

// Konstanta untuk IndexedDB
const DB_NAME = "coffee-pos-db";
const DB_VERSION = 2;
const STORE_ORDERS = "orders";
const STORE_HOLD_ORDERS = "hold_orders";

// Fungsi internal untuk membuka koneksi
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_ORDERS)) {
        const store = db.createObjectStore(STORE_ORDERS, { keyPath: "id" });
        store.createIndex("createdAt", "createdAt");
        store.createIndex("isSynced", "isSynced");
      }
      if (!db.objectStoreNames.contains(STORE_HOLD_ORDERS)) {
        db.createObjectStore(STORE_HOLD_ORDERS, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// --- ORDERS SECTION ---
export async function updateOrderSyncStatus(
  id: string,
  isSynced: boolean,
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ORDERS, "readwrite");
    const store = tx.objectStore(STORE_ORDERS);
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const data = getRequest.result;
      if (data) {
        data.isSynced = isSynced;
        store.put(data);
      }
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Fungsi updateOrderStatusLocal (Untuk update status order di KDS)
export async function updateOrderStatusLocal(
  id: string,
  status: LocalOrder["status"]
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ORDERS, "readwrite");
    const store = tx.objectStore(STORE_ORDERS);
    const req = store.get(id);
    req.onsuccess = () => {
      const data = req.result;
      if (data) {
        data.status = status;
        store.put(data);
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Fungsi updateItemStatusLocal (Untuk centang item di KDS)
export async function updateItemStatusLocal(
  orderId: string,
  itemIdx: number,
  isDone: boolean
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ORDERS, "readwrite");
    const store = tx.objectStore(STORE_ORDERS);
    const req = store.get(orderId);
    req.onsuccess = () => {
      const data = req.result as LocalOrder;
      if (data && data.items[itemIdx]) {
        data.items[itemIdx].isDone = isDone;
        store.put(data);
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function saveOrder(order: LocalOrder) {
  const db = await openDB();
  const tx = db.transaction(STORE_ORDERS, "readwrite");
  const validatedOrder = LocalOrderSchema.parse(order);
  tx.objectStore(STORE_ORDERS).put(validatedOrder);
  return new Promise((res) => {
    tx.oncomplete = () => res(true);
  });
}

export async function getAllOrders(): Promise<LocalOrder[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ORDERS, "readonly");
    const store = tx.objectStore(STORE_ORDERS);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getOrderById(
  id: string,
): Promise<LocalOrder | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ORDERS, "readonly");
    const store = tx.objectStore(STORE_ORDERS);
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteOrder(id: string) {
  const db = await openDB();
  const tx = db.transaction(STORE_ORDERS, "readwrite");
  tx.objectStore(STORE_ORDERS).delete(id);
  return new Promise((res) => {
    tx.oncomplete = () => res(true);
  });
}

// --- HOLD ORDERS SECTION ---

export async function saveHoldOrderLocal(order: HoldOrder) {
  const db = await openDB();
  const tx = db.transaction(STORE_HOLD_ORDERS, "readwrite");
  tx.objectStore(STORE_HOLD_ORDERS).put(order);
  return new Promise((res) => {
    tx.oncomplete = () => res(true);
  });
}

export async function getAllHoldOrdersLocal(): Promise<HoldOrder[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_HOLD_ORDERS, "readonly");
    const store = tx.objectStore(STORE_HOLD_ORDERS);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteHoldOrderLocal(id: string) {
  const db = await openDB();
  const tx = db.transaction(STORE_HOLD_ORDERS, "readwrite");
  tx.objectStore(STORE_HOLD_ORDERS).delete(id);
  return new Promise((res) => {
    tx.oncomplete = () => res(true);
  });
}

// --- CLOUD SYNC SECTION ---

export async function upsertOrdersFromCloud(cloudOrders: unknown[]) {
  const db = await openDB();
  const tx = db.transaction(STORE_ORDERS, "readwrite");
  const store = tx.objectStore(STORE_ORDERS);

  for (const order of cloudOrders) {
    const orderData = order as Record<string, unknown>;
    const rawItems = (orderData.items as unknown[]) || [];

    const normalizedItems = rawItems.map((item, index) => {
      const i = item as Record<string, unknown>;
      return {
        id: String(i.id || i.productId || `item-legacy-${index}`),
        name: String(i.name || "Unknown Item"),
        qty: Number(i.qty || 1),
        price: Number(i.price || 0),
        categoryType: String(i.categoryType || "FOOD").toUpperCase() as
          | "FOOD"
          | "DRINK",
        isDone: Boolean(i.isDone ?? false),
        notes: i.notes ? String(i.notes) : "",
      };
    });

    const orderToValidate = {
      ...orderData,
      items: normalizedItems,
      isSynced: true,
      status: orderData.status || "PENDING",
      paymentMethod: String(orderData.paymentMethod || "CASH").toUpperCase(),
      orderType: orderData.orderType || "Dine In",
      createdAt:
        orderData.createdAt instanceof Date
          ? orderData.createdAt.toISOString()
          : String(orderData.createdAt),
    };

    try {
      const result = LocalOrderSchema.safeParse(orderToValidate);
      if (result.success) {
        store.put(result.data);
      }
    } catch (err) {
      console.error(`Gagal simpan ke IndexedDB:`, err);
    }
  }

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}