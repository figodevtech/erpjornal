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
  silent: true,
  org: "revista-gestao", // Placeholder - usuário deve ajustar se necessário
  project: "portal-noticias",
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
};

export default withSentryConfig(nextConfig, sentryBuildOptions);
