import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Boxes, MessageCircle, Percent, Sparkles } from "lucide-react";
import { contact, whatsappLink } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Venta mayorista | AS Tecnología",
  description:
    "Comprá vapers, perfumes y tecnología por mayor en Corrientes. Precios por volumen y pedidos armados a tu medida.",
};

const waLink = whatsappLink(
  "¡Hola! Me interesa la venta mayorista."
);

const steps = [
  {
    title: "Escribinos",
    description:
      "Contanos qué productos te interesan y con qué cantidades solés trabajar.",
  },
  {
    title: "Armamos el pedido",
    description: "Te pasamos disponibilidad, precios mayoristas y el total.",
  },
  {
    title: "Coordinamos la entrega",
    description: "Acordamos la forma de pago y cómo te llega el pedido.",
  },
];

export default function MayoristaPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-surface-elevated bg-surface-card px-6 py-12 text-center sm:px-12 sm:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/30 blur-3xl"
        />
        <div className="relative">
          <span className="inline-block rounded-full border border-primary-light/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-primary-light">
            Venta mayorista
          </span>
          <h1 className="mt-4 text-3xl font-bold sm:text-5xl">
            Comprá al por mayor y{" "}
            <span className="text-primary-light">productos seleccionados</span>
          </h1>
          <h2 className="mx-auto mt-4 max-w-xxl text-muted">
            Corrientes, Argentina.
          </h2>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary-light"
            >
              <MessageCircle size={20} />
              Escribinos por WhatsApp
            </a>
            <a
              href={contact.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-surface-elevated px-6 py-3 font-semibold transition hover:border-primary-light hover:text-primary-light"
            >
              <InstagramIcon />
              Ver Instagram
            </a>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="mt-14">
        <h2 className="text-xl font-bold">¿Cómo es el proceso?</h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="relative rounded-xl border border-surface-elevated bg-surface-card p-5"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-bold text-white">
                {index + 1}
              </span>
              <h3 className="mt-4 font-semibold">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-muted">
          Las cantidades mínimas, formas de pago y envíos los coordinamos según el
          pedido. Escribinos y te pasamos la lista mayorista actualizada.
        </p>
      </section>

      {/* Qué podés pedir */}
      <section className="mt-14">
        <h2 className="text-xl font-bold">¿Qué podés pedir?</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link
            href="/vapers"
            className="group flex items-center justify-between gap-4 rounded-xl border border-surface-elevated bg-surface-card p-5 transition hover:border-primary-light"
          >
            <span>
              <h3 className="font-semibold">Vapers</h3>
              <p className="mt-1.5 text-sm text-muted">
                Todos los modelos y sabores publicados en el catálogo.
              </p>
            </span>
            <ArrowRight
              size={20}
              className="shrink-0 text-muted transition group-hover:translate-x-1 group-hover:text-primary-light"
            />
          </Link>

          <Link
            href="/productos"
            className="group flex items-center justify-between gap-4 rounded-xl border border-surface-elevated bg-surface-card p-5 transition hover:border-primary-light"
          >
            <span>
              <h3 className="font-semibold">Perfumes y tecnología</h3>
              <p className="mt-1.5 text-sm text-muted">
                El resto del catálogo, también disponible por cantidad.
              </p>
            </span>
            <ArrowRight
              size={20}
              className="shrink-0 text-muted transition group-hover:translate-x-1 group-hover:text-primary-light"
            />
          </Link>
        </div>
        <p className="mt-4 text-sm text-muted">
          ¿No ves lo que buscás? Preguntanos por WhatsApp.
        </p>
      </section>

      {/* Contacto */}
      <section className="mt-14 rounded-2xl border border-surface-elevated bg-surface-card p-6 sm:p-8">
        <h2 className="text-xl font-bold">Hablemos</h2>
        <p className="mt-2 text-muted">
          Respondemos por cualquiera de estos dos canales.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-xl border border-surface-elevated bg-surface-elevated/40 p-5 transition hover:border-primary-light"
          >
            <span className="inline-flex rounded-lg bg-success/15 p-3 text-success">
              <MessageCircle size={24} />
            </span>
            <span>
              <span className="block font-semibold">WhatsApp</span>
              <span className="block text-sm text-muted">
                {contact.whatsappDisplay}
              </span>
            </span>
          </a>

          <a
            href={contact.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-xl border border-surface-elevated bg-surface-elevated/40 p-5 transition hover:border-primary-light"
          >
            <span className="inline-flex rounded-lg bg-primary/15 p-3 text-primary-light">
              <InstagramIcon size={24} />
            </span>
            <span>
              <span className="block font-semibold">Instagram</span>
              <span className="block text-sm text-muted">
                {contact.instagramHandle}
              </span>
            </span>
          </a>
        </div>
      </section>
    </main>
  );
}

// lucide-react v1 ya no incluye íconos de marca, así que va inline.
function InstagramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}
