export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-slate-900">
        Categoria: <span className="text-indigo-600">{resolvedParams.slug}</span>
      </h1>
      <p className="mt-4 text-slate-500">
        Listagem de artigos para esta categoria em breve.
      </p>
    </div>
  );
}
