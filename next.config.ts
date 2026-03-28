import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

// Configurações do Sentry para automatizar sourcemaps e report de build
const sentryBuildOptions = {
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: "revista-gestao", 
  project: "portal-noticias",
  
  // Otimiza o upload de sourcemaps para o cliente
  widenClientFileUpload: true,
  
  // Cria uma rota de túnel para evitar bloqueadores de anúncios
  tunnelRoute: "/monitoring",
  
  // Suprime logs de progresso de build no dev
  silent: true,
  
  // Esconde sourcemaps originais no código final servido
  hideSourceMaps: true,
  disableLogger: true,
};

export default withSentryConfig(nextConfig, sentryBuildOptions);
