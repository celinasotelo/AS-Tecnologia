"use client";

import { useState, useTransition } from "react";
import { Trash2, Plus, RotateCcw } from "lucide-react";
import {
  updateVariant,
  addVariant,
  deleteVariant,
  restoreVariant,
} from "@/lib/actions/products";

type Variant = {
  id: string;
  name: string;
  price_override: number | null;
  stock: number;
  is_active: boolean;
};

export function VariantManager({
  productId,
  variants,
}: {
  productId: string;
  variants: Variant[];
}) {
  return (
    <div>
      <h2 className="text-xl font-bold">Variantes y stock</h2>
      <p className="mt-1 text-sm text-muted">
        Editá el stock de cada sabor. Los cambios se guardan por fila.
      </p>

      <div className="mt-4 flex flex-col gap-2">
        {variants.map((variant) => (
          <VariantRow key={variant.id} variant={variant} />
        ))}
      </div>

      <NewVariantForm productId={productId} />
    </div>
  );
}

// --- Fila de una variante existente ---
function VariantRow({ variant }: { variant: Variant }) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(variant.name);
  const [stock, setStock] = useState(variant.stock.toString());
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    setSaved(false);
    startTransition(async () => {
      const result = await updateVariant({
        id: variant.id,
        name,
        stock: Number(stock) || 0,
        priceOverride: variant.price_override,
      });
      if (result.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  };

  const handleDelete = () => {
    if (!confirm(`¿Eliminar la variante "${variant.name}"?`)) return;
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
    <div className="flex items-center gap-2 rounded-lg bg-surface-card p-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1 rounded-md border border-surface-elevated bg-surface px-2 py-1.5 text-sm outline-none focus:border-primary"
        placeholder="Nombre del sabor"
      />
      <input
        type="number"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        className="w-20 rounded-md border border-surface-elevated bg-surface px-2 py-1.5 text-sm outline-none focus:border-primary"
        placeholder="Stock"
      />
      <button
        onClick={handleSave}
        disabled={isPending}
        className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white transition hover:bg-primary-light disabled:opacity-50"
      >
        {saved ? "✓" : isPending ? "..." : "Guardar"}
      </button>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="rounded-md p-1.5 text-muted transition hover:text-danger disabled:opacity-50"
        aria-label="Eliminar variante"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

// --- Formulario para agregar una variante nueva ---
function NewVariantForm({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [stock, setStock] = useState("");

  const handleAdd = () => {
    if (!name.trim()) return;
    startTransition(async () => {
      const result = await addVariant({
        productId,
        name,
        stock: Number(stock) || 0,
      });
      if (result.ok) {
        setName("");
        setStock("");
      }
    });
  };

  return (
    <div className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-surface-elevated p-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1 rounded-md border border-surface-elevated bg-surface px-2 py-1.5 text-sm outline-none focus:border-primary"
        placeholder="Nuevo sabor..."
      />
      <input
        type="number"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        className="w-20 rounded-md border border-surface-elevated bg-surface px-2 py-1.5 text-sm outline-none focus:border-primary"
        placeholder="Stock"
      />
      <button
        onClick={handleAdd}
        disabled={isPending || !name.trim()}
        className="flex items-center gap-1 rounded-md bg-success/20 px-3 py-1.5 text-sm font-medium text-success transition hover:bg-success/30 disabled:opacity-50"
      >
        <Plus size={16} />
        Agregar
      </button>
    </div>
  );
}