"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleProductActive(
  productId: string,
  isActive: boolean
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .update({ is_active: isActive })
    .eq("id", productId);

  if (error) {
    return { ok: false, error: "No se pudo actualizar el producto." };
  }

  // Refrescar la lista del admin para que el cambio se vea
  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  revalidatePath("/");
  revalidatePath(`/productos/${productId}`);

  return { ok: true };
}