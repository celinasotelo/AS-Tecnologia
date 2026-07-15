import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/catalog/product-card";

export default async function ProductosPage() {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, base_price, brands(name), product_variants(stock), product_images(url, sort_order)")
    .order("created_at", { ascending: false });

  if (error) {
    return <p className="p-8 text-danger">Error al cargar productos.</p>;
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">Productos</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}