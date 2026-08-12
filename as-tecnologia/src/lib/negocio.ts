// Datos operativos del negocio: dónde retirar y cómo transferir.
//
// Van separados de contact.ts a propósito: ese archivo es "por dónde nos
// escribís" (WhatsApp, Instagram) y este es "dónde estamos y cómo nos pagás".
// Los usa el checkout, y el día que cambie el alias se toca acá y nada más.

export const local = {
  direccion: "Paraguay 1282",
  ciudad: "Corrientes Capital",

  // Búsqueda de Google Maps en vez de un link a la ficha del negocio: funciona
  // aunque el local no esté registrado como comercio en Maps, y no se rompe si
  // Google cambia el ID del lugar.
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("Paraguay 1282, Corrientes, Argentina"),
};

// Zona en la que hacemos envíos. Por ahora es solo un texto que se le muestra
// al cliente; más adelante, cuando entre Google Maps, va a ser el límite real
// contra el que se valide la dirección.
export const zonaDeEnvio = "Corrientes Capital";

// TODO: completar con los datos reales antes de publicar.
// Mientras digan "COMPLETAR", la pantalla de transferencia avisa que los datos
// se piden por WhatsApp en vez de mostrar un alias inventado.
export const transferencia = {
  alias: "COMPLETAR",
  cbu: "COMPLETAR",
  titular: "COMPLETAR",
};

// true cuando los tres datos ya fueron cargados de verdad.
export const hayDatosDeTransferencia =
  transferencia.alias !== "COMPLETAR" &&
  transferencia.cbu !== "COMPLETAR" &&
  transferencia.titular !== "COMPLETAR";
