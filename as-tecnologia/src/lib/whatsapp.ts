import type { CartItem } from "@/lib/store/cart";
import { formatPrice } from "@/lib/format";
import { contact } from "@/lib/contact";
import { local } from "@/lib/negocio";
import type { DeliveryMethod, PaymentMethod } from "@/lib/checkout";

type OrderMessageInput = {
  orderId: string;
  items: CartItem[];
  // variantId -> precio unitario calculado por el servidor. Si una variante no
  // está acá, se usa el precio que traía el carrito.
  prices: Record<string, number>;
  total: number;
  customerName: string;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  deliveryAddress?: string;
  deliveryNotes?: string;
};

export function buildWhatsAppLink(input: OrderMessageInput): string {
  const lines: string[] = [
    `¡Hola! Soy ${input.customerName}.`,
    `Pedido *#${input.orderId.slice(0, 8)}*`,
    "",
  ];

  // Los precios salen de `prices` (los que calculó el servidor y quedaron
  // guardados en la orden) y no de item.price, que es lo que el carrito tenía
  // cacheado. Si el precio cambió en la DB mientras el producto estaba en el
  // carrito, sin esto los renglones no sumaban el total y el dueño recibía un
  // mensaje que no cerraba.
  for (const item of input.items) {
    const unitPrice = input.prices[item.variantId] ?? item.price;
    lines.push(
      `• ${item.quantity}x ${item.productName} (${item.variantName}) — ${formatPrice(
        unitPrice * item.quantity
      )}`
    );
  }

  lines.push("", `*Total: ${formatPrice(input.total)}*`, "");

  // Entrega
  if (input.deliveryMethod === "delivery") {
    lines.push("📦 *Envío a domicilio*");
    if (input.deliveryAddress) lines.push(`Dirección: ${input.deliveryAddress}`);
    if (input.deliveryNotes) lines.push(`Referencia: ${input.deliveryNotes}`);
  } else {
    lines.push("🏪 *Retiro en el local*", local.direccion);
  }

  lines.push("");

  // Pago
  if (input.paymentMethod === "transfer") {
    lines.push("💳 *Pago: Transferencia*", "Ahora te paso el comprobante.");
  } else if (input.deliveryMethod === "delivery") {
    lines.push("💵 *Pago: Efectivo* (le pago al que me lo trae)");
  } else {
    lines.push("💵 *Pago: Efectivo* (pago al retirar)");
  }

  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${contact.whatsappNumber}?text=${text}`;
}
