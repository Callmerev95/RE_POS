import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ProductFormInput, ProductFormSchema, ProductUI } from "../types/product.types";
import { createProduct, updateProduct } from "../actions";
import { toCategoryColor } from "@/lib/category-colors";

export function useProductForm(
  product: ProductUI | null,
  onCreated: (p: ProductUI) => void,
  onUpdated: (p: ProductUI) => void,
  onClose: () => void
) {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // State form utama
  const [formData, setFormData] = useState<ProductFormInput>({
    name: "",
    description: "",
    price: 0,
    categoryId: "",
    categoryType: "DRINK",
    imageUrl: "",
    isActive: true,
  });

  const isEdit = Boolean(product);

  // Sync data saat mode EDIT
  useEffect(() => {
    if (product) {
      setFormData({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        categoryId: product.category.id,
        categoryType: product.categoryType,
        imageUrl: product.imageUrl || "",
        isActive: product.isActive,
      });
      setPreviewUrl(product.imageUrl || "");
    } else {
      setFormData({
        name: "",
        description: "",
        price: 0,
        categoryId: "",
        categoryType: "DRINK",
        imageUrl: "",
        isActive: true,
      });
      setPreviewUrl("");
      setSelectedFile(null);
    }
  }, [product]);

  const handleImageChange = (file: File) => {
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleSubmit = async () => {
    try {
      // 1. Validasi via Zod
      const validated = ProductFormSchema.parse(formData);
      setLoading(true);

      let imageToSave = validated.imageUrl;

      // 2. Handle Upload Gambar jika ada file baru
      if (selectedFile) {
        const productId = isEdit && product ? product.id : crypto.randomUUID();
        const form = new FormData();
        form.append("file", selectedFile);
        form.append("productId", productId);

        const res = await fetch("/api/uploads/product-image", {
          method: "POST",
          body: form,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? "Upload gagal");
        imageToSave = data.publicUrl;
      }

      const finalData = { ...validated, imageUrl: imageToSave };

      // 3. Execute Server Actions
      const result = isEdit 
        ? await updateProduct(finalData) 
        : await createProduct(finalData);

      // 4. Transform hasil Prisma ke ProductUI
      const uiProduct: ProductUI = {
        id: result.id,
        name: result.name,
        description: result.description ?? "",
        sku: result.sku ?? "-",
        price: Number(result.price),
        isActive: result.isActive,
        imageUrl: result.imageUrl ?? undefined,
        categoryType: result.categoryType as "FOOD" | "DRINK",
        category: {
          id: result.category.id,
          name: result.category.name,
          color: toCategoryColor(result.category.color),
        },
      };

      toast.success(isEdit ? "Produk diperbarui" : "Produk ditambahkan");
      
      if (isEdit) onUpdated(uiProduct);
      else onCreated(uiProduct);
      
      onClose();
    } catch (err: unknown) {
    
      if (err instanceof Error) {
      
        toast.error(err.message);
      } else {
        toast.error("Gagal menyimpan produk");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    loading,
    previewUrl,
    handleImageChange,
    handleSubmit,
    isEdit
  };
}