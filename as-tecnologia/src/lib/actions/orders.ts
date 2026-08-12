"use server";

// updateTag y no revalidateTag: updateTag es el que da read-your-own-writes
// dentro de una Server Action (el cambio se ve al toque, no en el próximo
// pedido). En Next 16 revalidateTag además exige un segundo argumento.
import { revalidatePath, updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CATALOG_TAG } from "@/lib/queries/products";
import {
  isDeliveryMethod,
  isPaymentMethod,
  type DeliveryMethod,
  type PaymentMethod,
} from "@/lib/checkout";

type OrderItemInput = {
  variantId: string;
  quantity: number;
};

type CreateOrderInput = {
  customerName: string;
  customerPhone: string;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  // Solo cuando deliveryMethod es "delivery".
  deliveryAddress?: string;
  deliveryNotes?: string;
  items: OrderItemInput[];
};

type CreateOrderResult =
  | {
      ok: true;
      orderId: string;
      total: number;
      // variantId -> precio unitario que usó el servidor. El cliente lo necesita
      // para armar el mensaje de WhatsApp con los mismos números que se
      // guardaron, y no con los que tenía cacheados en el carrito.
      prices: Record<string, number>;
    }
  | { ok: false; error: string };

export async function createOrder(
  input: CreateOrderInput
): Promise<CreateOrderResult> {
  const supabase = await createClient();

  // 1. Validar lo que llegó.
  //
  //    El wizard ya valida para darle feedback al usuario mientras completa,
  //    pero esto no es una repetición al pedo: una server action es un endpoint
  //    público, cualquiera puede llamarla con lo que quiera. La validación del
  //    cliente es comodidad; esta es la que manda.
  if (input.items.length === 0) {
    return { ok: false, error: "El carrito está vacío." };
  }

  const customerName = input.customerName.trim();
  const customerPhone = input.customerPhone.trim();

  if (!customerName || !customerPhone) {
    return { ok: false, error: "Completá tu nombre y teléfono." };
  }

  if (!isDeliveryMethod(input.deliveryMethod)) {
    return { ok: false, error: "Elegí cómo querés recibir el pedido." };
  }

  if (!isPaymentMethod(input.paymentMethod)) {
    return { ok: false, error: "Elegí cómo querés pagar." };
  }

  // En retiro la dirección se descarta aunque venga: el pedido no se envía a
  // ningún lado y guardarla solo confundiría al que lea la orden en el panel.
  const isDelivery = input.deliveryMethod === "delivery";
  const deliveryAddress = isDelivery ? (input.deliveryAddress ?? "").trim() : "";
  const deliveryNotes = isDelivery ? (input.deliveryNotes ?? "").trim() : "";

  if (isDelivery && !deliveryAddress) {
    return { ok: false, error: "Ingresá la dirección de entrega." };
  }

  // 2. Guardar el pedido, todo adentro de la función create_order().
  //
  //    El rol anónimo NO tiene ninguna política sobre orders ni order_items:
  //    no puede insertar, leer ni modificar nada. Lo único que puede hacer es
  //    ejecutar esta función, que corre con security definer (o sea, con los
  //    permisos de quien la creó) y por eso sí puede escribir.
  //
  //    Eso cambia dónde está la frontera de seguridad. Antes cualquiera con la
  //    clave anónima —que viaja en el navegador y es pública por diseño— podía
  //    postear órdenes directo a la API con el total que se le antojara. Ahora
  //    el único camino de escritura es esta función, que valida los datos y
  //    calcula el total ella misma leyendo los precios de la base.
  //
  //    De paso resuelve otras dos cosas:
  //    - Atomicidad: el cuerpo de una función es una sola transacción, así que
  //      nunca más queda una orden guardada sin sus productos.
  //    - Latencia: un viaje a Supabase en vez de tres (~250 ms en lugar de
  //      ~750). En el botón más importante del sitio, se nota.
  const { data, error } = await supabase.rpc("create_order", {
    p_customer_name: customerName,
    p_customer_phone: customerPhone,
    p_delivery_method: input.deliveryMethod,
    p_payment_method: input.paymentMethod,
    p_delivery_address: deliveryAddress,
    p_delivery_notes: deliveryNotes,
    p_items: input.items.map((item) => ({
      variant_id: item.variantId,
      quantity: item.quantity,
    })),
  });

  if (error) {
    console.error("Error al crear la orden:", error);
    // P0001 es el código que Postgres le pone a los `raise exception` nuestros,
    // y esos mensajes están escritos para que los lea un cliente ("Alguno de
    // los productos ya no está disponible"). Cualquier otro código es un
    // problema interno: se registra en el servidor y afuera va algo genérico.
    return {
      ok: false,
      error:
        error.code === "P0001" ? error.message : "No se pudo crear la orden.",
    };
  }

  // La función devuelve jsonb, que del lado de TypeScript llega como Json. El
  // cast dice qué forma tiene: es un contrato con el SQL, no una verificación.
  const result = data as {
    order_id: string;
    total: number;
    prices: Record<string, number>;
  } | null;

  if (!result) {
    console.error("create_order no devolvió datos.");
    return { ok: false, error: "No se pudo crear la orden." };
  }

  // El pedido tiene que aparecerle al dueño ya mismo, no en el próximo fetch.
  revalidatePath("/admin/ordenes");

  return {
    ok: true,
    orderId: result.order_id,
    total: result.total,
    prices: result.prices,
  };
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

  // 5. Refrescar el panel y el catálogo público. El tag es lo que tira el caché
  //    de datos: al descontar stock, una variante puede quedar en 0 y el
  //    producto tiene que desaparecer de la grilla (o mostrar "Sin stock").
  updateTag(CATALOG_TAG);
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