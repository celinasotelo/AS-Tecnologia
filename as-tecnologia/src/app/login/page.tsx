import { login } from "@/lib/actions/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4">
      <form
        action={login}
        className="w-full max-w-sm rounded-xl bg-surface-card p-6"
      >
        <h1 className="text-xl font-bold">Panel AS Tecnología</h1>
        <p className="mt-1 text-sm text-muted">
          Ingresá para gestionar la tienda.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            className="rounded-lg border border-surface-elevated bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Contraseña"
            className="rounded-lg border border-surface-elevated bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
          />

          {error && (
            <p className="text-sm text-danger">
              Email o contraseña incorrectos.
            </p>
          )}

          <button
            type="submit"
            className="mt-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary-light"
          >
            Ingresar
          </button>
        </div>
      </form>
    </main>
  );
}