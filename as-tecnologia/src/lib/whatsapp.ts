import type { CartItem } from "@/lib/store/cart";
import { formatPrice } from "@/lib/format";

const OWNER_PHONE = process.env.NEXT_PUBLIC_OWNER_WHATSAPP ?? "";

export function buildWhatsAppLink(
  orderId: string,
  items: CartItem[],
  total: number,
  customerName: string
): string {
  const lines = [
    `¡Hola! Soy ${customerName}.`,
    `Quiero hacer el pedido *#${orderId.slice(0, 8)}*:`,
    "",
    ...items.map(
      (item) =>
        `• ${item.quantity}x ${item.productName} (${item.variantName}) — ${formatPrice(
          item.price * item.quantity
        )}`
    ),
    "",
    `*Total: ${formatPrice(total)}*`,
  ];

  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${OWNER_PHONE}?text=${text}`;
}