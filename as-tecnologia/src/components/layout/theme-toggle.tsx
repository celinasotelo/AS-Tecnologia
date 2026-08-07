"use client";

import { useSyncExternalStore } from "react";
import { Sun, Moon } from "lucide-react";
import { THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

// El tema no vive en React: vive en el atributo data-theme del <html>, que lo
// escribe el script de layout.tsx antes de que React arranque. useSyncExternalStore
// es el hook para justamente eso, leer un dato de "afuera" sin desincronizarse.

// Avisa a React cuando el atributo cambia. El MutationObserver mira el <html>:
// venga el cambio de este botón o de otro lado, el ícono siempre queda al día.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

function getSnapshot(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

// En el servidor no hay document ni forma de saber el tema, así que devolvemos
// null. React usa este valor para el HTML inicial y para la hidratación, y
// recién después pasa a getSnapshot: por eso no hay error de hidratación.
function getServerSnapshot(): Theme | null {
  return null;
}

type ThemeToggleProps = {
  // Las clases de layout las pone quien lo usa: en el header es un ícono suelto
  // y en el menú móvil es una fila ancha como el resto de los links.
  className?: string;
  showLabel?: boolean;
};

export function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  // null mientras no montó; después "light" o "dark".
  const theme = useSyncExternalStore<Theme | null>(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const toggle = () => {
    const next: Theme = theme === "light" ? "dark" : "light";

    // Con cambiar el atributo alcanza para todo: el CSS de globals.css reacciona
    // solo y el MutationObserver de arriba re-renderiza este botón.
    document.documentElement.dataset.theme = next;

    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Si el navegador bloquea localStorage el tema igual cambia; lo único que
      // se pierde es que quede guardado para la próxima visita.
    }
  };

  const action = theme === "light" ? "Modo oscuro" : "Modo claro";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Cambiar a ${action.toLowerCase()}`}
      className={`text-muted transition hover:text-primary-light ${className}`}
    >
      {/* Hasta que monte no dibujamos ícono: así el primer render del cliente es
          idéntico al del servidor. El botón ya ocupa su lugar, por eso nada se
          corre cuando el ícono aparece. */}
      {theme === "dark" && <Sun size={20} />}
      {theme === "light" && <Moon size={20} />}
      {showLabel && <span>{action}</span>}
    </button>
  );
}
