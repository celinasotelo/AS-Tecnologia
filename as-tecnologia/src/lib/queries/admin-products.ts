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