import { exigirAcessoErp, temAlgumaPermissao, temPermissao } from "@/lib/auth";
import { isModuleEnabled } from "@/lib/config/modules";
import ErpSidebar from "./ErpSidebar";

export default async function ERPLayout({ children }: { children: React.ReactNode }) {
  const sessao = await exigirAcessoErp();

  const podcastsEnabled = isModuleEnabled("podcasts");
  const mediaEnabled = isModuleEnabled("videos");
  const podeVerArtigos = temAlgumaPermissao(sessao, ["artigos:ler", "artigos:criar", "artigos:editar", "artigos:publicar"]);
  const podeGerirCategorias = temPermissao(sessao, "categorias:gerir");
  const podeGerirPoliticos = temPermissao(sessao, "politicos:gerir");
  const podeVerFontes = temAlgumaPermissao(sessao, ["fontes:ler", "fontes:criar", "fontes:editar"]);
  const podeVerMidia = temAlgumaPermissao(sessao, ["midia:ler", "midia:criar", "midia:editar"]);
  const podeVerPodcasts = temAlgumaPermissao(sessao, ["podcasts:ler", "podcasts:criar", "podcasts:editar"]);
  const podeVerCuradoria = temAlgumaPermissao(sessao, ["curadoria:ler", "curadoria:aprovar"]);
  const podeGerirCuradoria = temPermissao(sessao, "curadoria:gerir");
  const podeGerirUsuarios = temPermissao(sessao, "usuarios:gerir");

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 md:flex-row">
      <ErpSidebar
        podcastsEnabled={podcastsEnabled}
        mediaEnabled={mediaEnabled}
        podeVerArtigos={podeVerArtigos}
        podeGerirCategorias={podeGerirCategorias}
        podeGerirPoliticos={podeGerirPoliticos}
        podeVerFontes={podeVerFontes}
        podeVerMidia={podeVerMidia}
        podeVerPodcasts={podeVerPodcasts}
        podeVerCuradoria={podeVerCuradoria}
        podeGerirCuradoria={podeGerirCuradoria}
        podeGerirUsuarios={podeGerirUsuarios}
        usuario={{
          nome: sessao.user.name,
          email: sessao.user.email,
          role: sessao.user.role,
          perfis: sessao.user.perfis,
        }}
      />

      <main className="flex-1 p-4 md:px-8 md:py-6">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
