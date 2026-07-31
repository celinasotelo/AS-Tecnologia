import { createClient } from "@/lib/supabase/server";

export async function getAllProductsForAdmin() {
  const supabase = await createClient();

  return supabase
    .from("products")
    .select(
      `id, name, model, base_price, is_active,
       brands(name),
       product_variants(id, name, stock, is_active)`
    )
    .order("created_at", { ascending: false });
}

export async function getBrandsAndCategories() {
  const supabase = await createClient();

  const [brands, categories] = await Promise.all([
    supabase.from("brands").select("id, name").order("name"),
    supabase.from("categories").select("id, name").order("name"),
  ]);

  return {
    brands: brands.data ?? [],
    categories: categories.data ?? [],
  };
}