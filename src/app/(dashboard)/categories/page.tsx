import { getCategories } from "./actions";
import { CategoriesClient } from "./CategoriesClient";
import { CategoryUI } from "./types/category.types";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return <CategoriesClient initialData={categories as CategoryUI[]} />;
}