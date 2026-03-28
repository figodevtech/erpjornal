import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ArticleForm, { InitialData } from "../../components/ArticleForm";
import Link from "next/link";
import { redirect } from "next/navigation";

// Next.js 15 exige Promise on params
export default async function EditarArtigoPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin");

  const resolvedParams = await params;
  const id = resolvedParams.id;

  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      fact_checks: true,
      politicos: { select: { id: true } }
    }
  }) as unknown as InitialData;

  if (!article) {
    redirect("/erp/artigos");
  }

  // PrevenÃ§Ã£o Rigorosa de EdiÃ§Ã£o se Reporter tentar editar artigo de outros
  if (session.user.role === "reporter" && article.autor_id !== session.user.id) {
    redirect("/erp/artigos");
  }

  const politicians = await prisma.politician.findMany({
    select: { id: true, nome: true, partido: true },
    orderBy: { nome: "asc" }
  });

  const categories = await prisma.category.findMany({
    select: { id: true, nome: true },
    orderBy: { nome: "asc" }
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link 
          href="/erp/artigos" 
          className="text-gray-400 hover:text-gray-900 bg-white hover:bg-gray-100 p-2 rounded-full shadow-sm transition-all border border-gray-200"
          aria-label="Voltar para a listagem"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Editar MatÃ©ria</h1>
          <p className="text-sm text-gray-500 mt-1">Modificando o workflow ou conteÃºdo do artigo original.</p>
        </div>
      </div>

      <ArticleForm categories={categories} politicians={politicians} userRole={session.user.role} initialData={article} />
    </div>
  );
}

