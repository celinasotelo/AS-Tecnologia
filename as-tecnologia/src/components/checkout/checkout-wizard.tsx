"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Banknote,
  CreditCard,
  MapPin,
  ShoppingCart,
  Store,
  Truck,
} from "lucide-react";
import { formatPrice } from "@/lib/format";
import { inputClass, Field } from "@/components/ui/field";
import { useCart, useCartHydrated, selectCartTotal } from "@/lib/store/cart";
import { createOrder } from "@/lib/actions/orders";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { local, zonaDeEnvio } from "@/lib/negocio";
import type { DeliveryMethod, PaymentMethod } from "@/lib/checkout";
import {
  OrderConfirmation,
  type OrderSnapshot,
} from "@/components/checkout/order-confirmation";

type Step = "entrega" | "direccion" | "pago" | "datos";

// Dónde guardamos el último pedido para que sobreviva a un refresh de la
// pantalla de confirmación. sessionStorage y no localStorage: cuando el cliente
// cierra la pestaña, el pedido ya está hecho y no tiene sentido conservarlo.
const SNAPSHOT_KEY = "as-tecnologia-last-order";

export function CheckoutWizard() {
  const items = useCart((state) => state.items);
  const total = useCart(selectCartTotal);
  const clear = useCart((state) => state.clear);
  const hydrated = useCartHydrated();

  const [step, setStep] = useState<Step>("entrega");
  const [delivery, setDelivery] = useState<DeliveryMethod | null>(null);
  const [payment, setPayment] = useState<PaymentMethod | null>(null);

  // Dirección: un useState por campo, igual que en el formulario del admin.
  const [calle, setCalle] = useState("");
  const [numero, setNumero] = useState("");
  const [pisoDepto, setPisoDepto] = useState("");
  const [barrio, setBarrio] = useState("");
  const [referencia, setReferencia] = useState("");

  // Datos de contacto
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");

  // El pedido que se acaba de crear en esta pantalla.
  const [order, setOrder] = useState<OrderSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // El último pedido guardado en sessionStorage, para aguantar un refresh.
  //
  // Solo vale si el carrito está vacío: si tiene productos, el cliente arrancó
  // un pedido NUEVO y la confirmación vieja no aplica. Sin esta condición,
  // agregar algo al carrito y tocar "Finalizar compra" te devolvía a la
  // pantalla del pedido anterior.
  const storedOrder = useStoredOrder();
  const activeOrder =
    order ?? (hydrated && items.length === 0 ? storedOrder : null);

  const isDelivery = delivery === "delivery";

  const goBack = () => {
    setError(null);
    if (step === "direccion") setStep("entrega");
    // En retiro nunca pasamos por la pantalla de dirección, así que el paso
    // anterior a "pago" depende de qué eligió el cliente.
    else if (step === "pago") setStep(isDelivery ? "direccion" : "entrega");
    else if (step === "datos") setStep("pago");
  };

  const handleDelivery = (method: DeliveryMethod) => {
    setError(null);
    setDelivery(method);
    setStep(method === "delivery" ? "direccion" : "pago");
  };

  const handleAddressNext = () => {
    if (!calle.trim()) {
      setError("Ingresá el nombre de la calle.");
      return;
    }
    // Con que tenga un dígito alcanza: hay alturas como "1282 bis" y no
    // queremos rechazarlas por prolijos.
    if (!/\d/.test(numero)) {
      setError("Ingresá la altura (el número de la casa).");
      return;
    }
    setError(null);
    setStep("pago");
  };

  const handlePayment = (method: PaymentMethod) => {
    setError(null);
    setPayment(method);
    setStep("datos");
  };

  const handleConfirm = () => {
    if (!nombre.trim() || !telefono.trim()) {
      setError("Completá tu nombre y teléfono.");
      return;
    }
    if (!delivery || !payment) {
      setError("Volvé atrás y elegí cómo recibir y cómo pagar.");
      return;
    }

    setError(null);
    const address = isDelivery ? composeAddress(calle, numero, pisoDepto, barrio) : "";
    const notes = isDelivery ? referencia.trim() : "";

    startTransition(async () => {
      const result = await createOrder({
        customerName: nombre.trim(),
        customerPhone: telefono.trim(),
        deliveryMethod: delivery,
        paymentMethod: payment,
        deliveryAddress: address,
        deliveryNotes: notes,
        items: items.map((i) => ({
          variantId: i.variantId,
          quantity: i.quantity,
        })),
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      const snapshot: OrderSnapshot = {
        orderId: result.orderId,
        total: result.total,
        deliveryMethod: delivery,
        paymentMethod: payment,
        deliveryAddress: address || undefined,
        deliveryNotes: notes || undefined,
        whatsappUrl: buildWhatsAppLink({
          orderId: result.orderId,
          items,
          prices: result.prices,
          total: result.total,
          customerName: nombre.trim(),
          deliveryMethod: delivery,
          paymentMethod: payment,
          deliveryAddress: address,
          deliveryNotes: notes,
        }),
      };

      // El link de WhatsApp se arma ANTES de vaciar el carrito: necesita los
      // nombres de los productos, que solo están en los items.
      try {
        sessionStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
      } catch {
        // Modo incógnito con storage bloqueado. El pedido ya está guardado y la
        // pantalla se dibuja igual; lo único que se pierde es aguantar un
        // refresh.
      }

      setOrder(snapshot);
      clear();
    });
  };

  // --- Render ---------------------------------------------------------------

  // Habiendo pedido, no hay wizard: se muestra la confirmación.
  // autoOpen solo cuando el pedido es de recién (order, y no storedOrder), así
  // un refresh de esta pantalla no vuelve a abrir WhatsApp.
  if (activeOrder) {
    return <OrderConfirmation order={activeOrder} autoOpen={order !== null} />;
  }

  // Mientras zustand lee localStorage no sabemos si hay carrito. Un placeholder
  // neutro evita mostrar "está vacío" un instante y que después aparezcan los
  // productos.
  if (!hydrated) {
    return <div className="h-64 animate-pulse rounded-xl bg-surface-card" />;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <ShoppingCart size={48} className="text-muted opacity-30" />
        <div>
          <h1 className="text-xl font-bold">Tu carrito está vacío</h1>
          <p className="mt-1 text-sm text-muted">
            Agregá productos para poder finalizar la compra.
          </p>
        </div>
        <Link
          href="/"
          className="rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary-light"
        >
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <StepIndicator step={step} isDelivery={isDelivery} />

      {step !== "entrega" && (
        <button
          type="button"
          onClick={goBack}
          className="flex items-center gap-1.5 self-start text-sm font-medium text-muted transition hover:text-primary-light"
        >
          <ArrowLeft size={16} />
          Volver
        </button>
      )}

      {step === "entrega" && (
        <section className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">¿Cómo querés recibir el pedido?</h1>

          {/* El link a Maps va FUERA de la card y no adentro: un <button> no
              puede contener un <a> (HTML inválido), y además tocar el link
              dispararía también el onClick de la card y te saltearía el paso. */}
          <div className="flex flex-col gap-2">
            <OptionCard
              icon={<Store size={24} />}
              title="Retiro en el local"
              description="Sin costo. Coordinamos el horario por WhatsApp."
              onClick={() => handleDelivery("pickup")}
            >
              <span className="mt-2 block text-sm font-medium">
                {local.direccion} — {local.ciudad}
              </span>
            </OptionCard>

            <a
              href={local.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 self-start px-4 text-sm font-medium text-primary-light hover:underline"
            >
              <MapPin size={16} />
              Ver en Google Maps
            </a>
          </div>

          <OptionCard
            icon={<Truck size={24} />}
            title="Envío a domicilio"
            description={`Solo dentro de ${zonaDeEnvio}. El costo del envío lo coordinamos por WhatsApp.`}
            onClick={() => handleDelivery("delivery")}
          />
        </section>
      )}

      {step === "direccion" && (
        <section className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold">¿A dónde te lo llevamos?</h1>
            <p className="mt-1 text-sm text-muted">
              Por ahora solo hacemos envíos dentro de {zonaDeEnvio}.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
            <Field label="Calle *">
              <input
                type="text"
                value={calle}
                onChange={(e) => setCalle(e.target.value)}
                placeholder="Av. Independencia"
                className={inputClass}
              />
            </Field>
            <Field label="Altura *">
              <input
                type="text"
                inputMode="numeric"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                placeholder="1450"
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Piso / Depto">
              <input
                type="text"
                value={pisoDepto}
                onChange={(e) => setPisoDepto(e.target.value)}
                placeholder="3º B"
                className={inputClass}
              />
            </Field>
            <Field label="Barrio">
              <input
                type="text"
                value={barrio}
                onChange={(e) => setBarrio(e.target.value)}
                placeholder="Centro"
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Referencias para encontrarte">
            <input
              type="text"
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
              placeholder="Portón negro, al lado del kiosco"
              className={inputClass}
            />
          </Field>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="button"
            onClick={handleAddressNext}
            className="w-full rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary-light"
          >
            Continuar
          </button>
        </section>
      )}

      {step === "pago" && (
        <section className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">¿Cómo querés pagar?</h1>

          <OptionCard
            icon={<Banknote size={24} />}
            title="Efectivo"
            description={
              isDelivery
                ? "Pagás cuando te lo entreguen en tu domicilio."
                : "Pagás cuando pases a retirar por el local."
            }
            onClick={() => handlePayment("cash")}
          />

          <OptionCard
            icon={<CreditCard size={24} />}
            title="Transferencia"
            description="Te mostramos los datos de la cuenta al confirmar el pedido."
            onClick={() => handlePayment("transfer")}
          />
        </section>
      )}

      {step === "datos" && (
        <section className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold">Últimos datos</h1>
            <p className="mt-1 text-sm text-muted">
              Los necesitamos para identificar tu pedido y escribirte.
            </p>
          </div>

          <Field label="Tu nombre *">
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre y apellido"
              className={inputClass}
            />
          </Field>

          <Field label="Tu teléfono *">
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="3794 12-3456"
              className={inputClass}
            />
          </Field>

          {/* Resumen */}
          <div className="rounded-xl border border-surface-elevated bg-surface-card p-4">
            <h2 className="mb-3 font-semibold">Tu pedido</h2>

            <ul className="flex flex-col gap-1.5 text-sm">
              {items.map((item) => (
                <li
                  key={item.variantId}
                  className="flex justify-between gap-3 text-muted"
                >
                  <span className="min-w-0">
                    {item.quantity}x {item.productName} — {item.variantName}
                  </span>
                  <span className="shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex justify-between border-t border-surface-elevated pt-3 font-semibold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            <dl className="mt-3 space-y-1 border-t border-surface-elevated pt-3 text-sm">
              <SummaryRow
                label="Entrega"
                value={
                  isDelivery
                    ? composeAddress(calle, numero, pisoDepto, barrio)
                    : `Retiro en ${local.direccion}`
                }
              />
              <SummaryRow
                label="Pago"
                value={payment === "transfer" ? "Transferencia" : "Efectivo"}
              />
            </dl>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className="w-full rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary-light disabled:opacity-50"
          >
            {isPending ? "Confirmando..." : "Confirmar pedido"}
          </button>
        </section>
      )}
    </div>
  );
}

// --- Lectura del último pedido ----------------------------------------------
//
// useSyncExternalStore es el mismo hook que usa el carrito para la hidratación:
// le explicás a React cómo leer un dato que vive fuera de React (acá,
// sessionStorage) y él se ocupa de que el servidor y el cliente no se peleen.
// El tercer argumento es lo que se usa para el HTML del servidor, donde
// sessionStorage no existe.
//
// Se hace así y no con un useEffect + setState porque eso dispara un segundo
// render en cascada apenas monta la pantalla (y el linter lo marca como error).

// El caché de estas dos variables NO es una optimización, es obligatorio: React
// compara el resultado de readStoredOrder con Object.is en cada render, y un
// JSON.parse devuelve un objeto nuevo cada vez. Sin caché, React vería que
// "cambió" siempre y renderizaría en loop infinito.
let cachedRaw: string | null = null;
let cachedOrder: OrderSnapshot | null = null;

function readStoredOrder(): OrderSnapshot | null {
  const raw = sessionStorage.getItem(SNAPSHOT_KEY);
  if (raw === cachedRaw) return cachedOrder;

  cachedRaw = raw;
  try {
    cachedOrder = raw ? (JSON.parse(raw) as OrderSnapshot) : null;
  } catch {
    cachedOrder = null;
  }
  return cachedOrder;
}

// sessionStorage no cambia solo mientras la pantalla está abierta: no hay nada
// a qué suscribirse, así que devolvemos una función de baja que no hace nada.
const subscribeToStoredOrder = () => () => {};

const noStoredOrderOnServer = () => null;

function useStoredOrder(): OrderSnapshot | null {
  return useSyncExternalStore(
    subscribeToStoredOrder,
    readStoredOrder,
    noStoredOrderOnServer
  );
}

// --- Piezas del wizard -------------------------------------------------------

// Arma la dirección en una sola línea, que es como se guarda en la DB y como la
// lee el dueño en el panel. Los campos vacíos no dejan comas colgando.
function composeAddress(
  calle: string,
  numero: string,
  pisoDepto: string,
  barrio: string
): string {
  const parts = [`${calle.trim()} ${numero.trim()}`.trim()];
  if (pisoDepto.trim()) parts.push(pisoDepto.trim());
  if (barrio.trim()) parts.push(`B° ${barrio.trim()}`);
  return parts.join(", ");
}

function StepIndicator({
  step,
  isDelivery,
}: {
  step: Step;
  isDelivery: boolean;
}) {
  // La pantalla de dirección solo existe en el camino del envío, así que el
  // indicador tiene 3 o 4 pasos según lo que el cliente haya elegido.
  const steps: { key: Step; label: string }[] = [
    { key: "entrega", label: "Entrega" },
    ...(isDelivery
      ? [{ key: "direccion" as Step, label: "Dirección" }]
      : []),
    { key: "pago", label: "Pago" },
    { key: "datos", label: "Datos" },
  ];

  const currentIndex = steps.findIndex((s) => s.key === step);

  return (
    <ol className="flex items-center gap-2">
      {steps.map((s, i) => (
        <li key={s.key} className="flex flex-1 flex-col gap-1.5">
          <span
            className={`h-1 rounded-full transition-colors ${
              i <= currentIndex ? "bg-primary" : "bg-surface-elevated"
            }`}
          />
          <span
            className={`text-xs ${
              i <= currentIndex ? "text-foreground" : "text-muted"
            }`}
          >
            {s.label}
          </span>
        </li>
      ))}
    </ol>
  );
}

// Card grande y clickeable para elegir entrega o pago.
//
// Es un <button> y no un <div onClick>: así se puede llegar con Tab, se activa
// con Enter y los lectores de pantalla lo anuncian como algo que se toca.
function OptionCard({
  icon,
  title,
  description,
  onClick,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full gap-4 rounded-xl border border-surface-elevated bg-surface-card p-4 text-left transition hover:border-primary-light"
    >
      <span className="mt-0.5 shrink-0 text-primary-light">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{title}</span>
        <span className="mt-0.5 block text-sm text-muted">{description}</span>
        {children}
      </span>
    </button>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className="min-w-0 text-right">{value}</dd>
    </div>
  );
}
