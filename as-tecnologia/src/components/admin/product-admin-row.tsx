"use client";

import { useState, useTransition } from "react";
import { formatPrice } from "@/lib/format";
import { toggleProductActive } from "@/lib/actions/products";
import Link from "next/link";

type Variant = {
  id: string;
  name: string;
  stock: number;
  is_active: boolean;
};

type Product = {
  id: string;
  name: string;
  model: string | null;
  base_price: number;
  is_active: boolean;
  brands: { name: string } | null;
  product_variants: Variant[];
};

export function ProductAdminRow({ product }: { product: Product }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const totalStock = product.product_variants.reduce(
    (sum, v) => sum + v.stock,
    0
  );

  const handleToggle = () => {
    setError(null);
    startTransition(async () => {
      const result = await toggleProductActive(product.id, !product.is_active);
      if (!result.ok) {
        setError(result.error ?? "Error");
      }
    });
  };

  return (
    <div
      className={`rounded-xl bg-surface-card p-4 transition ${
        product.is_active ? "" : "opacity-50"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold">{product.name}</p>
          <p className="text-sm text-muted">
            {product.brands?.name}
            {product.model ? ` · ${product.model}` : ""}
          </p>
        </div>

        {/* En celular el precio y los dos botones tampoco entran juntos:
            flex-wrap deja que Editar baje si hace falta. */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="text-right">
            <p className="font-semibold">{formatPrice(product.base_price)}</p>
            <p className="text-xs text-muted">Stock total: {totalStock}</p>
          </div>

          <button
            onClick={handleToggle}
            disabled={isPending}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition disabled:opacity-50 ${
              product.is_active
                ? "bg-danger/15 text-danger hover:bg-danger/25"
                : "bg-success/15 text-success hover:bg-success/25"
            }`}
          >
            {isPending
              ? "..."
              : product.is_active
              ? "Desactivar"
              : "Activar"}
          </button>
          <Link
            href={`/admin/productos/${product.id}/editar`}
            className="rounded-lg bg-surface-elevated px-3 py-1.5 text-sm font-medium hover:bg-primary/20"
          >
            Editar
          </Link>
        </div>
      </div>

      {/* Variantes con su stock */}
      {product.product_variants.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2 border-t border-surface-elevated pt-3">
          {product.product_variants.map((v) => (
            <li
              key={v.id}
              className="rounded-full bg-surface px-3 py-1 text-xs text-muted"
            >
              {v.name}: <span className="font-medium">{v.stock}</span>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}