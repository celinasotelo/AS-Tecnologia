import { getActiveProducts } from "@/lib/queries/products";
import { ProductGrid } from "@/components/catalog/product-grid";
import Link from "next/link";

export default async function Home() {
  const { data: products, error } = await getActiveProducts();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* Hero mínimo */}
      <section className="py-6 text-center sm:py-10">
        <h1 className="text-3xl font-bold sm:text-4xl">
          AS <span className="text-primary-light">Tecnología</span>
        </h1>
        <p className="mx-auto mt-3 max-w-md text-muted">
          Vapers, perfumes y más. Corrientes, Argentina.
        </p>
      </section>

      {/* Catálogo */}
      <section className="mt-4">
        <h2 className="text-xl font-bold">Catálogo</h2>
        <div className="mt-6">
          {error ? (
            <p className="text-danger">Error al cargar productos.</p>
          ) : (
            <ProductGrid products={products} />
          )}
        </div>
      </section>
    </main>
  );
}