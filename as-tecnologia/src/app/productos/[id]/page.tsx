import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductDetail } from "@/components/catalog/product-detail";

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
       product_variants(id, name, price_override, stock, is_active),
       product_images(url, sort_order, variant_id)`
    )
    .eq("id", id)
    .single();

  if (!product) {
    notFound();
  }

  const puffs = (product.attributes as { puffs?: number })?.puffs;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted">
        <Link href="/" className="hover:text-primary-light">
          Inicio
        </Link>
        <span>›</span>
        <Link href="/productos" className="hover:text-primary-light">
          Productos
        </Link>
        <span>›</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <ProductDetail
        name={product.name}
        brand={product.brands?.name ?? null}
        puffs={puffs ?? null}
        description={product.description}
        basePrice={product.base_price}
        variants={product.product_variants}
        images={product.product_images}
      />
    </main>
  );
}
