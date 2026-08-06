export type OrderStatus =
  | "pending_whatsapp"
  | "confirmed"
  | "delivered"
  | "cancelled";

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending_whatsapp: "Pendiente",
  confirmed: "Confirmada",
  delivered: "Finalizada",
  cancelled: "Cancelada",
};

export const ORDER_STATUS_STYLES: Record<string, string> = {
  pending_whatsapp: "bg-primary/15 text-primary-light",
  confirmed: "bg-success/15 text-success",
  delivered: "bg-success/15 text-success",
  cancelled: "bg-danger/15 text-danger",
};