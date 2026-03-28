"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    // Reporta erros no layout raiz ou falhas críticas de renderização para o Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body className="antialiased">
        {/* Renderiza a página de erro padrão do Next.js */}
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
