import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";

export const CATALOG_TAG = "catalog";


const CATALOG_TTL = 300;

export type ProductFilters = {
  categoria?: string;        // slug de categoría: "vapers"
  excludeCategoria?: string; // todo MENOS esta categoría (nav mobile "otros")
  marca?: string;            // slug de marca: "elf-bar"
  puffs?: number;            // puffs mínimos: 30000
  sabor?: string;            // texto a buscar en nombres de variantes
};

const PRODUCT_CARD_SELECT =
  "id, name, base_price, brands!inner(name, slug), categories!inner(slug), product_variants!inner(stock, name, is_active), product_images(url, sort_order)";

const fetchActiveProducts = unstable_cache(
  async (filters: ProductFilters) => {
    // Cliente sin cookies
    const supabase = createPublicClient();

    let query = supabase
      .from("products")
      .select(PRODUCT_CARD_SELECT)
      .eq("is_active", true)
      .eq("product_variants.is_active", true)
      .gt("product_variants.stock", 0)
      .order("created_at", { ascending: false })
      // Red de seguridad
      .limit(60);

    if (filters.categoria) {
      query = query.eq("categories.slug", filters.categoria);
    } else if (filters.excludeCategoria) {
      query = query.neq("categories.slug", filters.excludeCategoria);
    }

    if (filters.marca) {
      query = query.eq("brands.slug", filters.marca);
    }

    if (filters.puffs) {
      query = query.gte("attributes->>puffs", filters.puffs);
    }

    if (filters.sabor) {
      query = query.ilike("product_variants.name", `%${filters.sabor}%`);
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    return data ?? [];
  },
  ["active-products"],
  { revalidate: CATALOG_TTL, tags: [CATALOG_TAG] }
);

export async function getActiveProducts(filters: ProductFilters = {}) {
  try {
    return { data: await fetchActiveProducts(filters), error: null };
  } catch (e) {
    console.error("Error al traer productos:", e);
    return { data: [], error: e as Error };
  }
}

export async function searchActiveProducts(term: string) {
  const supabase = await createClient();

  const safeTerm = term.replace(/[,()%_*\\]/g, " ").trim();

  if (!safeTerm) {
    return { data: [], error: null };
  }

  const pattern = `%${safeTerm}%`;

  return supabase
    .from("products")
    .select(PRODUCT_CARD_SELECT)
    .eq("is_active", true)
    .eq("product_variants.is_active", true)
    .gt("product_variants.stock", 0)
    .or(
      `name.ilike.${pattern},model.ilike.${pattern},description.ilike.${pattern}`
    )
    .order("name")
    .limit(48);
}

export const getBrandsForFilter = unstable_cache(
  async (
    filters: Pick<ProductFilters, "categoria" | "excludeCategoria"> = {}
  ) => {
    const supabase = createPublicClient();

    // Mismas condiciones que getActiveProducts: si un producto no entra en la
    // grilla, su marca tampoco tiene por qué estar en el filtro.
    let query = supabase
      .from("products")
      .select(
        "brands!inner(name, slug), categories!inner(slug), product_variants!inner(stock, is_active)"
      )
      .eq("is_active", true)
      .eq("product_variants.is_active", true)
      .gt("product_variants.stock", 0);

    if (filters.categoria) {
      query = query.eq("categories.slug", filters.categoria);
    } else if (filters.excludeCategoria) {
      query = query.neq("categories.slug", filters.excludeCategoria);
    }

    const { data } = await query;
    if (!data) return [];

    // Un producto por fila, pero varios productos comparten marca: deduplicamos.
    const unique = new Map<string, { name: string; slug: string }>();
    for (const row of data) {
      if (row.brands) {
        unique.set(row.brands.slug, row.brands);
      }
    }

    return [...unique.values()].sort((a, b) =>
      a.name.localeCompare(b.name, "es")
    );
  },
  ["brands-for-filter"],
  { revalidate: CATALOG_TTL, tags: [CATALOG_TAG] }
);