"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";

export default function SentryExamplePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const triggerClientError = () => {
    // Forçando um erro no cliente
    throw new Error("Sentry Test Client Error — " + new Date().toISOString());
  };

  const triggerCapturedError = () => {
    // Capturando manualmente um erro (captura silenciosa)
    try {
      // simulate function call to non-existent function
      // @ts-ignore
      myUndefinedFunction();
    } catch (e) {
      Sentry.captureException(e);
      alert("Erro capturado e enviado ao Sentry!");
    }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100 animate-in fade-in slide-in-from-bottom-5 duration-500">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-red-100 p-2 rounded-lg">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Sentry Verification</h1>
        </div>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          Clique nos botões abaixo para disparar erros de teste e validar se a sua configuração da <strong>Fase 4</strong> está ativa no dashboard.
        </p>

        <div className="space-y-4">
          <button
            onClick={triggerClientError}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-red-200"
          >
            Disparar Erro de Interface (Runtime)
          </button>

          <button
            onClick={triggerCapturedError}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-indigo-200"
          >
            Capturar Erro Controlado
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">
            Verifique o painel em sentry.io/issues
          </p>
        </div>
      </div>
    </main>
  );
}
