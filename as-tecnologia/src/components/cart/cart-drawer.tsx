"use client";

import { useEffect } from "react";
import Image from "next/image";
import { X, Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { useState } from "react";
import { useCart, selectCartTotal } from "@/lib/store/cart";
import { createOrder } from "@/lib/actions/orders";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export function CartDrawer() {
  const isOpen = useCart((state) => state.isOpen);
  const closeCart = useCart((state) => state.closeCart);
  const items = useCart((state) => state.items);
  const updateQuantity = useCart((state) => state.updateQuantity);
  const removeItem = useCart((state) => state.removeItem);
  const total = useCart(selectCartTotal);
  const clear = useCart((state) => state.clear);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setError(null);

    if (!name.trim() || !phone.trim()) {
      setError("Completá tu nombre y teléfono.");
      return;
    }

    setLoading(true);

    const result = await createOrder({
      customerName: name.trim(),
      customerPhone: phone.trim(),
      items: items.map((i) => ({
        variantId: i.variantId,
        quantity: i.quantity,
      })),
    });

    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    // La orden ya está guardada. Ahora sí, abrir WhatsApp.
    const link = buildWhatsAppLink(result.orderId, items, result.total, name.trim());
    window.open(link, "_blank");

    // Limpiar el carrito y cerrar
    clear();
    closeCart();
  };

  // Cerrar con la tecla Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeCart]);

  return (
    <>
      {/* Fondo oscuro (backdrop). Click cierra. */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-300
          ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />

      {/* Panel deslizante.
          h-dvh y no h-full: en celular la barra de direcciones del navegador
          aparece y desaparece al scrollear, y con 100% el botón de finalizar
          compra queda tapado abajo. dvh mide el alto que se ve de verdad. */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-dvh w-full max-w-md flex-col bg-surface-card shadow-xl transition-transform duration-300
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header del drawer */}
        <div className="flex items-center justify-between border-b border-surface-elevated p-4">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <ShoppingCart size={20} />
            Mi carrito
          </h2>
          <button
            onClick={closeCart}
            aria-label="Cerrar carrito"
            className="rounded-lg p-2 hover:bg-surface-elevated"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-muted">
            <ShoppingCart size={48} className="opacity-30" />
            <p>Tu carrito está vacío.</p>
          </div>
        ) : (
          <>
            {/* Lista de items (scrolleable) */}
            <div className="flex-1 overflow-y-auto p-4">
              <ul className="flex flex-col gap-4">
                {items.map((item) => (
                  <li key={item.variantId} className="flex gap-3">
                    {/* Imagen */}
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white">
                      {item.imageUrl && (
                        <Image
                          src={item.imageUrl}
                          alt={item.productName}
                          fill
                          sizes="64px"
                          className="object-contain"
                        />
                      )}
                    </div>

                    {/* Info + controles */}
                    <div className="flex flex-1 flex-col">
                      <p className="text-sm font-medium leading-snug">
                        {item.productName}
                      </p>
                      <p className="text-xs text-muted">{item.variantName}</p>

                      <div className="mt-auto flex items-center justify-between">
                        {/* Cantidad */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              item.quantity > 1
                                ? updateQuantity(item.variantId, item.quantity - 1)
                                : removeItem(item.variantId)
                            }
                            aria-label="Restar uno"
                            className="rounded-md border border-surface-elevated p-1 hover:bg-surface-elevated"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-6 text-center text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.variantId, item.quantity + 1)
                            }
                            aria-label="Sumar uno"
                            className="rounded-md border border-surface-elevated p-1 hover:bg-surface-elevated"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        {/* Precio de la línea */}
                        <span className="text-sm font-semibold">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>

                    {/* Eliminar */}
                    <button
                      onClick={() => removeItem(item.variantId)}
                      aria-label="Eliminar del carrito"
                      className="self-start rounded-md p-1 text-muted hover:text-danger"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer con total, formulario y checkout */}
            <div className="border-t border-surface-elevated p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-muted">Total</span>
                <span className="text-xl font-bold">{formatPrice(total)}</span>
              </div>

              {/* Formulario mínimo */}
              <div className="mb-3 flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-lg border border-surface-elevated bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <input
                  type="tel"
                  placeholder="Tu teléfono"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="rounded-lg border border-surface-elevated bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              {error && <p className="mb-2 text-sm text-danger">{error}</p>}

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary-light disabled:opacity-50"
              >
                {loading ? "Procesando..." : "Finalizar compra por WhatsApp"}
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}