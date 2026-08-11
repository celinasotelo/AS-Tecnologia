"use server";

// updateTag y no revalidateTag: updateTag es el que da read-your-own-writes
// dentro de una Server Action (el cambio se ve al toque, no en el próximo
// pedido). En Next 16 revalidateTag además exige un segundo argumento.
import { revalidatePath, updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CATALOG_TAG } from "@/lib/queries/products";
import { slugify } from "@/lib/slug";
import { usaVariantes, VARIANTE_UNICA } from "@/lib/categorias";

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
  updateTag(CATALOG_TAG);
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
  brandName: string;
  puffs: number | null;
  stock?: number | null; // solo para productos de una sola presentación
}) {
  const supabase = await createClient();

  if (!input.name.trim() || !input.categoryId || !input.brandName.trim()) {
    return { ok: false, error: "Completá nombre, categoría y marca." };
  }

  // El slug lo leemos acá y no lo tomamos del cliente: es lo que decide si
  // el stock va en una variante oculta o si lo maneja el gestor de variantes.
  const { data: categoria } = await supabase
    .from("categories")
    .select("slug")
    .eq("id", input.categoryId)
    .maybeSingle();

  const conVariantes = usaVariantes(categoria?.slug);
  const stock = Math.max(0, input.stock ?? 0);

  const brandResult = await findOrCreateBrandId(supabase, input.brandName);
  if ("error" in brandResult) {
    return { ok: false, error: brandResult.error };
  }

  // attributes: guardamos puffs solo si viene (para vapers)
  const attributes = input.puffs ? { puffs: input.puffs } : {};

  const productData = {
    name: input.name.trim(),
    model: input.model.trim() || null,
    description: input.description.trim() || null,
    base_price: input.basePrice,
    category_id: input.categoryId,
    brand_id: brandResult.id,
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

    if (!conVariantes) {
      const sincronizado = await sincronizarVarianteUnica(
        supabase,
        input.id,
        stock
      );
      if (!sincronizado.ok) return sincronizado;
    }
  } else {
    // ALTA: insert. Pedimos el id de vuelta porque lo necesitamos para
    // crearle la variante única a los productos de una sola presentación.
    const { data: creado, error } = await supabase
      .from("products")
      .insert(productData)
      .select("id")
      .single();

    if (error || !creado) {
      console.error("Error al crear producto:", error);
      return { ok: false, error: "No se pudo crear el producto." };
    }

    if (!conVariantes) {
      const variante = await addVariant({
        productId: creado.id,
        name: VARIANTE_UNICA,
        stock,
      });

      if (!variante.ok) {
        return {
          ok: false,
          error: "Se creó el producto pero no se pudo guardar el stock.",
        };
      }
    }
  }

  updateTag(CATALOG_TAG);
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

  updateTag(CATALOG_TAG);
  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  return { ok: true };
}

// Agregar una variante nueva a un producto
export async function addVariant(input: {
  productId: string;
  name: string;
  stock: number;
  // Opcional: si no viene, la variante se vende al precio base del producto.
  priceOverride?: number | null;
}) {
  const supabase = await createClient();

  if (!input.name.trim()) {
    return { ok: false, error: "La variante necesita un nombre." };
  }

  const { error } = await supabase.from("product_variants").insert({
    product_id: input.productId,
    name: input.name.trim(),
    stock: input.stock,
    price_override: input.priceOverride ?? null,
  });

  if (error) {
    return { ok: false, error: "No se pudo agregar la variante." };
  }

  updateTag(CATALOG_TAG);
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

  updateTag(CATALOG_TAG);
  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  return { ok: true };
}

// Reactivar una variante que había sido desactivada
export async function restoreVariant(id: string) {
  const supabase = await createClient();

  // Pedimos la fila de vuelta con .select(): si RLS bloquea el UPDATE,
  // Supabase no tira error, simplemente no actualiza nada. Sin esto la
  // pantalla diría "listo" sin haber cambiado la variante.
  const { data, error } = await supabase
    .from("product_variants")
    .update({ is_active: true })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Error al reactivar variante:", error);
    return { ok: false, error: "No se pudo reactivar la variante." };
  }

  if (!data) {
    return {
      ok: false,
      error: "No se pudo reactivar la variante (revisá los permisos).",
    };
  }

  updateTag(CATALOG_TAG);
  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  return { ok: true };
}

// Un producto de una sola presentación guarda su stock en una única variante
// que el admin nunca ve. Esto la mantiene en sincronía con el formulario.
async function sincronizarVarianteUnica(
  supabase: Awaited<ReturnType<typeof createClient>>,
  productId: string,
  stock: number
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: activas, error: readError } = await supabase
    .from("product_variants")
    .select("id")
    .eq("product_id", productId)
    .eq("is_active", true);

  if (readError || !activas) {
    console.error("Error al leer las variantes:", readError);
    return { ok: false, error: "No se pudo leer el stock del producto." };
  }

  // Más de una variante activa significa que el producto viene de una
  // categoría con variantes. No tocamos nada: la pantalla de edición
  // muestra el gestor igual para que ese stock no quede inalcanzable.
  if (activas.length > 1) {
    return { ok: true };
  }

  // Ninguna variante: producto cargado antes de este cambio, o que cambió
  // de categoría. Le creamos la suya.
  if (activas.length === 0) {
    const { error } = await supabase.from("product_variants").insert({
      product_id: productId,
      name: VARIANTE_UNICA,
      stock,
    });

    if (error) {
      console.error("Error al crear la variante única:", error);
      return { ok: false, error: "No se pudo guardar el stock." };
    }

    return { ok: true };
  }

  const { error } = await supabase
    .from("product_variants")
    .update({ stock })
    .eq("id", activas[0].id);

  if (error) {
    console.error("Error al actualizar el stock:", error);
    return { ok: false, error: "No se pudo guardar el stock." };
  }

  return { ok: true };
}

async function findOrCreateBrandId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  rawName: string
): Promise<{ id: string } | { error: string }> {
  const name = rawName.trim();
  if (!name) return { error: "La marca no puede estar vacía." };

  // 1. Si existe una marca con ese nombre
  const { data: existing } = await supabase
    .from("brands")
    .select("id")
    .ilike("name", name)
    .maybeSingle();

  if (existing) return { id: existing.id };

  // 2. No existe
  const slug = slugify(name);
  const { data: created, error } = await supabase
    .from("brands")
    .insert({ name, slug })
    .select("id")
    .single();

  if (!error && created) return { id: created.id };

  // 3. Caso borde: el slug quedó duplicado (ej. "Elf Bar" y "elf-bar" ya
  // existía con otro casing). Buscamos por slug antes de rendirnos.
  if (error?.code === "23505") {
    const { data: bySlug } = await supabase
      .from("brands")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (bySlug) return { id: bySlug.id };
  }

  console.error("Error al crear marca:", error);
  return { error: "No se pudo crear la marca." };
}