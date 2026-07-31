import { getAllProductsForAdmin } from "@/lib/queries/admin-products";
import { ProductAdminRow } from "@/components/admin/product-admin-row";

export default async function AdminProductosPage() {
  const { data: products, error } = await getAllProductsForAdmin();

  if (error) {
    return <p className="text-danger">Error al cargar productos.</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Productos</h1>
        {/* El botón de "Nuevo producto" lo activamos en la próxima etapa */}
        <button
          disabled
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white opacity-50"
        >
          + Nuevo producto
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {products.map((product) => (
          <ProductAdminRow key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}