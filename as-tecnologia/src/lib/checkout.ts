// Formas de entrega y de pago del checkout.
//
// Mismo molde que order-status.ts: el tipo manda (TypeScript no deja escribir
// "pickpu" en ningún lado) y las etiquetas viven una sola vez, así el wizard,
// la server action, el mensaje de WhatsApp y el panel admin dicen lo mismo.
//
// Los valores son los que se guardan en la DB, y están atados a los CHECK
// constraints de la tabla orders: si acá aparece un valor nuevo, primero hay
// que ampliarlo en Supabase o el insert falla.

export type DeliveryMethod = "pickup" | "delivery";

// "mercadopago" entra acá cuando conectemos la API.
export type PaymentMethod = "cash" | "transfer";

export const DELIVERY_METHODS: DeliveryMethod[] = ["pickup", "delivery"];
export const PAYMENT_METHODS: PaymentMethod[] = ["cash", "transfer"];

export const DELIVERY_LABELS: Record<DeliveryMethod, string> = {
  pickup: "Retiro en el local",
  delivery: "Envío a domicilio",
};

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: "Efectivo",
  transfer: "Transferencia",
};

// Guardas de tipo. La server action recibe lo que le mande el navegador, así
// que no puede confiar en que el string sea uno de los válidos: esto convierte
// un `string` cualquiera en un DeliveryMethod / PaymentMethod comprobado.
export function isDeliveryMethod(value: string): value is DeliveryMethod {
  return (DELIVERY_METHODS as string[]).includes(value);
}

export function isPaymentMethod(value: string): value is PaymentMethod {
  return (PAYMENT_METHODS as string[]).includes(value);
}
