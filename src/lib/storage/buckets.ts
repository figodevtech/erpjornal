/**
 * Buckets do Supabase Storage usados pelo projeto.
 *
 * Fonte única das configurações: o app usa os nomes para upload e o
 * `npm run db:setup` (scripts/db-setup.ts) cria/atualiza os buckets com
 * estas opções. Não importe "server-only" aqui: o script roda fora do Next.
 */

const MB = 1024 * 1024;

const IMAGENS_RASTER = ["image/jpeg", "image/png", "image/webp"];

export type StorageBucketConfig = {
  name: string;
  public: boolean;
  allowedMimeTypes: string[];
  fileSizeLimit: number;
};

export const STORAGE_BUCKETS = {
  articleImages: {
    name: process.env.SUPABASE_ARTICLE_IMAGES_BUCKET || "article-images",
    public: true,
    allowedMimeTypes: IMAGENS_RASTER,
    fileSizeLimit: 15 * MB,
  },
  revistaCovers: {
    name: process.env.SUPABASE_REVISTA_COVERS_BUCKET || "revista-covers",
    public: true,
    allowedMimeTypes: IMAGENS_RASTER,
    fileSizeLimit: 20 * MB,
  },
  mediaKitAssets: {
    name: "media-kit-assets",
    public: true,
    // SVG fica de fora de propósito: pode conter script.
    allowedMimeTypes: [...IMAGENS_RASTER, "image/gif", "image/avif"],
    fileSizeLimit: 10 * MB,
  },
} as const satisfies Record<string, StorageBucketConfig>;

/** Mensagem padrão quando o bucket ainda não foi criado no projeto Supabase. */
export function mensagemErroUpload(bucket: StorageBucketConfig, detalhe: string) {
  if (/bucket not found/i.test(detalhe)) {
    return `O bucket "${bucket.name}" não existe no Supabase. Rode "npm run db:setup".`;
  }
  return `Não foi possível enviar o arquivo: ${detalhe}`;
}

/** Valida tipo e tamanho do arquivo antes de enviar ao Storage. */
export function validarArquivoParaBucket(
  bucket: StorageBucketConfig,
  file: { type: string; size: number }
): string | null {
  if (!bucket.allowedMimeTypes.includes(file.type)) {
    return `Tipo de arquivo não permitido (${file.type || "desconhecido"}). Use: ${bucket.allowedMimeTypes
      .map((tipo) => tipo.replace("image/", ""))
      .join(", ")}.`;
  }
  if (file.size > bucket.fileSizeLimit) {
    return `Arquivo muito grande. Limite: ${Math.round(bucket.fileSizeLimit / MB)} MB.`;
  }
  return null;
}
