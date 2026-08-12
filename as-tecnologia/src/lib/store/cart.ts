"use client";

import { useSyncExternalStore } from "react";
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

// --- Hidratación -----------------------------------------------------------
//
// El carrito vive en localStorage: el servidor arma el HTML con el carrito
// vacío y tu navegador puede tener 3 productos. Si dibujáramos los items en el
// primer render del cliente, el DOM no coincidiría con el HTML del servidor y
// React tiraría error de hidratación.
//
// useCartHydrated() devuelve false hasta que zustand termina de leer
// localStorage. Quien lo usa muestra un placeholder mientras tanto.
//
// Estas tres funciones viven FUERA del hook por dos motivos:
//
// 1) Su referencia tiene que ser siempre la misma. Si se crearan en cada render,
//    React se desuscribiría y volvería a suscribirse una y otra vez.
// 2) En el servidor no existe localStorage, y ahí zustand devuelve el store SIN
//    el objeto `persist` (se sale antes, en el middleware). Sus tipos dicen que
//    `persist` siempre está, así que TypeScript no avisa: revienta en runtime al
//    renderizar del lado del servidor. Por eso el `?.`, y por eso conviene que la
//    propiedad se lea recién cuando React ejecuta estas funciones.
const subscribeToHydration = (onChange: () => void) =>
  useCart.persist?.onFinishHydration(onChange) ?? (() => {});

const getHydrated = () => useCart.persist?.hasHydrated() ?? false;

const getHydratedOnServer = () => false;

// React usa el tercer argumento (false) para el HTML del servidor Y para el
// render de hidratación, y recién después lee el valor real: el contenido
// aparece un instante más tarde, sin necesidad de un setState dentro de un
// efecto.
export function useCartHydrated(): boolean {
  return useSyncExternalStore(
    subscribeToHydration,
    getHydrated,
    getHydratedOnServer
  );
}