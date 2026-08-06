import { createClient } from "@/lib/supabase/server";

export type ProductFilters = {
  categoria?: string;        // slug de categoría: "vapers"
  excludeCategoria?: string; // todo MENOS esta categoría (nav mobile "otros")
  marca?: string;            // slug de marca: "elf-bar"
  puffs?: number;            // puffs mínimos: 30000
  sabor?: string;            // texto a buscar en nombres de variantes
};

const PRODUCT_CARD_SELECT =
  "id, name, base_price, brands!inner(name, slug), categories!inner(slug), product_variants!inner(stock, name, is_active), product_images(url, sort_order)";

export async function getActiveProducts(filters: ProductFilters = {}) {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(PRODUCT_CARD_SELECT)
    .eq("is_active", true)
    .eq("product_variants.is_active", true)
    .gt("product_variants.stock", 0)
    .order("created_at", { ascending: false });

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

  return query;
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

export async function getBrandsForFilter() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("brands")
    .select("name, slug")
    .order("name");
  return data ?? [];
}