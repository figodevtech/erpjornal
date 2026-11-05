import type { ReactNode } from "react";
import { MailCheck } from "lucide-react";

/** Cartão das páginas de confirmação e descadastro da newsletter. */
export default function CartaoNewsletter({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="flex w-full justify-center px-4 py-16 sm:py-24">
      <section className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-700 text-white">
            <MailCheck className="h-5 w-5" aria-hidden />
          </span>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">{titulo}</h1>
        </div>
        <div className="space-y-4 text-gray-700 dark:text-gray-300">{children}</div>
      </section>
    </div>
  );
}

export const classeBotaoNewsletter =
  "inline-flex w-full items-center justify-center rounded-xl bg-red-700 px-6 py-3 font-black uppercase tracking-widest text-white transition-colors hover:bg-red-800";
