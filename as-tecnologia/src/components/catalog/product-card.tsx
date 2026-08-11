import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    base_price: number;
    brands: { name: string } | null;
    product_variants: { stock: number }[];
    product_images: { url: string; sort_order: number }[];
  };

  priority?: boolean;
};

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const hasStock = product.product_variants.some((v) => v.stock > 0);
  const mainImage = [...product.product_images].sort(
    (a, b) => a.sort_order - b.sort_order
  )[0];

  return (
    <Link
      href={`/productos/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface-card transition hover:bg-surface-elevated"
    >
      {/* Imagen */}
      <div className="relative flex aspect-square items-center justify-center bg-surface-elevated">
        {mainImage ? (
          <Image
            src={mainImage.url}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            priority={priority}
            className="object-cover transition group-hover:scale-105"
          />
        ) : (
          <span className="text-4xl font-bold text-muted opacity-40">AS</span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
        <span className="text-xs uppercase tracking-wide text-muted">
          {product.brands?.name}
        </span>
        <h3 className="text-sm font-medium leading-snug group-hover:text-primary-light">
          {product.name}
        </h3>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-2 gap-y-1 pt-2">
          <span className="text-base font-bold sm:text-lg">
            {formatPrice(product.base_price)}
          </span>
          {!hasStock && (
            <span className="rounded-full bg-danger/15 px-2 py-0.5 text-xs font-medium text-danger">
              Sin stock
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}