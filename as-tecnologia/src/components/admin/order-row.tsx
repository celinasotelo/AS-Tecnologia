import { formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from "@/lib/order-status";

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
  const date = new Date(order.created_at).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

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
    </div>
  );
}