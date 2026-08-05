"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { saveProductImage, deleteProductImage } from "@/lib/actions/images";

type ProductImage = {
  id: string;
  url: string;
  sort_order: number;
  variant_id: string | null;
};

type Variant = { id: string; name: string };

export function ImageManager({
  productId,
  images,
  variants,
}: {
  productId: string;
  images: ProductImage[];
  variants: Variant[];
}) {
  const [selectedVariant, setSelectedVariant] = useState(""); // "" = imagen general
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = async (file: File) => {
    setError(null);
    setUploading(true);

    // Paso 1: subir el archivo directo a Storage, desde el navegador
    const supabase = createClient();
    const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "-").toLowerCase();
    const path = `${productId}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, file);

    if (uploadError) {
      console.error("Error al subir a Storage:", uploadError);
      setError("No se pudo subir la imagen.");
      setUploading(false);
      return;
    }

    // Paso 2: pedirle a Storage la URL pública del archivo recién subido
    const { data: publicUrlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(path);

    // Paso 3: guardar solo la URL en la base, vía Server Action
    const result = await saveProductImage({
      productId,
      variantId: selectedVariant || null,
      url: publicUrlData.publicUrl,
      sortOrder: images.length,
    });

    setUploading(false);

    if (!result.ok) {
      setError(result.error ?? "No se pudo guardar la imagen.");
      return;
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm("¿Eliminar esta imagen?")) return;
    await deleteProductImage(imageId, productId);
  };

  return (
    <div>
      <h2 className="text-xl font-bold">Imágenes</h2>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select
          value={selectedVariant}
          onChange={(e) => setSelectedVariant(e.target.value)}
          className="rounded-lg border border-surface-elevated bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="">Imagen general del producto</option>
          {variants.map((v) => (
            <option key={v.id} value={v.id}>
              Sabor: {v.name}
            </option>
          ))}
        </select>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelected(file);
          }}
          className="text-sm text-muted"
        />

        {uploading && <span className="text-sm text-muted">Subiendo...</span>}
      </div>

      {error && <p className="mt-2 text-sm text-danger">{error}</p>}

      <div className="mt-4 flex flex-wrap gap-3">
        {images.length === 0 && (
          <p className="text-sm text-muted">Todavía no hay imágenes.</p>
        )}
        {images.map((img) => (
          <div
            key={img.id}
            className="relative h-24 w-24 overflow-hidden rounded-lg bg-white"
          >
            <Image
              src={img.url}
              alt=""
              fill
              sizes="96px"
              className="object-contain"
            />
            <button
              onClick={() => handleDelete(img.id)}
              aria-label="Eliminar imagen"
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-danger"
            >
              <Trash2 size={12} />
            </button>
            {img.variant_id && (
              <span className="absolute bottom-0 left-0 right-0 truncate bg-black/60 px-1 text-center text-[10px] text-white">
                {variants.find((v) => v.id === img.variant_id)?.name}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}