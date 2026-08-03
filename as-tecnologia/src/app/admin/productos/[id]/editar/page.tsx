import { notFound } from "next/navigation";
import {
  getProductForEdit,
  getBrandsAndCategories,
} from "@/lib/queries/admin-products";
import { ProductForm } from "@/components/admin/product-form";
import { VariantManager } from "@/components/admin/variant-manager";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditarProductoPage({ params }: PageProps) {
  const { id } = await params;

  const [{ data: product }, { brands, categories }] = await Promise.all([
    getProductForEdit(id),
    getBrandsAndCategories(),
  ]);

  if (!product) {
    notFound();
  }

  const puffs = (product.attributes as { puffs?: number })?.puffs ?? null;

  return (
    <div className="flex flex-col gap-10">
      <ProductForm
        brands={brands}
        categories={categories}
        initial={{
          id: product.id,
          name: product.name,
          model: product.model,
          description: product.description,
          base_price: product.base_price,
          category_id: product.category_id,
          brand_id: product.brand_id,
          puffs,
        }}
      />

      <VariantManager
        productId={product.id}
        variants={product.product_variants}
      />
    </div>
  );
}