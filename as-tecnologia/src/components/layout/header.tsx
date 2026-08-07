import Image from "next/image";
import Link from "next/link";
import { HeaderActions } from "@/components/layout/header-actions";
import { navLinks } from "@/lib/nav-links";

export function Header() {
  return (
    <header className="relative border-b border-surface-elevated bg-surface-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        {/* Logo + nombre */}
        <Link href="/" className="flex items-center gap-3">
          {/* Los dos logos van siempre en el HTML y el CSS muestra el que
              corresponde (clases .only-dark / .only-light en globals.css). Así
              el Header sigue siendo server component y no hay parpadeo.
              El sufijo del archivo es el color del logo, no el modo: _Claro es
              el tile blanco (va sobre fondo oscuro) y _Oscuro el tile navy.
              Los dos llevan el mismo alt: el que está en display:none no existe
              para un lector de pantalla, así que nunca se anuncia repetido. */}
          <Image
            src="/brand-assets/Logo_cuadrado_Claro_trim.png"
            alt="AS Tecnología"
            width={50}
            height={50}
            className="only-dark -my-2 rounded-lg"
          />
          <Image
            src="/brand-assets/Logo_cuadrado_Oscuro_trim.png"
            alt="AS Tecnología"
            width={50}
            height={50}
            className="only-light -my-2 rounded-lg"
          />
          <span className="hidden text-lg font-bold sm:block">
            AS Tecnología
          </span>
        </Link>

        {/* Navegación desktop */}
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-primary-light">
              {link.label}
            </Link>
          ))}
        </nav>

        <HeaderActions />
      </div>
    </header>
  );
}