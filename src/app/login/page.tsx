"use client";

import { signIn, getSession } from "next-auth/react";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LogIn, UserCircle, Mail, Lock } from "lucide-react";
import Link from "next/link";

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errMessage, setErrMessage] = useState<string | null>(
    error === "CredentialsSignin" ? "E-mail ou senha incorretos." : null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrMessage(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setErrMessage("E-mail ou senha incorretos.");
      setLoading(false);
    } else {
      // Pegar sessão para verificar o papel
      const session = await getSession();
      const role = session?.user?.role;

      if (callbackUrl && callbackUrl !== "/erp" && callbackUrl !== "/erp/artigos") {
        router.push(callbackUrl);
      } else if (role && ['admin', 'editor', 'reporter', 'juridico'].includes(role)) {
        router.push("/erp/artigos");
      } else {
        router.push("/");
      }
    }
  };

  return (
    <>
      <div className="mb-10">
        <h2 className="text-4xl font-black text-white mb-3 text-center lg:text-left">Acesse sua Conta<span className="text-red-700">.</span></h2>
        <p className="text-slate-400 font-medium text-center lg:text-left">Insira suas credenciais para continuar.</p>
      </div>

      {errMessage && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-8 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <UserCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-bold">{errMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 block">Endereço de E-mail</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-red-700 transition-colors" />
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-white pl-12 pr-4 py-4 rounded-xl outline-none focus:border-red-700/50 transition-all font-medium placeholder:text-slate-700" 
              placeholder="exemplo@revistagestao.pt"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 block">Chave de Acesso</label>
            <Link href="#" className="text-slate-600 hover:text-red-700 text-xs font-bold uppercase transition-colors">Esqueceu a senha?</Link>
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-red-700 transition-colors" />
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-white pl-12 pr-4 py-4 rounded-xl outline-none focus:border-red-700/50 transition-all font-medium placeholder:text-slate-700" 
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-red-700 hover:bg-red-600 disabled:bg-red-900/50 disabled:cursor-not-allowed text-white font-black uppercase tracking-[0.1em] py-5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-3 relative overflow-hidden group"
        >
          {loading ? (
            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              Entrar no Sistema
            </>
          )}
        </button>
      </form>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Coluna Esquerda: Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/40 to-slate-950 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1495020689067-958852a7765e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80" 
          className="absolute inset-0 w-full h-full object-cover opacity-30" 
          alt="News Desk"
        />
        <div className="relative z-20 p-20 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center gap-3 text-white mb-12">
              <div className="bg-red-700 w-12 h-12 rounded-xl flex items-center justify-center font-black text-2xl">RG</div>
              <span className="text-2xl font-black uppercase tracking-tighter">Revista<span className="text-red-700">.</span>Gestão</span>
            </div>
            <h1 className="text-5xl font-black text-white leading-tight mb-6 max-w-md">
              A inteligência por trás do poder político.
            </h1>
            <p className="text-slate-400 text-xl font-medium max-w-sm">
              Sistema Centralizado de Gestão e Publicação Editorial (RG.ERP)
            </p>
          </div>
          <div className="flex gap-8 text-slate-500 text-sm font-bold uppercase tracking-widest">
             <span>v1.0.0</span>
             <span>© 2026 REVISTA GESTÃO</span>
          </div>
        </div>
      </div>

      {/* Coluna Direita: Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 text-white mb-12">
            <div className="bg-red-700 w-10 h-10 rounded-lg flex items-center justify-center font-black text-xl">RG</div>
            <span className="text-xl font-black uppercase tracking-tighter">Revista<span className="text-red-700">.</span>Gestão</span>
          </div>

          <Suspense fallback={
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-red-700/30 border-t-red-700 rounded-full animate-spin" />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Carregando formulário...</p>
            </div>
          }>
            <LoginForm />
          </Suspense>

          <div className="mt-12 pt-8 border-t border-slate-900 text-center">
             <p className="text-slate-600 text-sm font-medium italic mb-2">
                Acesso exclusivo para assinantes e equipe Revista Gestão.
             </p>
             <Link href="/assine" className="text-red-700 text-xs font-black uppercase tracking-[0.1em] hover:underline">Ainda não é assinante? Clique aqui</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
