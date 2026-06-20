import { create } from "zustand";
import { type OrderType } from "./cart.types";
import { type HoldOrder } from "./holdOrder.types";

/**
 * Representasi item di dalam keranjang belanja (UI).
 * Dibuat flat agar mudah dikelola oleh State Management.
 */
export type CartItem = {
  productId: string;
  name: string;
  price: number;
  qty: number;
  categoryType: "FOOD" | "DRINK";
  notes: string;
};

type CartState = {
  items: CartItem[];
  customerName: string;
  orderType: OrderType;
  activeOrderId: string;
  lastAddedProductId: string | null;
};

type CartActions = {
  addItem: (item: Omit<CartItem, "qty" | "notes">) => void;
  increaseQty: (productId: string) => void;
  decreaseQty: (productId: string) => void;
  removeItem: (productId: string) => void;
  updateNotes: (productId: string, notes: string) => void;
  clearCart: () => void;
  resetOrder: () => void;
  setCustomerName: (name: string) => void;
  setOrderType: (type: OrderType) => void;
  getSubtotal: () => number;
  loadHoldToCart: (hold: HoldOrder) => void;
};

export const useCartStore = create<CartState & CartActions>()((set, get) => ({
  /* =====================
   * STATE
   ===================== */
  items: [],
  customerName: "",
  orderType: "Dine In",
  activeOrderId: "",
  lastAddedProductId: null,

  /* =====================
   * ACTIONS
   ===================== */
  loadHoldToCart: (hold) => {
    set({
      activeOrderId: hold.id,
      items: hold.items.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        qty: item.qty,
        categoryType: item.categoryType as "FOOD" | "DRINK",
        notes: item.notes || "",
      })),
      customerName: hold.customerName,
      orderType: hold.orderType as OrderType,
      lastAddedProductId: null,
    });
  },

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.productId === item.productId);

      if (existing) {
        return {
          items: state.items.map((i) =>
            i.productId === item.productId ? { ...i, qty: i.qty + 1 } : i
          ),
          lastAddedProductId: item.productId,
        };
      }

      return {
        items: [...state.items, { ...item, qty: 1, notes: "" }],
        lastAddedProductId: item.productId,
      };
    }),

  increaseQty: (productId) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.productId === productId ? { ...i, qty: i.qty + 1 } : i
      ),
    })),

  decreaseQty: (productId) =>
    set((state) => ({
      items: state.items
        .map((i) => (i.productId === productId ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0),
    })),

  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((i) => i.productId !== productId),
    })),

  updateNotes: (productId, notes) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.productId === productId ? { ...i, notes } : i
      ),
    })),

  /**
   * UPDATE: Menambahkan pembersihan customerName dan activeOrderId.
   * Ini memastikan setelah checkout sukses, UI kembali ke kondisi bersih total.
   */
  clearCart: () =>
    set({
      items: [],
      customerName: "",
      activeOrderId: "",
      lastAddedProductId: null,
    }),

  resetOrder: () =>
    set({
      items: [],
      customerName: "",
      orderType: "Dine In",
      activeOrderId: "",
      lastAddedProductId: null,
    }),

  setCustomerName: (name) => set({ customerName: name }),
  setOrderType: (type) => set({ orderType: type }),
  getSubtotal: () =>
    get().items.reduce((total, item) => total + item.price * item.qty, 0),
}));