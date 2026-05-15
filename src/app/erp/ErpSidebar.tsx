"use client";

import SignOutButton from "@/components/auth/SignOutButton";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FileText,
  Home,
  Image as ImageIcon,
  LogOut,
  Menu,
  Megaphone,
  MicVocal,
  Newspaper,
  Rss,
  Settings,
  Shield,
  UserSquare2,
  Users,
  Waypoints,
  LayoutTemplate,
  X,
} from "lucide-react";

type ErpSidebarProps = {
  podcastsEnabled: boolean;
  mediaEnabled: boolean;
  podeVerArtigos: boolean;
  podeVerRevistas: boolean;
  podeGerirCategorias: boolean;
  podeGerirEntidades: boolean;
  podeVerFontes: boolean;
  podeVerMidia: boolean;
  podeVerAnuncios: boolean;
  podeVerMidiaKit: boolean;
  podeVerPodcasts: boolean;
  podeVerCuradoria: boolean;
  podeGerirCuradoria: boolean;
  podeGerirUsuarios: boolean;
  usuario: {
    nome: string | null;
    email: string | null;
    role: string;
    perfis: string[];
  };
};

function formatarPerfil(perfis: string[], role: string) {
  const perfil = perfis[0] ?? role;

  return perfil.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function obterIniciais(nome: string | null, email: string | null) {
  const origem = nome?.trim() || email?.trim() || "ERP";
  const partes = origem.split(/\s+/).filter(Boolean);

  if (partes.length === 1) {
    return partes[0].slice(0, 2).toUpperCase();
  }

  return `${partes[0][0] ?? ""}${partes[1][0] ?? ""}`.toUpperCase();
}

function SidebarLink({
  href,
  label,
  icon,
  collapsed,
  active,
  subtle = false,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  collapsed: boolean;
  active: boolean;
  subtle?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      className={`flex items-center rounded-xl px-3 py-2.5 transition-colors ${
        collapsed ? "justify-center" : "gap-3"
      } ${
        active
          ? "bg-red-500/15 text-white"
          : subtle
            ? "text-gray-400 hover:bg-gray-800 hover:text-white"
            : "text-gray-300 hover:bg-gray-800 hover:text-white"
      }`}
    >
      <span className="shrink-0">{icon}</span>
      {!collapsed && <span className="truncate text-sm font-medium">{label}</span>}
    </Link>
  );
}

export default function ErpSidebar({
  podcastsEnabled,
  mediaEnabled,
  podeVerArtigos,
  podeVerRevistas,
  podeGerirCategorias,
  podeGerirEntidades,
  podeVerFontes,
  podeVerMidia,
  podeVerAnuncios,
  podeVerMidiaKit,
  podeVerPodcasts,
  podeVerCuradoria,
  podeGerirCuradoria,
  podeGerirUsuarios,
  usuario,
}: ErpSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(() => /^\/erp\/revistas\/(?!nova(?:\/|$))[^/]+/.test(pathname));
  const [mobileOpen, setMobileOpen] = useState(false);
  const iniciais = obterIniciais(usuario.nome, usuario.email);
  const perfilPrincipal = formatarPerfil(usuario.perfis, usuario.role);

  const isActive = (href: string) => pathname === href || (href !== "/erp" && pathname.startsWith(`${href}/`));
  const closeMobile = () => setMobileOpen(false);

  return (
    <>
    <button
      type="button"
      onClick={() => setMobileOpen(true)}
      className="fixed left-4 top-4 z-[900] inline-flex items-center gap-2 rounded-xl border border-gray-800 bg-gray-950 px-3 py-2 text-sm font-bold text-white shadow-2xl transition hover:bg-gray-900 md:hidden"
      aria-label="Abrir menu do ERP"
    >
      <Menu className="h-5 w-5 text-red-400" />
      Menu
    </button>

    {mobileOpen && (
      <button
        type="button"
        className="fixed inset-0 z-[950] bg-gray-950/70 backdrop-blur-sm md:hidden"
        aria-label="Fechar menu do ERP"
        onClick={closeMobile}
      />
    )}

    <aside
      className={`fixed inset-y-0 left-0 z-[960] w-80 max-w-[86vw] -translate-x-full bg-gray-900 px-4 py-3 text-white shadow-2xl transition-transform duration-200 md:sticky md:top-0 md:z-auto md:h-screen md:max-w-none md:translate-x-0 md:self-start md:overflow-hidden md:shadow-none md:transition-[width] md:duration-200 ${
        mobileOpen ? "translate-x-0" : ""
      } ${
        collapsed ? "md:w-24" : "md:w-72"
      }`}
    >
      <div className="flex h-full flex-col">
        <div className={`mb-4 flex items-center ${collapsed ? "justify-center" : "justify-between gap-3"}`}>
          {!collapsed && <h2 className="text-2xl font-black tracking-tight text-nowrap">Gestao ERP</h2>}
          <button
            type="button"
            onClick={closeMobile}
            className="rounded-xl border border-gray-800 bg-gray-800/60 p-2 text-gray-300 transition hover:bg-gray-800 hover:text-white md:hidden"
            aria-label="Fechar sidebar"
            title="Fechar sidebar"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className="hidden rounded-xl border border-gray-800 bg-gray-800/60 p-2 text-gray-300 transition hover:bg-gray-800 hover:text-white md:inline-flex"
            aria-label={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
            title={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>

        <nav
          className={`erp-sidebar-nav flex flex-1 flex-col gap-1.5 overflow-y-auto pr-1 ${
            collapsed ? "erp-sidebar-scrollbar-hidden md:overflow-y-auto" : "erp-sidebar-scrollbar md:overflow-y-scroll"
          }`}
        >
          <SidebarLink
            href="/"
            label="Voltar ao Portal"
            icon={<ChevronLeft className="h-4 w-4" />}
            collapsed={collapsed}
            active={false}
            subtle
            onNavigate={closeMobile}
          />

          <SidebarLink
            href="/erp"
            label="Painel Principal"
            icon={<Home className="h-4 w-4 text-red-500" />}
            collapsed={collapsed}
            active={isActive("/erp")}
            onNavigate={closeMobile}
          />

          <div className="my-2 h-px bg-gray-800" />

          {podeVerArtigos && (
            <SidebarLink
              href="/erp/artigos"
              label="Artigos"
              icon={<FileText className="h-4 w-4 text-red-400" />}
              collapsed={collapsed}
              active={isActive("/erp/artigos")}
              onNavigate={closeMobile}
            />
          )}
          {podeVerRevistas && (
            <SidebarLink
              href="/erp/revistas"
              label="Revistas"
              icon={<Newspaper className="h-4 w-4 text-red-400" />}
              collapsed={collapsed}
              active={isActive("/erp/revistas")}
              onNavigate={closeMobile}
            />
          )}
          {podeVerMidiaKit && (
            <SidebarLink
              href="/erp/midia-kit"
              label="Mídia Kit"
              icon={<LayoutTemplate className="h-4 w-4 text-red-400" />}
              collapsed={collapsed}
              active={isActive("/erp/midia-kit")}
              onNavigate={closeMobile}
            />
          )}
          {podeGerirCategorias && (
            <SidebarLink
              href="/erp/categorias"
              label="Categorias"
              icon={<BookOpen className="h-4 w-4 text-red-400" />}
              collapsed={collapsed}
              active={isActive("/erp/categorias")}
              onNavigate={closeMobile}
            />
          )}
          {podeGerirEntidades && (
            <SidebarLink
              href="/erp/entidades"
              label="Entidades"
              icon={<Users className="h-4 w-4 text-red-400" />}
              collapsed={collapsed}
              active={isActive("/erp/entidades")}
              onNavigate={closeMobile}
            />
          )}
          {mediaEnabled && podeVerMidia && (
            <SidebarLink
              href="/erp/midia"
              label="Biblioteca de Midia"
              icon={<ImageIcon className="h-4 w-4 text-red-400" />}
              collapsed={collapsed}
              active={isActive("/erp/midia")}
              onNavigate={closeMobile}
            />
          )}
          {podeVerAnuncios && (
            <SidebarLink
              href="/erp/anuncios"
              label="Anuncios"
              icon={<Megaphone className="h-4 w-4 text-red-400" />}
              collapsed={collapsed}
              active={isActive("/erp/anuncios")}
              onNavigate={closeMobile}
            />
          )}
          {podeVerFontes && (
            <SidebarLink
              href="/erp/fontes"
              label="Fontes"
              icon={<UserSquare2 className="h-4 w-4 text-red-400" />}
              collapsed={collapsed}
              active={isActive("/erp/fontes")}
              onNavigate={closeMobile}
            />
          )}
          {podcastsEnabled && podeVerPodcasts && (
            <SidebarLink
              href="/erp/podcasts"
              label="Podcasts"
              icon={<MicVocal className="h-4 w-4 text-red-400" />}
              collapsed={collapsed}
              active={isActive("/erp/podcasts")}
              onNavigate={closeMobile}
            />
          )}

          {podeGerirUsuarios && (
            <>
              <div className="my-2 h-px bg-gray-800" />
              {!collapsed && (
                <div className="px-2 py-1 text-[10px] font-black uppercase tracking-widest italic text-gray-500">
                  Administração
                </div>
              )}
              <SidebarLink
                href="/erp/usuarios"
                label="Usuários"
                icon={<Users className="h-4 w-4 text-red-400" />}
                collapsed={collapsed}
                active={isActive("/erp/usuarios")}
                onNavigate={closeMobile}
              />
              <SidebarLink
                href="/erp/permissoes"
                label="Permissões"
                icon={<Shield className="h-4 w-4 text-red-400" />}
                collapsed={collapsed}
                active={isActive("/erp/permissoes")}
                onNavigate={closeMobile}
              />
              <SidebarLink
                href="/erp/configuracoes"
                label="Configurações"
                icon={<Settings className="h-4 w-4 text-red-400" />}
                collapsed={collapsed}
                active={isActive("/erp/configuracoes")}
                onNavigate={closeMobile}
              />
            </>
          )}

          <div className="my-2 h-px bg-gray-800" />

          {(podeVerCuradoria || podeGerirCuradoria) && (
            <>
              {!collapsed && (
                <div className="px-2 py-1 text-[10px] font-black uppercase tracking-widest italic text-gray-500">
                  Inteligência
                </div>
              )}
              {podeVerCuradoria && (
                <SidebarLink
                  href="/erp/curadoria/dashboard"
                  label="Republicar RSS"
                  icon={<Waypoints className="h-4 w-4 text-indigo-400" />}
                  collapsed={collapsed}
                  active={isActive("/erp/curadoria/dashboard")}
                  onNavigate={closeMobile}
                />
              )}
              {podeGerirCuradoria && (
                <SidebarLink
                  href="/erp/curadoria/fontes"
                  label="Gerenciar Feeds"
                  icon={<Rss className="h-4 w-4 text-indigo-400" />}
                  collapsed={collapsed}
                  active={isActive("/erp/curadoria/fontes")}
                  onNavigate={closeMobile}
                />
              )}
            </>
          )}

          <div className="my-2 h-px bg-gray-800" />
        </nav>

        <div className="mt-3 space-y-2">
          <SignOutButton
            className={`inline-flex w-full items-center rounded-xl px-3 py-2.5 font-medium text-red-400 transition-colors hover:bg-red-500/10 ${
              collapsed ? "justify-center" : "gap-3"
            }`}
          >
            {collapsed ? (
              <span className="inline-flex items-center justify-center" title="Sair">
                <LogOut className="h-4 w-4" />
              </span>
            ) : (
              <>
                <LogOut className="h-4 w-4 shrink-0" />
                <span>Sair</span>
              </>
            )}
          </SignOutButton>

          <div
            className={`rounded-2xl border border-gray-800 bg-gray-800/60 ${
              collapsed ? "px-2 py-3" : "px-3 py-3.5"
            }`}
            title={
              collapsed
                ? `${usuario.nome ?? "Usuário autenticado"}${usuario.email ? `\n${usuario.email}` : ""}`
                : undefined
            }
          >
            <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-600/15 text-sm font-black uppercase tracking-widest text-red-300 ring-1 ring-red-500/20">
                {iniciais}
              </div>

              {!collapsed && (
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">
                    {usuario.nome ?? "Usuário autenticado"}
                  </div>
                  <div className="truncate text-xs text-gray-400">{usuario.email ?? "Sem email informado"}</div>
                  <div className="mt-1 inline-flex max-w-full items-center rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-red-300">
                    <span className="truncate">{perfilPrincipal}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
    </>
  );
}
