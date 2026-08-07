"use client";

import { useEffect, useRef, useState } from "react";
import { CartIcon } from "@/components/cart/cart-icon";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SearchBar } from "@/components/layout/search-bar";
import { ThemeToggle } from "@/components/layout/theme-toggle";

// Sólo puede haber un panel abierto a la vez: por eso es un único estado
// con tres valores posibles, y no dos booleanos independientes.
type Panel = "search" | "menu" | null;

export function HeaderActions() {
  const [panel, setPanel] = useState<Panel>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = () => setPanel(null);

  // Si tocás el botón del panel que ya está abierto, lo cierra. Si no, cambia a ese.
  const toggle = (target: Exclude<Panel, null>) =>
    setPanel((current) => (current === target ? null : target));

  // Escape cierra lo que esté abierto.
  useEffect(() => {
    if (!panel) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [panel]);

  // Click/tap fuera del header cierra lo que esté abierto.
  // Uso pointerdown y no click: dispara antes, así se siente inmediato.
  useEffect(() => {
    if (!panel) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) close();
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [panel]);

  // Con el menú abierto, el fondo no scrollea.
  // El cleanup de useEffect restaura el valor anterior al cerrar.
  useEffect(() => {
    if (panel !== "menu") return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [panel]);

  // Al pasar a desktop el botón hamburguesa desaparece (md:hidden). Sin esto,
  // el panel quedaría abierto y el scroll trabado sin forma de destrabarlo.
  useEffect(() => {
    if (panel !== "menu") return;

    const desktop = window.matchMedia("(min-width: 768px)"); // el breakpoint md de Tailwind
    const onChange = () => {
      if (desktop.matches) close();
    };

    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, [panel]);

  return (
    <div ref={containerRef} className="flex items-center gap-4">
      <SearchBar
        open={panel === "search"}
        onToggle={() => toggle("search")}
        onClose={close}
      />

      {/* En celular no entra un cuarto ícono: ahí el cambio de tema vive adentro
          del menú hamburguesa (ver MobileNav). */}
      <ThemeToggle className="hidden h-6 w-6 items-center justify-center md:flex" />

      {/* El carrito está dentro del contenedor, así que el click de afuera no lo
          alcanza: cierro a mano para que el drawer no se abra sobre el menú. */}
      <span className="flex" onClickCapture={close}>
        <CartIcon />
      </span>

      <MobileNav
        open={panel === "menu"}
        onToggle={() => toggle("menu")}
        onClose={close}
      />
    </div>
  );
}
