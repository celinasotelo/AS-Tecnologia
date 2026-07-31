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

  // Refrescar 
  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  revalidatePath("/");
  revalidatePath(`/productos/${productId}`);

  return { ok: true };
}

export async function saveProduct(input: {
  id?: string; // si viene, es edición; si no, es alta
  name: string;
  model: string;
  description: string;
  basePrice: number;
  categoryId: string;
  brandId: string;
  puffs: number | null;
}) {
  const supabase = await createClient();

  if (!input.name.trim() || !input.categoryId || !input.brandId) {
    return { ok: false, error: "Completá nombre, categoría y marca." };
  }

  // attributes: guardamos puffs solo si viene (para vapers)
  const attributes = input.puffs ? { puffs: input.puffs } : {};

  const productData = {
    name: input.name.trim(),
    model: input.model.trim() || null,
    description: input.description.trim() || null,
    base_price: input.basePrice,
    category_id: input.categoryId,
    brand_id: input.brandId,
    attributes,
  };

  if (input.id) {
    // EDICIÓN: update
    const { error } = await supabase
      .from("products")
      .update(productData)
      .eq("id", input.id);

    if (error) {
      return { ok: false, error: "No se pudo actualizar el producto." };
    }
  } else {
    // ALTA: insert
    const { error } = await supabase.from("products").insert(productData);

    if (error) {
      return { ok: false, error: "No se pudo crear el producto." };
    }
  }

  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  revalidatePath("/");

  return { ok: true };
}