// Piezas compartidas de formulario: el estilo de los inputs y la etiqueta.
//
// Vivían al final de product-form.tsx, pero el checkout las necesita igual y no
// tiene sentido que un componente público importe del panel admin. Acá quedan
// disponibles para los dos.

// Estilo compartido de los inputs
export const inputClass =
  "rounded-lg border border-surface-elevated bg-surface px-3 py-2 text-sm outline-none focus:border-primary w-full";

// Componentito para etiqueta + campo
export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
