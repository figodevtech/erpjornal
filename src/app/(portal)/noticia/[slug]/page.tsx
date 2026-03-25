export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;

  return (
    <article className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-extrabold text-slate-900">
        Lendo Notícia: {resolvedParams.slug}
      </h1>
      <div className="mt-8 prose prose-slate max-w-none">
        <p>O conteúdo completo do artigo será renderizado aqui na etapa M1-MVP-T3.</p>
      </div>
    </article>
  );
}
