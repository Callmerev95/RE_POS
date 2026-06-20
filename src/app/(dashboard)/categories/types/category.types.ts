import { type CategoryColor } from "@/lib/category-colors";

export interface CategoryUI {
  id: string;
  name: string;
  color: CategoryColor;
  createdAt: Date;
  _count?: {
    products: number;
  };
}

export interface CategoryFormInput {
  name: string;
  color: CategoryColor;
}