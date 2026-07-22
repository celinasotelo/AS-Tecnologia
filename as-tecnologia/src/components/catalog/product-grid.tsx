import { ProductCard } from "@/components/catalog/product-card";
import type { ComponentProps } from "react";

type Product = ComponentProps<typeof ProductCard>["product"];

type ProductGridProps = {
  products: Product[];
};

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <p className="py-12 text-center text-muted">
        No hay productos disponibles por el momento.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}