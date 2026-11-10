import { withSentryConfig } from "@sentry/nextjs/config";
import type { NextConfig } from "next";

// Host do Supabase Storage do projeto atual (imagens enviadas pelo ERP).
const supabaseHostname = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
      : null;
  } catch {
    return null;
  }
})();

/**
 * Cabeçalhos de segurança em todas as respostas.
 * - frame-ancestors / X-Frame-Options: nenhum outro site carrega o portal ou o ERP
 *   num iframe (clickjacking no botão Publicar, por exemplo).
 * - Sem CSP de scripts por enquanto: Next, Sentry e Vercel Analytics usam scripts
 *   inline; uma política de script-src precisa de nonce e testes próprios.
 */
const CABECALHOS_SEGURANCA = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // A Vercel recusa corpos acima de 4,5 MB (erro 413) antes de chegar ao Next.
      // O mesmo limite aqui faz o desenvolvimento local falhar igual à produção;
      // as imagens são reduzidas no navegador antes do envio (src/lib/imagens/reduzir.ts).
      bodySizeLimit: "4mb",
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: CABECALHOS_SEGURANCA }];
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.glbimg.com',
      },
      {
        protocol: 'https',
        hostname: 's2-g1.glbimg.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'imagens.ebc.com.br',
      },
      {
        protocol: 'https',
        hostname: 'agenciabrasil.ebc.com.br',
      },
      {
        protocol: 'https',
        hostname: 'admin.cnnbrasil.com.br',
      },
      ...(supabaseHostname
        ? [{ protocol: 'https' as const, hostname: supabaseHostname }]
        : []),
    ],
  },
};

// Configurações do Sentry para upload de sourcemaps no build.
// Sem SENTRY_AUTH_TOKEN/ORG/PROJECT o upload é simplesmente pulado.
const sentryBuildOptions: Parameters<typeof withSentryConfig>[1] = {
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Envia também os sourcemaps de dependências do cliente
  widenClientFileUpload: true,

  // Rota de túnel para eventos do Sentry não serem barrados por bloqueadores de anúncio
  tunnelRoute: "/monitoring",

  // Suprime logs de progresso no build
  silent: true,

  // Os sourcemaps gerados são apagados após o upload (padrão do v11:
  // sourcemaps.deleteSourcemapsAfterUpload = true), então não ficam públicos.
};

export default withSentryConfig(nextConfig, sentryBuildOptions);
