"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, Copy, MapPin, MessageCircle } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { local, transferencia, hayDatosDeTransferencia } from "@/lib/negocio";
import type { DeliveryMethod, PaymentMethod } from "@/lib/checkout";

// Lo mínimo que la pantalla necesita para dibujarse sin volver a la base.
//
// Guardar el link de WhatsApp ya armado (y no los items) hace que este objeto
// sobreviva entero en sessionStorage: si el cliente refresca la página después
// de comprar, sigue viendo el alias y el botón para escribirnos.
export type OrderSnapshot = {
  orderId: string;
  total: number;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  deliveryAddress?: string;
  deliveryNotes?: string;
  whatsappUrl: string;
};

type Props = {
  order: OrderSnapshot;
  // true solo cuando la orden se acaba de crear. Al recuperar la pantalla de
  // sessionStorage queda en false, así un refresh no vuelve a abrir WhatsApp.
  autoOpen: boolean;
};

export function OrderConfirmation({ order, autoOpen }: Props) {
  const isDelivery = order.deliveryMethod === "delivery";
  const isTransfer = order.paymentMethod === "transfer";

  // Intento de abrir WhatsApp solo, una vez.
  //
  // El camino real es que el usuario toque el botón de abajo: este open corre
  // dentro de un efecto, o sea fuera del gesto del usuario, y Safari en iPhone
  // y varios bloqueadores lo cancelan. Cuando pasa, no se pierde nada — el
  // botón queda ahí. Cuando funciona, el cliente se ahorra un toque.
  const alreadyOpened = useRef(false);
  useEffect(() => {
    if (!autoOpen || alreadyOpened.current) return;
    alreadyOpened.current = true;
    window.open(order.whatsappUrl, "_blank", "noopener,noreferrer");
  }, [autoOpen, order.whatsappUrl]);

  return (
    <div className="flex flex-col gap-6">
      {/* Cabecera */}
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
          <Check size={30} strokeWidth={3} />
        </span>
        <div>
          <h1 className="text-2xl font-bold">¡Pedido realizado!</h1>
          <p className="mt-1 text-sm text-muted">
            Pedido #{order.orderId.slice(0, 8)}
          </p>
        </div>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between rounded-xl border border-surface-elevated bg-surface-card p-4">
        <span className="text-muted">Total</span>
        <span className="text-2xl font-bold">{formatPrice(order.total)}</span>
      </div>

      {/* Entrega */}
      <section className="rounded-xl border border-surface-elevated bg-surface-card p-4">
        <h2 className="mb-2 font-semibold">
          {isDelivery ? "Envío a domicilio" : "Retiro en el local"}
        </h2>

        {isDelivery ? (
          <>
            <p className="text-sm text-muted">Lo enviamos a:</p>
            <p className="mt-1 font-medium">{order.deliveryAddress}</p>
            {order.deliveryNotes && (
              <p className="mt-1 text-sm text-muted">{order.deliveryNotes}</p>
            )}
          </>
        ) : (
          <>
            <p className="text-sm text-muted">Te esperamos en:</p>
            <p className="mt-1 font-medium">{local.direccion}</p>
            <p className="text-sm text-muted">{local.ciudad}</p>
            <a
              href={local.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary-light hover:underline"
            >
              <MapPin size={16} />
              Ver en Google Maps
            </a>
          </>
        )}
      </section>

      {/* Pago */}
      <section className="rounded-xl border border-surface-elevated bg-surface-card p-4">
        <h2 className="mb-2 font-semibold">
          {isTransfer ? "Pago por transferencia" : "Pago en efectivo"}
        </h2>

        {isTransfer ? (
          hayDatosDeTransferencia ? (
            <>
              <p className="text-sm text-muted">
                Transferí el total a esta cuenta y mandanos el comprobante por
                WhatsApp.
              </p>
              <div className="mt-3 flex flex-col gap-2">
                <CopyRow label="Alias" value={transferencia.alias} />
                <CopyRow label="CBU" value={transferencia.cbu} />
                <CopyRow label="Titular" value={transferencia.titular} />
              </div>
            </>
          ) : (
            <p className="text-sm text-muted">
              Escribinos por WhatsApp y te pasamos los datos para transferir.
            </p>
          )
        ) : (
          <p className="text-sm text-muted">
            {isDelivery
              ? "Pagás en efectivo cuando te lo entreguen. Tratá de tener el importe justo."
              : "Pagás en efectivo al retirar el pedido."}
          </p>
        )}
      </section>

      {/* Coordinación por WhatsApp */}
      <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm">
        <p className="font-medium">
          {isDelivery
            ? "El horario de entrega lo coordinamos por WhatsApp."
            : "El horario para pasar a retirar lo coordinamos por WhatsApp."}
        </p>
        <p className="mt-1 text-muted">
          Si no se abrió solo, tocá el botón para mandarnos el pedido.
        </p>
      </div>

      {/* Salida a WhatsApp.
          Es un <a> y no un window.open: al tocarlo el navegador nunca lo
          bloquea, porque es un gesto directo del usuario. */}
      <a
        href={order.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary-light"
      >
        <MessageCircle size={20} />
        Enviar pedido por WhatsApp
      </a>

      <Link
        href="/"
        className="text-center text-sm font-medium text-muted hover:text-primary-light"
      >
        Volver al inicio
      </Link>
    </div>
  );
}

// Un dato con su botón de copiar. El alias y el CBU se transcriben a mano en la
// app del banco: copiarlos evita el error de tipeo que después es un quilombo.
function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  // El "¡Copiado!" se apaga solo a los 2 segundos. Guardamos el id del timer
  // para cancelarlo si el componente se desmonta antes: sin esto, React
  // intentaría actualizar el estado de algo que ya no está en pantalla.
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // navigator.clipboard no existe en http sin certificado ni en navegadores
      // viejos. No es un error que valga mostrar: el dato está a la vista y se
      // puede seleccionar a mano.
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-surface px-3 py-2">
      <div className="min-w-0">
        <p className="text-xs text-muted">{label}</p>
        <p className="truncate font-medium">{value}</p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`Copiar ${label}`}
        className="flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-muted transition hover:bg-surface-elevated hover:text-foreground"
      >
        {copied ? (
          <>
            <Check size={14} className="text-success" />
            ¡Copiado!
          </>
        ) : (
          <>
            <Copy size={14} />
            Copiar
          </>
        )}
      </button>
    </div>
  );
}
