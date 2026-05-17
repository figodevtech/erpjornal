import { Suspense } from "react";

import { exigirAcessoErp, temPermissao } from "@/lib/auth";
import { getAppConfigSnapshot } from "@/lib/app-config";
import { isModuleEnabled } from "@/lib/config/modules";
import ErpSidebar from "./ErpSidebar";
import ErpConfigLoading from "./ErpConfigLoading";
import { ErpConfigProvider } from "./config/ErpConfigProvider";

export default async function ERPLayout({ children }: { children: React.ReactNode }) {
  const sessao = await exigirAcessoErp();
  const configPromise = getAppConfigSnapshot();

  const podcastsEnabled = isModuleEnabled("podcasts");
  const mediaEnabled = isModuleEnabled("videos");
  const podeVerArtigos = temPermissao(sessao, "artigos:ler");
  const podeVerRevistas = temPermissao(sessao, "revistas:ler");
  const podeGerirCategorias = temPermissao(sessao, "categorias:ler");
  const podeGerirEntidades = temPermissao(sessao, "entidades:ler");
  const podeVerFontes = temPermissao(sessao, "fontes:ler");
  const podeVerMidia = temPermissao(sessao, "midia:ler");
  const podeVerAnuncios = temPermissao(sessao, "anuncios:ler");
  const podeVerMidiaKit = temPermissao(sessao, "midia-kit:ler");
  const podeVerPodcasts = temPermissao(sessao, "podcasts:ler");
  const podeVerCuradoria = temPermissao(sessao, "curadoria:ler");
  const podeGerirCuradoria = temPermissao(sessao, "curadoria:gerir");
  const podeGerirUsuarios = temPermissao(sessao, "usuarios:gerir");

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
          <ErpConfigLoading />
        </div>
      }
    >
      <ErpConfigProvider configPromise={configPromise}>
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
            podeVerAnuncios={podeVerAnuncios}
            podeVerMidiaKit={podeVerMidiaKit}
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

          <main className="flex-1 p-4 pt-20 md:px-8 md:py-6">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </ErpConfigProvider>
    </Suspense>
  );
}
