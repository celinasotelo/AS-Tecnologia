import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: categories, error } = await supabase
    .from("categories")
    .select("*");

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">AS Tecnología</h1>
      <ul className="mt-4">
        {categories.map((cat) => (
          <li key={cat.id}>{cat.name}</li>
        ))}
      </ul>
    </main>
  );
}