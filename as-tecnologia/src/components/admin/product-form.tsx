"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveProduct } from "@/lib/actions/products";
import { CATEGORIA_VAPERS, usaVariantes } from "@/lib/categorias";

type Option = { id: string; name: string };
type CategoryOption = Option & { slug: string };

type ProductFormProps = {
  brands: Option[];
  categories: CategoryOption[];
  // Si viene, es edición. Si no, alta.
  initial?: {
    id: string;
    name: string;
    model: string | null;
    description: string | null;
    base_price: number;
    category_id: string;
    brandName: string;
    puffs: number | null;
    stock: number;
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
  const [brandName, setBrandName] = useState(initial?.brandName ?? "");
  const [puffs, setPuffs] = useState(initial?.puffs?.toString() ?? "");
  const [stock, setStock] = useState(initial?.stock?.toString() ?? "");

  // Derivado de la categoría elegida: cambia solo al mover el <select>.
  // Vapers y perfumes cargan el stock por variante (sabor / mililitros);
  // el resto tiene una sola presentación y el stock va acá mismo.
  const slugActual = categories.find((c) => c.id === categoryId)?.slug;
  const conVariantes = usaVariantes(slugActual);
  const esVaper = slugActual === CATEGORIA_VAPERS;

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
        brandName,
        puffs: puffs ? Number(puffs) : null,
        stock: conVariantes ? null : Number(stock) || 0,
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

        {/* Una columna en celular: dos campos a la par quedan de ~140px cada
            uno y no se lee lo que estás escribiendo. */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Marca">
            <input
              list="brands-list"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className={inputClass}
              placeholder="Escribí o elegí una marca"
            />
            <datalist id="brands-list">
              {brands.map((b) => (
                <option key={b.id} value={b.name} />
              ))}
            </datalist>
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

        <div className="grid gap-4 sm:grid-cols-2">
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

        {esVaper && (
          <Field label="Puffs (opcional)">
            <input
              type="number"
              value={puffs}
              onChange={(e) => setPuffs(e.target.value)}
              className={inputClass}
              placeholder="40000"
            />
          </Field>
        )}

        {conVariantes ? (
          <p className="rounded-lg bg-surface-card px-3 py-2 text-sm text-muted">
            {initial
              ? "El stock de esta categoría se carga por variante, en la sección de abajo."
              : "El stock de esta categoría se carga por variante: vas a poder cargarlo después de crear el producto."}
          </p>
        ) : (
          <Field label="Stock">
            <input
              type="number"
              min={0}
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className={inputClass}
              placeholder="5"
            />
          </Field>
        )}

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