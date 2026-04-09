"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Loader2, X } from "lucide-react";

type ConfirmationDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
  pending?: boolean;
  children?: React.ReactNode;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
};

export default function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "default",
  pending = false,
  children,
  onConfirm,
  onClose,
}: ConfirmationDialogProps) {
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !pending) onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open, pending]);

  if (!mounted || !open) return null;

  const isBusy = pending || submitting;

  const confirmClassName =
    tone === "danger"
      ? "bg-rose-600 text-white hover:bg-rose-500"
      : "bg-gray-950 text-white hover:bg-black";

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
      <div className="w-full max-w-md overflow-hidden rounded-[32px] border border-gray-100 bg-white shadow-2xl">
        <div className="relative bg-slate-900 p-6 text-white">
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            className="absolute right-4 top-4 rounded-full p-2 text-white/50 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-white/10 p-3 text-white">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="pr-8">
              <h2 className="text-lg font-black tracking-tight">{title}</h2>
              <p className="mt-1 text-sm text-slate-300">{description}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 p-6 sm:flex-row sm:justify-end">
          {children && <div className="w-full sm:mr-auto sm:max-w-[240px]">{children}</div>}
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={async () => {
              try {
                setSubmitting(true);
                await onConfirm();
              } finally {
                setSubmitting(false);
              }
            }}
            disabled={isBusy}
            className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${confirmClassName}`}
          >
            {isBusy && <Loader2 className="h-4 w-4 animate-spin" />}
            {isBusy ? "Processando..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
