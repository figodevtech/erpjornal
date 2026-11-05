"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { Loader2, Lock } from "lucide-react";

import { useSessaoPortal } from "@/components/auth/useSessaoPortal";
import TTSPlayer from "@/components/portal/TTSPlayer";
import { dividirParaAnuncio } from "@/lib/html/trechos";

type Props = {
  slug: string;
  titulo: string;
  /** Trecho inicial já sanitizado no servidor (vai no HTML estático). */
  trechoHtml: string;
  /** Anúncio do meio do texto (Server Component passado como prop). */
  anuncioMeio: ReactNode;
};

/**
 * Corpo de matéria exclusiva numa página estática (ISR).
 * O HTML estático só traz o trecho inicial; com sessão, o corpo completo é
 * buscado em /api/articles/[slug]/conteudo, que confere a sessão no servidor.
 */
export default function CorpoPremium({ slug, titulo, trechoHtml, anuncioMeio }: Props) {
  const sessao = useSessaoPortal();
  const [corpo, setCorpo] = useState<string | null>(null);
  const [falhou, setFalhou] = useState(false);

  useEffect(() => {
    if (!sessao?.user) return;
    let ativo = true;
    fetch(`/api/articles/${encodeURIComponent(slug)}/conteudo`, { cache: "no-store" })
      .then(async (resposta) => {
        if (!resposta.ok) throw new Error(String(resposta.status));
        const dados = (await resposta.json()) as { corpoTexto: string };
        if (ativo) setCorpo(dados.corpoTexto);
      })
      .catch(() => ativo && setFalhou(true));
    return () => {
      ativo = false;
    };
  }, [sessao, slug]);

  if (corpo) {
    const { antes, depois } = dividirParaAnuncio(corpo);
    return (
      <>
        <div className="not-prose mb-8 font-sans">
          <TTSPlayer htmlContent={corpo} title={titulo} />
        </div>
        <div dangerouslySetInnerHTML={{ __html: antes }} />
        <div className="not-prose my-12 font-sans">{anuncioMeio}</div>
        {depois && <div dangerouslySetInnerHTML={{ __html: depois }} />}
      </>
    );
  }

  const verificando = sessao === undefined || (sessao?.user && !falhou);

  return (
    <div className="relative max-h-[300px] overflow-hidden mask-fade-to-bottom">
      <div className="pointer-events-none opacity-40" dangerouslySetInnerHTML={{ __html: trechoHtml }} />

      <div className="not-prose absolute inset-0 flex flex-col items-center justify-end bg-gradient-to-t from-white via-white/95 to-transparent px-4 pb-10 text-center dark:from-gray-950 dark:via-gray-950/95">
        {verificando ? (
          <div className="flex items-center gap-2 text-sm font-bold text-gray-500" role="status">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando matéria…
          </div>
        ) : (
          <div className="max-w-sm transform rounded-3xl border-2 border-red-700/30 bg-gray-900 p-8 shadow-2xl sm:scale-110">
            <div className="mx-auto -mt-14 mb-4 flex h-12 w-12 items-center justify-center rounded-full border-4 border-gray-900 bg-red-700 shadow-xl">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-2 text-xl font-black uppercase tracking-tight text-white">Conteúdo Exclusivo</h3>
            <p className="mb-6 text-sm font-medium text-gray-400">
              {falhou
                ? "Não foi possível carregar a matéria agora. Tente recarregar a página."
                : "Esta matéria é reservada para leitores cadastrados da Revista Gestão."}
            </p>
            <div className="space-y-3">
              <Link
                href={`/login?callbackUrl=${encodeURIComponent(`/noticia/${slug}`)}`}
                className="block w-full rounded-xl bg-red-700 py-4 text-xs font-black uppercase text-white shadow-lg transition-all hover:bg-red-600"
              >
                Já tenho conta / Entrar
              </Link>
              <Link
                href="/assine"
                className="block w-full rounded-xl bg-gray-800 py-4 text-xs font-black uppercase text-gray-300 transition-all hover:bg-gray-700"
              >
                Quero ter acesso
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
