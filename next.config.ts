import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
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
      }
    ],
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
};

export default withSentryConfig(nextConfig, sentryBuildOptions);
