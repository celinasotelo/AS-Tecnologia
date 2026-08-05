"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { navLinks } from "@/lib/nav-links";

// Ya no maneja su propio abierto/cerrado: lo decide HeaderActions, para que
// nunca quede abierto al mismo tiempo que el buscador.
type MobileNavProps = {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
};

export function MobileNav({ open, onToggle, onClose }: MobileNavProps) {
  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        className="text-muted hover:text-primary-light"
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-50 border-b border-surface-elevated bg-surface-card">
          <nav className="flex flex-col gap-1 px-4 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className="rounded-md px-3 py-2 text-sm hover:bg-surface-elevated hover:text-primary-light"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
