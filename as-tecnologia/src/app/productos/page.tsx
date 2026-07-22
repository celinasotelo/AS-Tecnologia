import { getActiveProducts } from "@/lib/queries/products";
import { ProductGrid } from "@/components/catalog/product-grid";

export default async function ProductosPage() {
  const { data: products, error } = await getActiveProducts();

  if (error) {
    return <p className="p-8 text-danger">Error al cargar productos.</p>;
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">Productos</h1>
      <div className="mt-6">
        <ProductGrid products={products} />
      </div>
    </main>
  );
}