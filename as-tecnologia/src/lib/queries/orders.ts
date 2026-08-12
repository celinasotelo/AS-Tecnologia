import { createClient } from "@/lib/supabase/server";

export async function getOrders() {
  const supabase = await createClient();

  return supabase
    .from("orders")
    .select(
      `id, customer_name, customer_phone, status, total, created_at,
       delivery_method, payment_method, delivery_address, delivery_notes,
       order_items(quantity, unit_price,
         product_variants(name, products(name)))`
    )
    .neq("status", "cancelled")
    .order("created_at", { ascending: false });
}