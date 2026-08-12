"use client";

import { useState, useTransition } from "react";
import { MapPin } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from "@/lib/order-status";
import { DELIVERY_LABELS, PAYMENT_LABELS } from "@/lib/checkout";
import { finalizeOrder, cancelOrder } from "@/lib/actions/orders";

type OrderItem = {
  quantity: number;
  unit_price: number;
  product_variants: {
    name: string;
    products: { name: string } | null;
  } | null;
};

type Order = {
  id: string;
  customer_name: string;
  customer_phone: string;
  status: string;
  total: number;
  created_at: string;
  // Vienen tipadas como string y no como DeliveryMethod/PaymentMethod porque es
  // lo que Supabase devuelve: la columna es text y el CHECK no viaja al tipo.
  delivery_method: string;
  payment_method: string;
  delivery_address: string | null;
  delivery_notes: string | null;
  order_items: OrderItem[];
};

export function OrderRow({ order }: { order: Order }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isEditable = order.status === "pending_whatsapp";
  const isDelivery = order.delivery_method === "delivery";

  const date = new Date(order.created_at).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleFinalize = () => {
    if (
      !confirm(
        `¿Finalizar la orden de ${order.customer_name}? Se va a descontar el stock de los productos.`
      )
    )
      return;
    setError(null);
    startTransition(async () => {
      const result = await finalizeOrder(order.id);
      if (!result.ok) {
        setError(result.error);
      }
    });
  };

  const handleCancel = () => {
    if (!confirm(`¿Cancelar la orden de ${order.customer_name}?`)) return;
    setError(null);
    startTransition(async () => {
      const result = await cancelOrder(order.id);
      if (!result.ok) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="rounded-xl bg-surface-card p-4">
      {/* Cabecera de la orden */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-semibold">{order.customer_name}</p>
          <p className="text-sm text-muted">{order.customer_phone}</p>
        </div>
        <div className="text-right">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              ORDER_STATUS_STYLES[order.status] ?? ""
            }`}
          >
            {ORDER_STATUS_LABELS[order.status] ?? order.status}
          </span>
          <p className="mt-1 text-xs text-muted">{date}</p>
        </div>
      </div>

      {/* Entrega y pago. Los chips van juntos porque son la primera decisión
          del dueño al leer la orden: ¿la preparo para el mostrador o la mando? */}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            isDelivery
              ? "bg-primary/15 text-primary-light"
              : "bg-surface-elevated text-muted"
          }`}
        >
          {DELIVERY_LABELS[order.delivery_method as "pickup" | "delivery"] ??
            order.delivery_method}
        </span>
        <span className="rounded-full bg-surface-elevated px-2 py-0.5 text-xs font-medium text-muted">
          {PAYMENT_LABELS[order.payment_method as "cash" | "transfer"] ??
            order.payment_method}
        </span>
      </div>

      {/* La dirección solo tiene sentido en los envíos. */}
      {isDelivery && order.delivery_address && (
        <p className="mt-2 flex items-start gap-1.5 text-sm">
          <MapPin size={15} className="mt-0.5 shrink-0 text-muted" />
          <span>
            {order.delivery_address}
            {order.delivery_notes && (
              <span className="block text-muted">{order.delivery_notes}</span>
            )}
          </span>
        </p>
      )}

      {/* Items. gap-3 + shrink-0 en el precio: sin eso un nombre largo de
          producto le come el ancho y lo parte en dos renglones. */}
      <ul className="mt-3 space-y-1 border-t border-surface-elevated pt-3 text-sm">
        {order.order_items.map((item, i) => (
          <li key={i} className="flex justify-between gap-3 text-muted">
            <span className="min-w-0">
              {item.quantity}x {item.product_variants?.products?.name}
              {" — "}
              {item.product_variants?.name}
            </span>
            <span className="shrink-0">
              {formatPrice(item.unit_price * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      {/* Total */}
      <div className="mt-3 flex justify-between border-t border-surface-elevated pt-3 font-semibold">
        <span>Total</span>
        <span>{formatPrice(order.total)}</span>
      </div>

      {/* Acciones: solo mientras la orden sigue pendiente */}
      {isEditable && (
        <div className="mt-3 flex items-center gap-2 border-t border-surface-elevated pt-3">
          <button
            onClick={handleFinalize}
            disabled={isPending}
            className="rounded-md bg-success/20 px-3 py-1.5 text-sm font-medium text-success transition hover:bg-success/30 disabled:opacity-50"
          >
            {isPending ? "..." : "Finalizar"}
          </button>
          <button
            onClick={handleCancel}
            disabled={isPending}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-muted transition hover:text-danger disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}