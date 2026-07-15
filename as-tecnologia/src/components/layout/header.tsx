import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-surface-elevated bg-surface-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        {/* Logo + nombre */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/brand-assets/Logo_cuadrado_Claro_trim.png"
            alt="AS Tecnología"
            width={50}
            height={50}
            className="-my-2 rounded-lg"
          />
          <span className="hidden text-lg font-bold sm:block">
            AS Tecnología
          </span>
        </Link>

        {/* Navegación */}
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="hover:text-primary-light">
            Inicio
          </Link>
          <Link href="/productos" className="hover:text-primary-light">
            Productos
          </Link>
        </nav>

        {/* Carrito (placeholder, se conecta en Fase 3) */}
        <button
          aria-label="Mi carrito"
          className="relative rounded-lg p-2 hover:bg-surface-elevated"
        >
          <ShoppingCart size={22} />
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold">
            0
          </span>
        </button>
      </div>
    </header>
  );
}