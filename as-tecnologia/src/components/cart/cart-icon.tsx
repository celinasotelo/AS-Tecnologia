"use client";

import { useSyncExternalStore } from "react";
import { ShoppingCart } from "lucide-react";
import { useCart, selectCartCount } from "@/lib/store/cart";

// Estas tres funciones viven FUERA del componente por dos motivos:
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

export function CartIcon() {
  const count = useCart(selectCartCount);
  const openCart = useCart((state) => state.openCart);

  // El carrito vive en localStorage: el servidor arma el HTML con el carrito
  // vacío (sin globito) y tu navegador puede tener 3 productos. Si dibujáramos
  // el globito en el primer render del cliente, el DOM no coincidiría con el
  // HTML del servidor y React tiraría error de hidratación.
  //
  // Por eso preguntamos si el store ya terminó de leer localStorage. React usa
  // el tercer argumento (false) para el HTML del servidor Y para el render de
  // hidratación, y recién después lee el valor real: el globito aparece un
  // instante más tarde, sin necesidad de un setState dentro de un efecto.
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    getHydrated,
    getHydratedOnServer
  );

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
