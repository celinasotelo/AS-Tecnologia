"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/lib/store/cart";
import { etiquetasDeVariante, usaVariantes } from "@/lib/categorias";

type Variant = {
  id: string;
  name: string;
  price_override: number | null;
  stock: number;
  is_active: boolean;
};

type ProductImage = {
  url: string;
  sort_order: number;
  variant_id: string | null;
};

type ProductDetailProps = {
  productId: string;
  name: string;
  brand: string | null;
  categorySlug: string | null;
  puffs: number | null;
  description: string | null;
  basePrice: number;
  variants: Variant[];
  images: ProductImage[];
};

export function ProductDetail({
  productId,
  name,
  brand,
  categorySlug,
  puffs,
  description,
  basePrice,
  variants,
  images,
}: ProductDetailProps) {
  // Si el producto tiene una sola presentación no tiene sentido hacer elegir:
  // queda seleccionada de entrada y no se muestran los botones.
  const [selectedId, setSelectedId] = useState<string | null>(
    variants.length === 1 ? variants[0].id : null
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const addItem = useCart((state) => state.addItem);

  const etiquetas = etiquetasDeVariante(categorySlug);

  // En vapers y perfumes mostramos las opciones aunque haya una sola: saber si
  // el perfume viene en 50 o en 105 ml es parte de lo que se compra. Los
  // productos de una sola presentación esconden su variante "Estándar".
  const mostrarOpciones =
    variants.length > 1 ||
    (variants.length === 1 && usaVariantes(categorySlug));

  const sortedImages = [...images].sort((a, b) => a.sort_order - b.sort_order);
  const selected = variants.find((v) => v.id === selectedId) ?? null;

  // Precio: el override de la variante si existe, si no el base
  const price = selected?.price_override ?? basePrice;

  const currentImage = sortedImages[currentIndex] ?? null;

  const goTo = (index: number) => {
    const total = sortedImages.length;
    setCurrentIndex(((index % total) + total) % total);
  };

  // Al elegir un sabor, saltar a su imagen si tiene una propia
  const selectVariant = (variant: Variant) => {
    setSelectedId(variant.id);
    const imageIndex = sortedImages.findIndex(
      (img) => img.variant_id === variant.id
    );
    if (imageIndex !== -1) {
      setCurrentIndex(imageIndex);
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* Columna izquierda: galería */}
      <div className="flex flex-col gap-3">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-white">
          {currentImage ? (
            <Image
              src={currentImage.url}
              alt={name}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-contain"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-4xl font-bold text-muted opacity-40">
                AS
              </span>
            </div>
          )}

          {sortedImages.length > 1 && (
            <>
              <button
                onClick={() => goTo(currentIndex - 1)}
                aria-label="Imagen anterior"
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-surface/60 p-2 text-foreground transition hover:bg-surface/90"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => goTo(currentIndex + 1)}
                aria-label="Imagen siguiente"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-surface/60 p-2 text-foreground transition hover:bg-surface/90"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>

        {/* Miniaturas */}
        {sortedImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {sortedImages.map((img, i) => (
              <button
                key={`${img.url}-${i}`}
                onClick={() => setCurrentIndex(i)}
                aria-label={`Ver imagen ${i + 1}`}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-white transition
                  ${
                    i === currentIndex
                      ? "border-primary"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
              >
                <Image
                  src={img.url}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-contain"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Columna derecha: detalle */}
      <div className="flex flex-col gap-5">
        <div>
          <span className="text-sm uppercase tracking-wide text-muted">
            {brand}
          </span>
          <h1 className="mt-1 text-3xl font-bold">{name}</h1>
          {puffs && (
            <p className="mt-1 text-muted">
              {puffs.toLocaleString("es-AR")} puffs
            </p>
          )}
        </div>

        <p className="text-3xl font-bold">{formatPrice(price)}</p>

        {description && (
          <p className="text-sm leading-relaxed text-muted">{description}</p>
        )}

        {/* Opciones: sabores en vapers, mililitros en perfumes */}
        {mostrarOpciones && (
          <div>
            <p className="mb-2 text-sm font-medium text-muted">
              {etiquetas.titulo}
            </p>
            <div className="flex flex-wrap gap-2">
              {variants.map((variant) => {
                const isSelected = variant.id === selectedId;
                const outOfStock = variant.stock === 0;

                return (
                  <button
                    key={variant.id}
                    onClick={() => selectVariant(variant)}
                    disabled={outOfStock}
                    className={`rounded-full border px-4 py-2 text-sm transition
                      ${
                        isSelected
                          ? "border-primary bg-primary text-white"
                          : "border-surface-elevated bg-surface-card hover:border-primary-light"
                      }
                      ${outOfStock ? "cursor-not-allowed opacity-40 line-through" : ""}
                    `}
                  >
                    {variant.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Fuera del bloque de opciones: si no, los productos de una sola
            presentación perderían el aviso de stock bajo. */}
        {selected && selected.stock > 0 && selected.stock <= 3 && (
          <p className="text-sm text-danger">
            ¡Últimas {selected.stock} unidades!
          </p>
        )}

        {/* Agregar al carrito */}
        <button
          onClick={() => {
            if (!selected) return;
            addItem({
              variantId: selected.id,
              productId,
              productName: name,
              variantName: selected.name,
              price,
              imageUrl: currentImage?.url ?? null,
            });
          }}
          disabled={!selected || selected.stock === 0}
          className="rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-40"
        >
          {selected ? "Agregar al carrito" : etiquetas.cta}
        </button>
      </div>
    </div>
  );
}
