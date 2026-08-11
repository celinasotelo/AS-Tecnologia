"use client";

import { useState, useTransition } from "react";
import { Trash2, Plus, RotateCcw } from "lucide-react";
import {
  updateVariant,
  addVariant,
  deleteVariant,
  restoreVariant,
} from "@/lib/actions/products";
import { etiquetasDeVariante } from "@/lib/categorias";

type Variant = {
  id: string;
  name: string;
  price_override: number | null;
  stock: number;
  is_active: boolean;
};

export function VariantManager({
  productId,
  categorySlug,
  variants,
}: {
  productId: string;
  categorySlug: string | null;
  variants: Variant[];
}) {
  // Las mismas etiquetas que ve el cliente en la tienda: si acá cargás
  // "presentaciones", allá se muestran como "Presentación".
  const etiquetas = etiquetasDeVariante(categorySlug);

  return (
    <div>
      <h2 className="text-xl font-bold">Stock por {etiquetas.singular}</h2>
      <p className="mt-1 text-sm text-muted">
        Editá nombre, precio y stock de cada {etiquetas.singular}. Se guarda por
        fila. Si dejás el precio vacío se usa el precio base del producto.
      </p>

      <div className="mt-4 flex flex-col gap-2">
        {variants.map((variant) => (
          <VariantRow
            key={variant.id}
            variant={variant}
            etiquetas={etiquetas}
          />
        ))}
      </div>

      <NewVariantForm productId={productId} etiquetas={etiquetas} />
    </div>
  );
}

type Etiquetas = ReturnType<typeof etiquetasDeVariante>;

// --- Fila de una variante existente ---
function VariantRow({
  variant,
  etiquetas,
}: {
  variant: Variant;
  etiquetas: Etiquetas;
}) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(variant.name);
  const [stock, setStock] = useState(variant.stock.toString());
  // Vacío = sin precio propio, la variante se vende al precio base.
  const [price, setPrice] = useState(variant.price_override?.toString() ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    setSaved(false);
    startTransition(async () => {
      const result = await updateVariant({
        id: variant.id,
        name,
        stock: Number(stock) || 0,
        priceOverride: price.trim() === "" ? null : Number(price),
      });
      if (result.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  };

  const handleDelete = () => {
    if (!confirm(`¿Eliminar "${variant.name}"?`)) return;
    startTransition(async () => {
      await deleteVariant(variant.id);
    });
  };

  const handleRestore = () => {
    setError(null);
    startTransition(async () => {
      const result = await restoreVariant(variant.id);
      if (!result.ok) setError(result.error ?? "No se pudo reactivar.");
    });
  };

  // Una variante desactivada no se edita: primero hay que reactivarla.
  if (!variant.is_active) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-surface-card p-2">
        <span className="flex-1 px-2 py-1.5 text-sm text-muted line-through">
          {variant.name}
        </span>
        {error && <span className="text-xs text-danger">{error}</span>}
        <span className="rounded-md bg-surface px-2 py-1 text-xs text-muted">
          Inactiva
        </span>
        <button
          onClick={handleRestore}
          disabled={isPending}
          className="flex items-center gap-1 rounded-md bg-success/20 px-3 py-1.5 text-sm font-medium text-success transition hover:bg-success/30 disabled:opacity-50"
        >
          <RotateCcw size={16} />
          {isPending ? "..." : "Restaurar"}
        </button>
      </div>
    );
  }

  return (
    // En celular la fila se parte en dos renglones: el nombre ocupa todo el
    // ancho arriba y los campos cortos van abajo. Los cinco en una sola línea
    // necesitan 331px fijos y en un celular de 360px hay 312px.
    <div className="flex flex-wrap items-center gap-2 rounded-lg bg-surface-card p-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full min-w-0 rounded-md border border-surface-elevated bg-surface px-2 py-1.5 text-sm outline-none focus:border-primary sm:w-auto sm:flex-1"
        placeholder={`Nombre: ${etiquetas.ejemplo}`}
      />
      <input
        type="number"
        min={0}
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="min-w-0 flex-1 rounded-md border border-surface-elevated bg-surface px-2 py-1.5 text-sm outline-none focus:border-primary sm:w-28 sm:flex-none"
        placeholder="Precio base"
        title="Dejalo vacío para usar el precio base del producto"
      />
      <input
        type="number"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        className="w-20 min-w-0 flex-1 rounded-md border border-surface-elevated bg-surface px-2 py-1.5 text-sm outline-none focus:border-primary sm:flex-none"
        placeholder="Stock"
      />
      <button
        onClick={handleSave}
        disabled={isPending}
        className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white transition hover:bg-primary-light disabled:opacity-50"
      >
        {saved ? "✓" : isPending ? "..." : "Guardar"}
      </button>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="shrink-0 rounded-md p-1.5 text-muted transition hover:text-danger disabled:opacity-50"
        aria-label="Eliminar variante"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

// --- Formulario para agregar una variante nueva ---
function NewVariantForm({
  productId,
  etiquetas,
}: {
  productId: string;
  etiquetas: Etiquetas;
}) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  const handleAdd = () => {
    if (!name.trim()) return;
    startTransition(async () => {
      const result = await addVariant({
        productId,
        name,
        stock: Number(stock) || 0,
        priceOverride: price.trim() === "" ? null : Number(price),
      });
      if (result.ok) {
        setName("");
        setPrice("");
        setStock("");
      }
    });
  };

  return (
    // Mismo criterio que la fila de arriba: en celular el nombre va solo en
    // el primer renglón y precio/stock/botón abajo.
    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-surface-elevated p-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full min-w-0 rounded-md border border-surface-elevated bg-surface px-2 py-1.5 text-sm outline-none focus:border-primary sm:w-auto sm:flex-1"
        placeholder={`${etiquetas.nueva}: ${etiquetas.ejemplo}`}
      />
      <input
        type="number"
        min={0}
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="min-w-0 flex-1 rounded-md border border-surface-elevated bg-surface px-2 py-1.5 text-sm outline-none focus:border-primary sm:w-28 sm:flex-none"
        placeholder="Precio base"
        title="Dejalo vacío para usar el precio base del producto"
      />
      <input
        type="number"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        className="w-20 min-w-0 flex-1 rounded-md border border-surface-elevated bg-surface px-2 py-1.5 text-sm outline-none focus:border-primary sm:flex-none"
        placeholder="Stock"
      />
      <button
        onClick={handleAdd}
        disabled={isPending || !name.trim()}
        className="flex shrink-0 items-center gap-1 rounded-md bg-success/20 px-3 py-1.5 text-sm font-medium text-success transition hover:bg-success/30 disabled:opacity-50"
      >
        <Plus size={16} />
        Agregar
      </button>
    </div>
  );
}