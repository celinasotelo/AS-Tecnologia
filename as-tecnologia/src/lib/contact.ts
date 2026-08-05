// Datos de contacto públicos de la marca, para reutilizar en páginas y links.
export const contact = {
  // Formato wa.me: sin +, espacios ni guiones.
  whatsappNumber: "5493794682924",
  whatsappDisplay: "+54 9 3794 68-2924",
  instagramUrl: "https://www.instagram.com/as_tecnologia_/",
  instagramHandle: "@as_tecnologia_",
};

export function whatsappLink(message: string): string {
  return `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
