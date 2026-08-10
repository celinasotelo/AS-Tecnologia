import { notFound } from "next/navigation";
import {getProductForEdit, getBrandsAndCategories} from "@/lib/queries/admin-products";
import { ProductForm } from "@/components/admin/product-form";
import { VariantManager } from "@/components/admin/variant-manager";
import { ImageManager } from "@/components/admin/image-manager";
import { usaVariantes } from "@/lib/categorias";

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

  const slugCategoria = categories.find(
    (c) => c.id === product.category_id
  )?.slug;
  const variantesActivas = product.product_variants.filter((v) => v.is_active);

  // Válvula de seguridad: si un producto de una sola presentación quedó con
  // varias variantes activas (porque le cambiaron la categoría, por ejemplo),
  // mostramos el gestor igual para que ese stock no quede inalcanzable.
  const conVariantes =
    usaVariantes(slugCategoria) || variantesActivas.length > 1;

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
          brandName: product.brands?.name ?? "",
          puffs,
          stock: variantesActivas[0]?.stock ?? 0,
        }}
      />

      {conVariantes && (
        <VariantManager
          productId={product.id}
          categorySlug={slugCategoria ?? null}
          variants={product.product_variants}
        />
      )}

      <ImageManager
        productId={product.id}
        images={product.product_images}
        variants={product.product_variants}
      />
    </div>
  );
}