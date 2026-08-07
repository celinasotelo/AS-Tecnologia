import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { THEME_INIT_SCRIPT } from "@/lib/theme";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AS Tecnología",
  description:
    "Tienda de tecnología, vapers y perfumes. Corrientes, Argentina.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: el servidor manda el <html> sin data-theme y el
    // script se lo agrega antes de hidratar. La diferencia es a propósito, sin
    // esto React la reporta como error en consola.
    <html lang="es" suppressHydrationWarning>
      <body className={geist.className}>
        {/* Primero de todo: define el tema antes de que se pinte la página. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <Header />
        <CartDrawer />
        {children}
      </body>
    </html>
  );
}