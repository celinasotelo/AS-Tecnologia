import { ProductCard } from "@/components/catalog/product-card";
import type { ComponentProps } from "react";

type Product = ComponentProps<typeof ProductCard>["product"];

type ProductGridProps = {
  products: Product[];
  // Texto para la grilla vacía. El listado usa el default; la búsqueda manda el suyo.
  emptyMessage?: string;
};

export function ProductGrid({
  products,
  emptyMessage = "No hay productos disponibles por el momento.",
}: ProductGridProps) {
  if (products.length === 0) {
    return <p className="py-12 text-center text-muted">{emptyMessage}</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < 4}
        />
      ))}
    </div>
  );
}