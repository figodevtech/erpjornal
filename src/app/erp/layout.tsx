import { exigirAcessoErp, temPermissao } from "@/lib/auth";
import { isModuleEnabled } from "@/lib/config/modules";
import ErpSidebar from "./ErpSidebar";

export default async function ERPLayout({ children }: { children: React.ReactNode }) {
  const sessao = await exigirAcessoErp();

  const podcastsEnabled = isModuleEnabled("podcasts");
  const mediaEnabled = isModuleEnabled("videos");
  const podeVerArtigos = temPermissao(sessao, "artigos:ler");
  const podeVerRevistas = temPermissao(sessao, "revistas:ler");
  const podeGerirCategorias = temPermissao(sessao, "categorias:ler");
  const podeGerirEntidades = temPermissao(sessao, "entidades:ler");
  const podeVerFontes = temPermissao(sessao, "fontes:ler");
  const podeVerMidia = temPermissao(sessao, "midia:ler");
  const podeVerPodcasts = temPermissao(sessao, "podcasts:ler");
  const podeVerCuradoria = temPermissao(sessao, "curadoria:ler");
  const podeGerirCuradoria = temPermissao(sessao, "curadoria:gerir");
  const podeGerirUsuarios = temPermissao(sessao, "usuarios:gerir");

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 md:flex-row">
      <ErpSidebar
        podcastsEnabled={podcastsEnabled}
        mediaEnabled={mediaEnabled}
        podeVerArtigos={podeVerArtigos}
        podeVerRevistas={podeVerRevistas}
        podeGerirCategorias={podeGerirCategorias}
        podeGerirEntidades={podeGerirEntidades}
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
