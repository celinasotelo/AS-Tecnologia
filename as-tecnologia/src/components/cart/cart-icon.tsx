"use client";

import { ShoppingCart } from "lucide-react";
import { useCart, useCartHydrated, selectCartCount } from "@/lib/store/cart";

export function CartIcon() {
  const count = useCart(selectCartCount);
  const openCart = useCart((state) => state.openCart);

  // Sin esta guarda, el globito con el número aparecería en el primer render
  // del cliente pero no en el HTML del servidor, y React tiraría error de
  // hidratación. El porqué completo está en el store, al lado del hook.
  const hydrated = useCartHydrated();

  return (
    <button
      onClick={openCart}
      aria-label="Mi carrito"
      className="relative rounded-lg p-2 hover:bg-surface-elevated"
    >
      <ShoppingCart size={22} />
      {hydrated && count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold">
          {count}
        </span>
      )}
    </button>
  );
}
