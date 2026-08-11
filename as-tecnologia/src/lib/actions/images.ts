"use server";

import { revalidatePath, updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CATALOG_TAG } from "@/lib/queries/products";

export async function saveProductImage(input: {
  productId: string;
  variantId: string | null;
  url: string;
  sortOrder: number;
}) {
  const supabase = await createClient();

  const { error } = await supabase.from("product_images").insert({
    product_id: input.productId,
    variant_id: input.variantId,
    url: input.url,
    sort_order: input.sortOrder,
  });

  if (error) {
    console.error("Error al guardar imagen:", error);
    return { ok: false, error: "No se pudo guardar la imagen." };
  }

  updateTag(CATALOG_TAG);
  revalidatePath(`/admin/productos/${input.productId}/editar`);
  revalidatePath(`/productos/${input.productId}`);
  revalidatePath("/productos");
  revalidatePath("/");

  return { ok: true };
}

export async function deleteProductImage(id: string, productId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error al eliminar imagen:", error);
    return { ok: false, error: "No se pudo eliminar la imagen." };
  }

  updateTag(CATALOG_TAG);
  revalidatePath(`/admin/productos/${productId}/editar`);
  revalidatePath(`/productos/${productId}`);
  revalidatePath("/productos");
  revalidatePath("/");

  return { ok: true };
}