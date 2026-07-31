"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveProduct } from "@/lib/actions/products";

type Option = { id: string; name: string };

type ProductFormProps = {
  brands: Option[];
  categories: Option[];
  // Si viene, es edición. Si no, alta.
  initial?: {
    id: string;
    name: string;
    model: string | null;
    description: string | null;
    base_price: number;
    category_id: string;
    brand_id: string;
    puffs: number | null;
  };
};

export function ProductForm({ brands, categories, initial }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Un estado por campo, inicializado con el valor existente (edición) o vacío (alta)
  const [name, setName] = useState(initial?.name ?? "");
  const [model, setModel] = useState(initial?.model ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [basePrice, setBasePrice] = useState(initial?.base_price?.toString() ?? "");
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? "");
  const [brandId, setBrandId] = useState(initial?.brand_id ?? "");
  const [puffs, setPuffs] = useState(initial?.puffs?.toString() ?? "");

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      const result = await saveProduct({
        id: initial?.id,
        name,
        model,
        description,
        basePrice: Number(basePrice) || 0,
        categoryId,
        brandId,
        puffs: puffs ? Number(puffs) : null,
      });

      if (result.ok) {
        router.push("/admin/productos"); // volver a la lista
      } else {
        setError(result.error ?? "Error");
      }
    });
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold">
        {initial ? "Editar producto" : "Nuevo producto"}
      </h1>

      <div className="mt-6 flex flex-col gap-4">
        <Field label="Nombre">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder="Vaper Elf Bar Ice King"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Marca">
            <select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className={inputClass}
            >
              <option value="">Elegí una marca</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Categoría">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={inputClass}
            >
              <option value="">Elegí una categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Precio base (ARS)">
            <input
              type="number"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              className={inputClass}
              placeholder="23000"
            />
          </Field>

          <Field label="Modelo (opcional)">
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className={inputClass}
              placeholder="Ice King 40k"
            />
          </Field>
        </div>

        <Field label="Puffs (solo vapers, opcional)">
          <input
            type="number"
            value={puffs}
            onChange={(e) => setPuffs(e.target.value)}
            className={inputClass}
            placeholder="40000"
          />
        </Field>

        <Field label="Descripción (opcional)">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={inputClass}
            placeholder="Desechable de 40.000 puffs..."
          />
        </Field>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary-light disabled:opacity-50"
          >
            {isPending ? "Guardando..." : initial ? "Guardar cambios" : "Crear producto"}
          </button>
          <button
            onClick={() => router.push("/admin/productos")}
            className="rounded-xl px-6 py-3 font-semibold text-muted hover:bg-surface-elevated"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// Estilo compartido de los inputs
const inputClass =
  "rounded-lg border border-surface-elevated bg-surface px-3 py-2 text-sm outline-none focus:border-primary w-full";

// Componentito para etiqueta + campo
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}