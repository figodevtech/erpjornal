"use client";

import { useState, useRef, useEffect } from "react";
import { signIn, signOut } from "next-auth/react";
import { UserCircle, LogOut, LogIn, Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AuthPortalProps {
  session: any; // Can pass session from server component or fetch client side
}

export default function AuthPortal({ session }: AuthPortalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setError(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("E-mail ou senha incorretos.");
      } else {
        setIsOpen(false);
        router.refresh();
      }
    } catch (err) {
      setError("Ocorreu um erro ao tentar entrar.");
    } finally {
      setIsLoading(false);
    }
  };

  const user = session?.user;

  return (
    <div className="relative" ref={menuRef}>
      {user ? (
        /* ESTADO LOGADO: USER MENU */
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 text-white hover:text-red-400 transition-colors focus:outline-none"
        >
          <UserCircle className="w-4 h-4" />
          <span className="max-w-[100px] truncate">Olá, {user.name?.split(' ')[0]}</span>
        </button>
      ) : (
        /* ESTADO DESLOGADO: LOGIN TRIGGER */
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 bg-red-700 text-white px-3 py-1 rounded-sm hover:bg-red-600 transition-colors focus:outline-none font-bold"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>LOGIN</span>
        </button>
      )}

      {/* DROPDOWNS */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-2xl z-[100] border border-slate-100 animate-in fade-in zoom-in duration-200 overflow-hidden">
          
          {user ? (
            /* CONTEÚDO USER MENU (LOGADO) */
            <div className="py-2">
              <div className="px-5 py-4 border-b border-slate-100 mb-2 bg-slate-50/50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Perfil Ativo</p>
                <p className="text-sm font-black text-slate-900 truncate">{user.name}</p>
                <p className="text-[11px] font-medium text-slate-500 truncate">{user.email}</p>
              </div>
              
              <Link 
                href="/perfil" 
                className="flex items-center gap-3 px-5 py-3 text-sm text-slate-700 hover:bg-red-50 hover:text-red-700 transition-all font-bold"
                onClick={() => setIsOpen(false)}
              >
                <UserCircle className="w-5 h-5 opacity-50" />
                Minha Conta
              </Link>

              {["admin", "editor", "reporter", "juridico"].includes(user.role) && (
                <Link 
                  href="/erp/artigos" 
                  className="flex items-center gap-3 px-5 py-3 text-sm text-slate-700 hover:bg-red-50 hover:text-red-700 transition-all font-bold"
                  onClick={() => setIsOpen(false)}
                >
                  <Lock className="w-5 h-5 opacity-50" />
                  Painel Editorial
                </Link>
              )}

              <button
                onClick={() => {
                  setIsOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="flex w-full items-center gap-3 px-5 py-4 text-sm text-red-600 hover:bg-red-50 transition-all font-black border-t border-slate-100 mt-2"
              >
                <LogOut className="w-5 h-5" />
                SAIR DO PORTAL
              </button>
            </div>
          ) : (
            /* CONTEÚDO LOGIN DROPDOWN (DESLOGADO) */
            <div className="p-6">
              <div className="mb-6 text-center">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Revista Gestão</h3>
                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mt-1">Acesso Exclusivo</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border-l-4 border-red-600 flex items-center gap-2 text-red-700 text-xs font-bold rounded-r-md animate-in slide-in-from-top-1">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="email" 
                      required
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Senha</label>
                    <Link href="/recuperar" className="text-[10px] font-bold text-red-600 hover:text-red-700 transition-colors uppercase">Esqueci</Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="password" 
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all text-slate-900"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-red-700 hover:bg-red-600 disabled:bg-slate-300 text-white font-black uppercase text-xs py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "ENTRAR AGORA"
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-400 font-medium mb-2">Não tem uma conta?</p>
                <Link href="/assine" className="text-xs font-black text-red-700 hover:text-red-800 uppercase tracking-tight">Assinar Revista Gestão</Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
