import { getAllProductsForAdmin } from "@/lib/queries/admin-products";
import { ProductAdminRow } from "@/components/admin/product-admin-row";
import Link from "next/link";

export default async function AdminProductosPage() {
  const { data: products, error } = await getAllProductsForAdmin();

  if (error) {
    return <p className="text-danger">Error al cargar productos.</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Link
          href="/admin/productos/nuevo"
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-light"
        >
          + Nuevo producto
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {products.map((product) => (
          <ProductAdminRow key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}