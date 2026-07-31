import { createClient } from "@/lib/supabase/server";

export async function getOrders() {
  const supabase = await createClient();

  return supabase
    .from("orders")
    .select(
      `id, customer_name, customer_phone, status, total, created_at,
       order_items(quantity, unit_price,
         product_variants(name, products(name)))`
    )
    .order("created_at", { ascending: false });
}