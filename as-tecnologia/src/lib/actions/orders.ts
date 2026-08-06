"use server";

import { revalidatePath } from "next/cache";
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

type OrderActionResult = { ok: true } | { ok: false; error: string };

// Cancelar: la orden queda guardada como "cancelled" pero deja de listarse.
// No toca el stock: esas unidades nunca salieron del local.
export async function cancelOrder(orderId: string): Promise<OrderActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", orderId)
    .eq("status", "pending_whatsapp");

  if (error) {
    console.error("Error al cancelar orden:", error);
    return { ok: false, error: "No se pudo cancelar la orden." };
  }

  revalidatePath("/admin/ordenes");
  return { ok: true };
}

// Finalizar: marca la venta como concretada y descuenta del stock lo que se llevó el cliente.
export async function finalizeOrder(
  orderId: string
): Promise<OrderActionResult> {
  const supabase = await createClient();

  // 1. Marcar como finalizada. El .eq("status", ...) es la guardia contra
  //    descontar dos veces: si la orden ya no está pendiente, no matchea
  //    ninguna fila y salimos antes de tocar el stock.
  const { data: updated, error: statusError } = await supabase
    .from("orders")
    .update({ status: "delivered" })
    .eq("id", orderId)
    .eq("status", "pending_whatsapp")
    .select("id");

  if (statusError) {
    console.error("Error al finalizar orden:", statusError);
    return { ok: false, error: "No se pudo finalizar la orden." };
  }

  if (!updated || updated.length === 0) {
    return { ok: false, error: "La orden ya no está pendiente." };
  }

  // 2. Traer lo que se vendió
  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("variant_id, quantity")
    .eq("order_id", orderId);

  if (itemsError || !items) {
    console.error("Error al leer items de la orden:", itemsError);
    // La orden ya quedó marcada pero el stock sigue intacto: la devolvemos
    // a pendiente para que se pueda reintentar.
    await supabase
      .from("orders")
      .update({ status: "pending_whatsapp" })
      .eq("id", orderId);
    return { ok: false, error: "No se pudieron leer los productos de la orden." };
  }

  // 3. Sumar cantidades por variante (la misma variante puede venir en varias filas)
  const quantityByVariant = new Map<string, number>();
  for (const item of items) {
    const previous = quantityByVariant.get(item.variant_id) ?? 0;
    quantityByVariant.set(item.variant_id, previous + item.quantity);
  }

  const { data: variants, error: variantsError } = await supabase
    .from("product_variants")
    .select("id, stock, product_id")
    .in("id", [...quantityByVariant.keys()]);

  if (variantsError || !variants) {
    console.error("Error al leer variantes:", variantsError);
    await supabase
      .from("orders")
      .update({ status: "pending_whatsapp" })
      .eq("id", orderId);
    return { ok: false, error: "No se pudo leer el stock de los productos." };
  }

  // 4. Descontar. Math.max(0, ...) evita stock negativo si la orden pedía
  //    más unidades de las que había cargadas.
  let stockError = false;
  for (const variant of variants) {
    const quantity = quantityByVariant.get(variant.id) ?? 0;
    const { error } = await supabase
      .from("product_variants")
      .update({ stock: Math.max(0, variant.stock - quantity) })
      .eq("id", variant.id);

    if (error) {
      console.error(`Error al descontar stock de ${variant.id}:`, error);
      stockError = true;
    }
  }

  // 5. Refrescar el panel y el catálogo público
  revalidatePath("/admin/ordenes");
  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  revalidatePath("/");
  for (const productId of new Set(variants.map((v) => v.product_id))) {
    revalidatePath(`/productos/${productId}`);
  }

  if (stockError) {
    return {
      ok: false,
      error: "La orden se finalizó pero no se pudo descontar todo el stock.",
    };
  }

  return { ok: true };
}