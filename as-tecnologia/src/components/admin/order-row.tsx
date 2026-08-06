"use client";

import { useState, useTransition } from "react";
import { formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from "@/lib/order-status";
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
  order_items: OrderItem[];
};

export function OrderRow({ order }: { order: Order }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isEditable = order.status === "pending_whatsapp";

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

      {/* Items */}
      <ul className="mt-3 space-y-1 border-t border-surface-elevated pt-3 text-sm">
        {order.order_items.map((item, i) => (
          <li key={i} className="flex justify-between text-muted">
            <span>
              {item.quantity}x {item.product_variants?.products?.name}
              {" — "}
              {item.product_variants?.name}
            </span>
            <span>{formatPrice(item.unit_price * item.quantity)}</span>
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