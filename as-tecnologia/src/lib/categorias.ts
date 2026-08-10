// Slugs de las categorías que se venden por variante.
// En vapers la variante es el sabor; en perfumes, los mililitros.
export const CATEGORIA_VAPERS = "vapers";
export const CATEGORIA_PERFUMES = "perfumes";

// Nombre de la variante que el panel crea sola para los productos que
// tienen una sola presentación (cargadores, accesorios, etc.).
export const VARIANTE_UNICA = "Estándar";

export function usaVariantes(slug: string | null | undefined): boolean {
  return slug === CATEGORIA_VAPERS || slug === CATEGORIA_PERFUMES;
}

// Cómo se le habla al usuario de la variante en cada categoría. Vive acá y no
// en los componentes porque lo necesitan los dos lados: la tienda y el panel.
export function etiquetasDeVariante(slug: string | null | undefined) {
  if (slug === CATEGORIA_VAPERS) {
    return {
      titulo: "Sabor",
      cta: "Elegí un sabor",
      singular: "sabor",
      plural: "sabores",
      nueva: "Nuevo sabor", // el género cambia según la palabra
      ejemplo: "Sandía Ice", // placeholder del panel
    };
  }
  if (slug === CATEGORIA_PERFUMES) {
    return {
      titulo: "Presentación",
      cta: "Elegí una presentación",
      singular: "presentación",
      plural: "presentaciones",
      nueva: "Nueva presentación",
      ejemplo: "105ml",
    };
  }
  return {
    titulo: "Opción",
    cta: "Elegí una opción",
    singular: "variante",
    plural: "variantes",
    nueva: "Nueva variante",
    ejemplo: "Negro",
  };
}
