import type { Metadata } from "next";
import { CheckoutWizard } from "@/components/checkout/checkout-wizard";

export const metadata: Metadata = {
  title: "Finalizar compra | AS Tecnología",
  description: "Elegí cómo recibir tu pedido y cómo pagarlo.",
  // Es una página de proceso, no de contenido: no queremos que Google la
  // indexe ni que aparezca en resultados.
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <CheckoutWizard />
    </main>
  );
}
