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