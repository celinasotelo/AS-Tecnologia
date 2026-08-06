import { getActiveProducts, getBrandsForFilter } from "@/lib/queries/products";
import { ProductGrid } from "@/components/catalog/product-grid";
import { FilterBar } from "@/components/catalog/filter-bar";

type PageProps = {
  searchParams: Promise<{
    categoria?: string;
    marca?: string;
    puffs?: string;
    sabor?: string;
  }>;
};

export default async function ProductosPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const [{ data: products, error }, brands] = await Promise.all([
    getActiveProducts({
      categoria: params.categoria,
      marca: params.marca,
      puffs: params.puffs ? Number(params.puffs) : undefined,
      sabor: params.sabor,
    }),
    getBrandsForFilter(),
  ]);

  if (error) {
    return <p className="p-8 text-danger">Error al cargar productos.</p>;
  }

  // Puffs solo aplica a vapers (o cuando no hay categoría elegida)
  const showPuffs = !params.categoria || params.categoria === "vapers";

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">Productos</h1>
      <div className="mt-4">
        <FilterBar brands={brands} showPuffs={showPuffs} />
      </div>
      <div className="mt-6">
        <ProductGrid products={products ?? []} />
      </div>
    </main>
  );
}