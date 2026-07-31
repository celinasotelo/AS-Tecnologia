import { getOrders } from "@/lib/queries/orders";
import { OrderRow } from "@/components/admin/order-row";

export default async function OrdenesPage() {
  const { data: orders, error } = await getOrders();

  if (error) {
    return <p className="text-danger">Error al cargar las órdenes.</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Órdenes</h1>

      {orders.length === 0 ? (
        <p className="mt-4 text-muted">Todavía no hay pedidos.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}