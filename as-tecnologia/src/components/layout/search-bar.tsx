"use client";

import { useEffect, useRef, useState, type SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

// El abierto/cerrado lo maneja HeaderActions. Acá sólo queda el texto tipeado,
// que es estado propio de este componente y no le importa a nadie más.
type SearchBarProps = {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
};

export function SearchBar({ open, onToggle, onClose }: SearchBarProps) {
  const router = useRouter();
  const [term, setTerm] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Al abrir el panel, mando el cursor al input para poder escribir directo.
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = term.trim();
    if (!query) return;

    onClose();
    // encodeURIComponent para que espacios y acentos viajen bien en la URL.
    router.push(`/buscar?q=${encodeURIComponent(query)}`);
  };

  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        aria-label={open ? "Cerrar búsqueda" : "Buscar productos"}
        aria-expanded={open}
        className="text-muted hover:text-primary-light"
      >
        {open ? <X size={20} /> : <Search size={20} />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-50 border-b border-surface-elevated bg-surface-card">
          <form
            onSubmit={handleSubmit}
            className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3"
          >
            <Search size={18} className="shrink-0 text-muted" />
            <input
              ref={inputRef}
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              type="search"
              placeholder="Buscar productos..."
              className="w-full bg-transparent py-1 text-sm outline-none placeholder:text-muted"
            />
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-primary-light"
            >
              Buscar
            </button>
          </form>
        </div>
      )}
    </>
  );
}
