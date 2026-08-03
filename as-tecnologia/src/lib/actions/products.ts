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

// Actualizar una variante (stock, nombre, precio)
export async function updateVariant(input: {
  id: string;
  name: string;
  stock: number;
  priceOverride: number | null;
}) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("product_variants")
    .update({
      name: input.name.trim(),
      stock: input.stock,
      price_override: input.priceOverride,
    })
    .eq("id", input.id);

  if (error) {
    return { ok: false, error: "No se pudo actualizar la variante." };
  }

  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  return { ok: true };
}

// Agregar una variante nueva a un producto
export async function addVariant(input: {
  productId: string;
  name: string;
  stock: number;
}) {
  const supabase = await createClient();

  if (!input.name.trim()) {
    return { ok: false, error: "La variante necesita un nombre." };
  }

  const { error } = await supabase.from("product_variants").insert({
    product_id: input.productId,
    name: input.name.trim(),
    stock: input.stock,
  });

  if (error) {
    return { ok: false, error: "No se pudo agregar la variante." };
  }

  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  return { ok: true };
}

// Eliminar/Desactivar una variante
export async function deleteVariant(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("product_variants")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    console.error("Error al desactivar variante:", error);
    return { ok: false, error: "No se pudo eliminar la variante." };
  }

  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  return { ok: true };
}