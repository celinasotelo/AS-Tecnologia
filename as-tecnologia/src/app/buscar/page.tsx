import Link from "next/link";
import { searchActiveProducts } from "@/lib/queries/products";
import { ProductGrid } from "@/components/catalog/product-grid";

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function BuscarPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const term = q?.trim() ?? "";

  // Entró a /buscar sin término (link pelado, o borró el texto).
  if (!term) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold">Buscar</h1>
        <p className="mt-2 text-muted">
          Usá la lupa de arriba para buscar un producto por nombre o modelo.
        </p>
      </main>
    );
  }

  const { data: products, error } = await searchActiveProducts(term);

  if (error) {
    return <p className="p-8 text-danger">Error al buscar productos.</p>;
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">
        Resultados para &ldquo;{term}&rdquo;
      </h1>
      <p className="mt-1 text-sm text-muted">
        {products.length === 1
          ? "1 producto encontrado"
          : `${products.length} productos encontrados`}
      </p>

      <div className="mt-6">
        <ProductGrid
          products={products}
          emptyMessage="No encontramos productos con ese nombre. Probá con otra palabra."
        />
      </div>

      <Link
        href="/"
        className="mt-8 inline-block text-sm text-muted hover:text-primary-light"
      >
        ← Ver todos los productos
      </Link>
    </main>
  );
}
