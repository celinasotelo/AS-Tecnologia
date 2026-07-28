import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { CartIcon } from "@/components/cart/cart-icon";

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
        <CartIcon />
      </div>
    </header>
  );
}