"use client";

import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { useCart, selectCartCount } from "@/lib/store/cart";

export function CartIcon() {
  const count = useCart(selectCartCount);
  const openCart = useCart((state) => state.openCart);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <button
      onClick={openCart}
      aria-label="Mi carrito"
      className="relative rounded-lg p-2 hover:bg-surface-elevated"
    >
      <ShoppingCart size={22} />
      {mounted && count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold">
          {count}
        </span>
      )}
    </button>
  );
}