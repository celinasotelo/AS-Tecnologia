import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductDetail } from "@/components/catalog/product-detail";
import { CATEGORIA_VAPERS } from "@/lib/categorias";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductoDetallePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select(
      `id, name, model, description, base_price, attributes,
       brands(name),
       categories(name, slug),
       product_variants(id, name, price_override, stock, is_active),
       product_images(url, sort_order, variant_id)`
    )
    .eq("id", id)
    .eq("product_variants.is_active", true)
    .single();

  if (!product) {
    notFound();
  }

  // La categoría decide cómo se muestra el detalle: los vapers tienen sección
  // propia y muestran puffs; el resto cuelga de "Otros Productos".
  const categorySlug = product.categories?.slug ?? null;
  const esVaper = categorySlug === CATEGORIA_VAPERS;

  const seccion = esVaper
    ? { href: "/vapers", label: "Vapers" }
    : { href: "/productos", label: "Otros Productos" };

  const puffs = esVaper
    ? (product.attributes as { puffs?: number })?.puffs
    : null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted">
        <Link href="/" className="hover:text-primary-light">
          Inicio
        </Link>
        <span>›</span>
        <Link href={seccion.href} className="hover:text-primary-light">
          {seccion.label}
        </Link>
        <span>›</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <ProductDetail
        productId={product.id}
        name={product.name}
        brand={product.brands?.name ?? null}
        categorySlug={categorySlug}
        puffs={puffs ?? null}
        description={product.description}
        basePrice={product.base_price}
        variants={product.product_variants}
        images={product.product_images}
      />
    </main>
  );
}
