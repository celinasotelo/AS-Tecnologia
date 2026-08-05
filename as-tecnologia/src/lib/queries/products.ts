import { createClient } from "@/lib/supabase/server";

type CategoryFilter = { slug: string } | { excludeSlug: string };

// Columnas que necesita ProductCard. Compartidas entre el listado y la búsqueda
// para que ambas devuelvan exactamente la misma forma de datos.
const PRODUCT_CARD_SELECT =
  "id, name, base_price, brands(name), categories!inner(slug), product_variants!inner(stock, is_active), product_images(url, sort_order)";

export async function getActiveProducts(filter?: CategoryFilter) {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(PRODUCT_CARD_SELECT)
    .eq("is_active", true)
    .eq("product_variants.is_active", true)
    .gt("product_variants.stock", 0)
    .order("created_at", { ascending: false });

  if (filter && "slug" in filter) {
    query = query.eq("categories.slug", filter.slug);
  } else if (filter && "excludeSlug" in filter) {
    query = query.neq("categories.slug", filter.excludeSlug);
  }

  return query;
}

export async function searchActiveProducts(term: string) {
  const supabase = await createClient();

  // PostgREST arma el .or() como texto: las comas, paréntesis y comodines del
  // usuario romperían la sintaxis del filtro, así que los saco antes.
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
