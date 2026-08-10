import { getActiveProducts, getBrandsForFilter } from "@/lib/queries/products";
import { ProductGrid } from "@/components/catalog/product-grid";
import { FilterBar } from "@/components/catalog/filter-bar";

type PageProps = {
  searchParams: Promise<{
    categoria?: string;
    marca?: string;
  }>;
};

export default async function ProductosPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const categoryFilter = {
    categoria: params.categoria,
    excludeCategoria: params.categoria ? undefined : "vapers",
  };

  const [{ data: products, error }, brands] = await Promise.all([
    getActiveProducts({ ...categoryFilter, marca: params.marca }),
    getBrandsForFilter(categoryFilter),
  ]);

  if (error) {
    return <p className="p-8 text-danger">Error al cargar productos.</p>;
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">Otros Productos</h1>
      <div className="mt-4">
        {/* Acá solo filtramos por marca: puffs y sabor son cosa de vapers */}
        <FilterBar brands={brands} showPuffs={false} showSabor={false} />
      </div>
      <div className="mt-6">
        <ProductGrid products={products ?? []} />
      </div>
    </main>
  );
}