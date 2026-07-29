"use server";

import { createClient } from "@/lib/supabase/server";

type OrderItemInput = {
  variantId: string;
  quantity: number;
};

type CreateOrderInput = {
  customerName: string;
  customerPhone: string;
  items: OrderItemInput[];
};

type CreateOrderResult =
  | { ok: true; orderId: string; total: number }
  | { ok: false; error: string };

export async function createOrder(
  input: CreateOrderInput
): Promise<CreateOrderResult> {
  const supabase = await createClient();

  if (input.items.length === 0) {
    return { ok: false, error: "El carrito está vacío." };
  }

  // 1. Traer los precios REALES desde la DB
  const variantIds = input.items.map((i) => i.variantId);
  const { data: variants, error: variantsError } = await supabase
    .from("product_variants")
    .select("id, price_override, stock, products(base_price)")
    .in("id", variantIds);

  if (variantsError || !variants) {
    console.error("Error al leer variantes:", variantsError);
    return { ok: false, error: "No se pudieron verificar los productos." };
  }

  // 2. Calcular el total en el servidor
  let total = 0;
  const orderItems = input.items.map((item) => {
    const variant = variants.find((v) => v.id === item.variantId);
    if (!variant) {
      throw new Error(`Variante no encontrada: ${item.variantId}`);
    }
    const unitPrice = variant.price_override ?? variant.products.base_price;
    total += unitPrice * item.quantity;
    return {
      variant_id: item.variantId,
      quantity: item.quantity,
      unit_price: unitPrice,
    };
  });

  // 3. Crear la orden
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_name: input.customerName,
      customer_phone: input.customerPhone,
      status: "pending_whatsapp",
      total,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    console.error("Error al crear orden:", orderError);
    return { ok: false, error: "No se pudo crear la orden." };
  }

  // 4. Crear los items
  const { error: itemsError } = await supabase.from("order_items").insert(
    orderItems.map((item) => ({ ...item, order_id: order.id }))
  );

  if (itemsError) {
    console.error("Error al crear items:", itemsError);
    return { ok: false, error: "No se pudieron guardar los productos." };
  }

  return { ok: true, orderId: order.id, total };
}