import { z } from "zod";
import type { CategoryColor } from "@/lib/category-colors";


export interface ProductUI {
  id: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  isActive: boolean;
  imageUrl?: string;
  categoryType: "FOOD" | "DRINK";
  category: {
    id: string;
    name: string;
    color: CategoryColor;
  };
}

/**
 * Schema Validasi untuk Form (Zod)
 * Dipakai di Client (Form) dan Server (Actions)
 */
export const ProductFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nama wajib diisi"),
  description: z.string().optional(),
  price: z.number().min(0, "Harga minimal 0"),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  categoryType: z.enum(["FOOD", "DRINK"]),
  imageUrl: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type ProductFormInput = z.infer<typeof ProductFormSchema>;