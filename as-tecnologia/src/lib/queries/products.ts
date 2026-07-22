import { createClient } from "@/lib/supabase/server";

export async function getActiveProducts() {
  const supabase = await createClient();

  return supabase
    .from("products")
    .select(
      "id, name, base_price, brands(name), product_variants(stock), product_images(url, sort_order)"
    )
    .order("created_at", { ascending: false });
}