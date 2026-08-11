import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Cliente para datos PÚBLICOS del catálogo, sin cookies.
 *
 * Los otros dos clientes leen la sesión:
 *   - server.ts  -> usa cookies() para saber quién entró (admin, órdenes)
 *   - client.ts  -> corre en el navegador (subida de imágenes)
 *
 * Este no. Y esa es justamente la gracia: unstable_cache no deja usar APIs
 * dinámicas como cookies() adentro de una función cacheada, así que el catálogo
 * no se podía cachear mientras pasara por server.ts.
 *
 * Como no manda cookie, Supabase lo trata como rol `anon`. Para el catálogo da
 * igual: es exactamente lo que ve un cliente que entra a comprar. No usarlo
 * nunca para nada del admin ni de órdenes.
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Sin sesión que guardar ni token que refrescar: es siempre anónimo.
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
