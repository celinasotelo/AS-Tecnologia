import { getBrandsAndCategories } from "@/lib/queries/admin-products";
import { ProductForm } from "@/components/admin/product-form";

export default async function NuevoProductoPage() {
  const { brands, categories } = await getBrandsAndCategories();

  return <ProductForm brands={brands} categories={categories} />;
}