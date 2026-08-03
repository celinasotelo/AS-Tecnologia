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

export async function getProductForEdit(id: string) {
  const supabase = await createClient();

  return supabase
    .from("products")
    .select(
      `id, name, model, description, base_price, category_id, brand_id, attributes,
       product_variants(id, name, price_override, stock, is_active)`
    )
    .eq("id", id)
    .single();
}