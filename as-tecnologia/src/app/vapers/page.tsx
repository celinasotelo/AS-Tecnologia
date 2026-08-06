import { getActiveProducts, getBrandsForFilter } from "@/lib/queries/products";
import { ProductGrid } from "@/components/catalog/product-grid";
import { FilterBar } from "@/components/catalog/filter-bar";

type PageProps = {
  searchParams: Promise<{
    marca?: string;
    puffs?: string;
    sabor?: string;
  }>;
};

export default async function VapersPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const [{ data: products, error }, brands] = await Promise.all([
    getActiveProducts({
      categoria: "vapers",
      marca: params.marca,
      puffs: params.puffs ? Number(params.puffs) : undefined,
      sabor: params.sabor,
    }),
    getBrandsForFilter({ categoria: "vapers" }),
  ]);

  if (error) {
    return <p className="p-8 text-danger">Error al cargar productos.</p>;
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">Vapers</h1>
      <div className="mt-4">
        {/* Sin props: FilterBar muestra los tres filtros por defecto */}
        <FilterBar brands={brands} />
      </div>
      <div className="mt-6">
        <ProductGrid products={products ?? []} />
      </div>
    </main>
  );
}
