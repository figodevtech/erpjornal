"use client";

import { formatarData } from "@/lib/datas";
import Link from "next/link";
import { useState } from "react";
import { KeyRound, ShieldCheck, Smartphone } from "lucide-react";

import SignOutButton from "@/components/auth/SignOutButton";
import type { EstadoMfa } from "@/lib/mfa";
import { traduzirErroMfa } from "@/lib/supabase/auth-error";
import { criarClienteSupabaseBrowser } from "@/lib/supabase/browser";

type Fator = { id: string; nome: string; criadoEm: string };

type Props = {
  email: string | null;
  estado: EstadoMfa;
  destino: string;
  fatoresVerificados: Fator[];
  /** Cadastros iniciados e não confirmados: são descartados antes de um novo. */
  fatoresNaoConfirmados: string[];
};

type Cadastro = { fatorId: string; qrCode: string; segredo: string };

const CODIGO = /^\d{6}$/;

function CampoCodigo({ valor, aoMudar }: { valor: string; aoMudar: (valor: string) => void }) {
  return (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="one-time-code"
      pattern="\d{6}"
      maxLength={6}
      required
      autoFocus
      value={valor}
      onChange={(e) => aoMudar(e.target.value.replace(/\D/g, "").slice(0, 6))}
      aria-label="Código de 6 dígitos"
      className="w-full rounded-xl border border-gray-700 bg-gray-900 py-4 text-center font-mono text-3xl tracking-[0.5em] text-white outline-none transition-all placeholder:text-gray-600 focus:border-red-500"
      placeholder="000000"
    />
  );
}

export default function GerenciadorMfa({ email, estado, destino, fatoresVerificados, fatoresNaoConfirmados }: Props) {
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [cadastro, setCadastro] = useState<Cadastro | null>(null);
  const [fatorEscolhido, setFatorEscolhido] = useState(fatoresVerificados[0]?.id ?? "");

  const modo = fatoresVerificados.length === 0 ? "cadastrar" : estado.pendente ? "confirmar" : "ativo";

  async function confirmar(fatorId: string) {
    if (!CODIGO.test(codigo)) {
      setErro("Digite os 6 números que aparecem no aplicativo.");
      return;
    }
    setCarregando(true);
    setErro(null);
    try {
      const supabase = criarClienteSupabaseBrowser();
      const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: fatorId, code: codigo });
      if (error) {
        setErro(traduzirErroMfa(error));
        setCodigo("");
        return;
      }
      // Recarga completa: o servidor passa a ler a sessão já no nível aal2.
      window.location.assign(destino);
    } catch {
      setErro("Sem conexão com o servidor. Tente de novo.");
    } finally {
      setCarregando(false);
    }
  }

  async function iniciarCadastro() {
    setCarregando(true);
    setErro(null);
    try {
      const supabase = criarClienteSupabaseBrowser();
      for (const fatorId of fatoresNaoConfirmados) {
        await supabase.auth.mfa.unenroll({ factorId: fatorId });
      }
      const agora = new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        issuer: "Revista Gestão",
        friendlyName: `Revista Gestão (${agora})`,
      });
      if (error || !data) {
        setErro(traduzirErroMfa(error));
        return;
      }
      setCadastro({ fatorId: data.id, qrCode: data.totp.qr_code, segredo: data.totp.secret });
    } catch {
      setErro("Sem conexão com o servidor. Tente de novo.");
    } finally {
      setCarregando(false);
    }
  }

  const titulo =
    modo === "confirmar"
      ? "Confirme que é você"
      : modo === "ativo"
        ? "Dois fatores ativos"
        : "Proteja sua conta";

  return (
    <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-950 p-8 text-white shadow-2xl">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-700">
          {modo === "ativo" ? <ShieldCheck className="h-6 w-6" /> : <KeyRound className="h-6 w-6" />}
        </div>
        <div>
          <h1 className="text-2xl font-black">{titulo}</h1>
          {email && <p className="text-sm text-gray-400">{email}</p>}
        </div>
      </div>

      {erro && (
        <div role="alert" className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-bold text-red-400">
          {erro}
        </div>
      )}

      {modo === "confirmar" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void confirmar(fatorEscolhido);
          }}
          className="space-y-5"
        >
          <p className="text-sm text-gray-300">
            Abra o aplicativo autenticador (Google Authenticator, Microsoft Authenticator, 1Password…) e digite o código
            de 6 dígitos da Revista Gestão.
          </p>
          {fatoresVerificados.length > 1 && (
            <select
              value={fatorEscolhido}
              onChange={(e) => setFatorEscolhido(e.target.value)}
              className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-white"
              aria-label="Autenticador"
            >
              {fatoresVerificados.map((fator) => (
                <option key={fator.id} value={fator.id}>
                  {fator.nome}
                </option>
              ))}
            </select>
          )}
          <CampoCodigo valor={codigo} aoMudar={setCodigo} />
          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-xl bg-red-700 py-4 font-black uppercase tracking-widest transition-all hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-red-900/50"
          >
            {carregando ? "Confirmando…" : "Confirmar"}
          </button>
          <p className="text-xs text-gray-500">
            Perdeu o celular? Peça a um administrador para redefinir a sua autenticação em dois fatores.
          </p>
        </form>
      )}

      {modo === "cadastrar" && !cadastro && (
        <div className="space-y-5">
          <p className="text-sm text-gray-300">
            {estado.exigido
              ? "Para usar o ERP, sua conta precisa de um segundo fator além da senha: um código que muda a cada 30 segundos no seu celular."
              : "Adicione um segundo fator além da senha: um código que muda a cada 30 segundos no seu celular."}
          </p>
          <ol className="list-decimal space-y-1 pl-5 text-sm text-gray-400">
            <li>Instale um aplicativo autenticador no celular.</li>
            <li>Leia o QR code que vai aparecer.</li>
            <li>Digite o código mostrado pelo aplicativo.</li>
          </ol>
          <button
            type="button"
            onClick={() => void iniciarCadastro()}
            disabled={carregando}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-700 py-4 font-black uppercase tracking-widest transition-all hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-red-900/50"
          >
            <Smartphone className="h-5 w-5" />
            {carregando ? "Gerando QR code…" : "Configurar autenticador"}
          </button>
        </div>
      )}

      {modo === "cadastrar" && cadastro && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void confirmar(cadastro.fatorId);
          }}
          className="space-y-5"
        >
          <p className="text-sm text-gray-300">Leia o QR code com o aplicativo autenticador:</p>
          <div className="mx-auto w-fit rounded-xl bg-white p-3">
            {/* SVG gerado pelo Supabase (data URL); next/image não otimiza data URLs. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cadastro.qrCode} alt="QR code para o aplicativo autenticador" width={200} height={200} />
          </div>
          <details className="text-xs text-gray-400">
            <summary className="cursor-pointer">Não consegue ler? Digite a chave manualmente</summary>
            <code className="mt-2 block break-all rounded-lg bg-gray-900 p-3 font-mono text-sm text-gray-200">
              {cadastro.segredo}
            </code>
          </details>
          <p className="text-sm text-gray-300">Depois, digite o código que aparece no aplicativo:</p>
          <CampoCodigo valor={codigo} aoMudar={setCodigo} />
          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-xl bg-red-700 py-4 font-black uppercase tracking-widest transition-all hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-red-900/50"
          >
            {carregando ? "Confirmando…" : "Ativar"}
          </button>
        </form>
      )}

      {modo === "ativo" && (
        <div className="space-y-5">
          <p className="text-sm text-gray-300">Sua conta pede o código do aplicativo a cada novo login.</p>
          <ul className="space-y-2">
            {fatoresVerificados.map((fator) => (
              <li key={fator.id} className="rounded-xl border border-gray-800 bg-gray-900 px-4 py-3 text-sm">
                <div className="font-bold">{fator.nome}</div>
                <div className="text-xs text-gray-500">
                  Cadastrado em {formatarData(new Date(fator.criadoEm))}
                </div>
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-500">
            Para trocar de celular, peça a um administrador para redefinir a sua autenticação em dois fatores.
          </p>
          <Link
            href={destino}
            className="block w-full rounded-xl bg-red-700 py-4 text-center font-black uppercase tracking-widest transition-all hover:bg-red-600"
          >
            Continuar
          </Link>
        </div>
      )}

      <div className="mt-8 border-t border-gray-800 pt-4 text-center">
        <SignOutButton className="text-xs font-bold uppercase tracking-widest text-gray-400 transition-colors hover:text-red-400">
          Sair e entrar com outra conta
        </SignOutButton>
      </div>
    </div>
  );
}
