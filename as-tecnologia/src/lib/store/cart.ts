import { create } from "zustand";
import { persist } from "zustand/middleware";

// Un item del carrito: una variante concreta con su cantidad.
// Guardamos todo lo necesario para mostrar el carrito sin volver a la DB.
export type CartItem = {
  variantId: string;
  productId: string;
  productName: string;
  variantName: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clear: () => void;
  openCart: () => void;         
  closeCart: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.variantId === item.variantId
          );

          // Si ya está en el carrito, sumamos cantidad en vez de duplicar
          if (existing) {
            return {
              isOpen: true,
              items: state.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }

          return { isOpen: true, items: [...state.items, { ...item, quantity }] };
        }),

      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        })),

      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.variantId === variantId ? { ...i, quantity } : i
          ),
        })),

      clear: () => set({ items: [] }),
    }),
    {
      name: "as-tecnologia-cart", // la clave con la que se guarda en localStorage
      partialize: (state) => ({ items: state.items}),
    }
  )
);

// Selectores derivados: calculan cosas a partir de los items
export const selectCartCount = (state: CartState) =>
  state.items.reduce((total, item) => total + item.quantity, 0);

export const selectCartTotal = (state: CartState) =>
  state.items.reduce((total, item) => total + item.price * item.quantity, 0);