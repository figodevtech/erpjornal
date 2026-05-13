import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// Cópia de assets fora da sandbox
const projectDir = process.cwd();
try {
  const logoSrc = path.join(projectDir, "LOGO PADÃO BRANCA E VERMELHA.png");
  const logoDest = path.join(projectDir, "public/logo.png");
  if (fs.existsSync(logoSrc)) {
    fs.copyFileSync(logoSrc, logoDest);
    console.log("[Setup] Logo copiada com sucesso para public/logo.png");
  } else {
    console.log("[Setup] Logo original não encontrada, pulando cópia.");
  }

  const iconSrc = path.join(projectDir, "RG ICON.png");
  const pyScript = path.join(projectDir, "scripts/add_background.py");
  if (fs.existsSync(pyScript) && fs.existsSync(iconSrc)) {
    execSync(`python3 "${pyScript}"`, { cwd: projectDir });
    console.log("[Setup] Script Python do Favicon executado com sucesso!");
  } else {
    console.log("[Setup] Assets do favicon ou script não encontrados, pulando processamento.");
  }
} catch (e) {
  console.error("[Setup] Erro ao executar cópia de assets:", e);
}


const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
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
