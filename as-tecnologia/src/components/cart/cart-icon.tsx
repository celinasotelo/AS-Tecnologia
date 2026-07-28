"use client";

import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/store/cart";

export function CartIcon() {
  const items = useCart((state) => state.items);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const count = mounted
    ? items.reduce((total, item) => total + item.quantity, 0)
    : 0;

  return (
    <button
      aria-label="Mi carrito"
      className="relative rounded-lg p-2 hover:bg-surface-elevated"
    >
      <ShoppingCart size={22} />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold">
          {count}
        </span>
      )}
    </button>
  );
}