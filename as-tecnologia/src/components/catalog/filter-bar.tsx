"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

type Brand = { name: string; slug: string };

const PUFFS_OPTIONS = [
  { label: "Todos los puffs", value: "" },
  { label: "10.000 o más", value: "10000" },
  { label: "20.000 o más", value: "20000" },
  { label: "30.000 o más", value: "30000" },
  { label: "40.000 o más", value: "40000" },
];

export function FilterBar({
  brands,
  showPuffs = true,
  showSabor = true,
}: {
  brands: Brand[];
  showPuffs?: boolean;
  showSabor?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Cambia UN filtro en la URL, preservando los demás
  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key); // filtro vacío = sacarlo de la URL
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const hasFilters =
    searchParams.get("marca") ||
    (showPuffs && searchParams.get("puffs")) ||
    (showSabor && searchParams.get("sabor"));

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Marca */}
      <select
        value={searchParams.get("marca") ?? ""}
        onChange={(e) => setFilter("marca", e.target.value)}
        className="rounded-lg border border-surface-elevated bg-surface-card px-3 py-2 text-sm outline-none focus:border-primary"
      >
        <option value="">Todas las marcas</option>
        {brands.map((b) => (
          <option key={b.slug} value={b.slug}>
            {b.name}
          </option>
        ))}
      </select>

      {/* Puffs (solo tiene sentido en vapers) */}
      {showPuffs && (
        <select
          value={searchParams.get("puffs") ?? ""}
          onChange={(e) => setFilter("puffs", e.target.value)}
          className="rounded-lg border border-surface-elevated bg-surface-card px-3 py-2 text-sm outline-none focus:border-primary"
        >
          {PUFFS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {/* Sabor (solo tiene sentido donde las variantes son sabores) */}
      {showSabor && (
        <input
          type="search"
          placeholder="Buscar sabor..."
          defaultValue={searchParams.get("sabor") ?? ""}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setFilter("sabor", e.currentTarget.value);
            }
          }}
          className="rounded-lg border border-surface-elevated bg-surface-card px-3 py-2 text-sm outline-none focus:border-primary"
        />
      )}

      {hasFilters && (
        <button
          onClick={() => router.push(pathname)}
          className="text-sm text-muted underline hover:text-foreground"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}