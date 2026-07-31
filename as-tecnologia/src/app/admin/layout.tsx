import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/lib/actions/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between border-b border-surface-elevated pb-4">
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/admin" className="font-bold">
            Panel
          </Link>
          <Link href="/admin/productos" className="text-muted hover:text-foreground">
            Productos
          </Link>
          <Link href="/admin/ordenes" className="text-muted hover:text-foreground">
            Órdenes
          </Link>
        </nav>
        <form action={logout}>
          <button className="rounded-lg px-3 py-1.5 text-sm text-muted hover:bg-surface-elevated">
            Cerrar sesión
          </button>
        </form>
      </header>
      {children}
    </div>
  );
}