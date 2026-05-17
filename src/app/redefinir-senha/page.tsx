"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2, Mail } from "lucide-react";
import { criarClienteSupabaseBrowser } from "@/lib/supabase/browser";

type Mode = "request" | "update";

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const supabase = useMemo(() => criarClienteSupabaseBrowser(), []);
  const [mode, setMode] = useState<Mode>("request");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setMode("update");
    });

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setMode("update");
      }
    });

    return () => data.subscription.unsubscribe();
  }, [supabase]);

  async function handleRequestReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setMessage("Enviamos um link de redefinição para o e-mail informado.");
  }

  async function handleUpdatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (senha.length < 8) {
      setError("A senha precisa ter pelo menos 8 caracteres.");
      setLoading(false);
      return;
    }

    if (senha !== confirmacao) {
      setError("As senhas informadas não conferem.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: senha });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage("Senha atualizada. Redirecionando para o login...");
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950 p-6">
      <section className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-8 shadow-2xl">
        <div className="mb-8">
          <div className="mb-5 inline-flex rounded-xl bg-red-700 p-3 text-white">
            {mode === "update" ? <KeyRound className="h-6 w-6" /> : <Mail className="h-6 w-6" />}
          </div>
          <h1 className="text-3xl font-black text-white">Redefinir senha</h1>
          <p className="mt-2 text-sm font-medium text-gray-300">
            {mode === "update"
              ? "Informe a nova senha para finalizar a recuperação da conta."
              : "Informe seu e-mail para receber o link de redefinição."}
          </p>
        </div>

        {message && (
          <div className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-300">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">
            {error}
          </div>
        )}

        {mode === "update" ? (
          <form onSubmit={handleUpdatePassword} className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-gray-300">
                Nova senha
              </label>
              <input
                type="password"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                minLength={8}
                required
                className="w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-4 text-sm font-medium text-white outline-none transition focus:border-red-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-gray-300">
                Confirmar senha
              </label>
              <input
                type="password"
                value={confirmacao}
                onChange={(event) => setConfirmacao(event.target.value)}
                minLength={8}
                required
                className="w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-4 text-sm font-medium text-white outline-none transition focus:border-red-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-700 px-5 py-4 text-sm font-black uppercase tracking-[0.1em] text-white transition hover:bg-red-600 disabled:opacity-50"
            >
              {loading && <Loader2 className="h-5 w-5 animate-spin" />}
              Atualizar senha
            </button>
          </form>
        ) : (
          <form onSubmit={handleRequestReset} className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-gray-300">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-4 text-sm font-medium text-white outline-none transition focus:border-red-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-700 px-5 py-4 text-sm font-black uppercase tracking-[0.1em] text-white transition hover:bg-red-600 disabled:opacity-50"
            >
              {loading && <Loader2 className="h-5 w-5 animate-spin" />}
              Enviar link
            </button>
          </form>
        )}

        <Link href="/login" className="mt-6 block text-center text-xs font-black uppercase tracking-[0.1em] text-gray-300 transition hover:text-red-300">
          Voltar para o login
        </Link>
      </section>
    </main>
  );
}
