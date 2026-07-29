import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { CartDrawer } from "@/components/cart/cart-drawer";

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
    <html lang="es">
      <body className={geist.className}>
        <Header />
        <CartDrawer />
        {children}
      </body>
    </html>
  );
}