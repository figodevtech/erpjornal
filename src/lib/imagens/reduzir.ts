/**
 * Reduz imagens no navegador antes do upload.
 *
 * A Vercel recusa requisições acima de 4,5 MB (erro 413) antes de o Next ver o
 * arquivo, e uma foto de celular ou câmera passa fácil disso. Além do limite,
 * as imagens são servidas sem otimização (next.config: images.unoptimized):
 * uma capa de 12 MB pesaria do mesmo jeito para o leitor.
 *
 * Só para client components (usa canvas). GIF e AVIF passam como estão (o
 * canvas perderia a animação); se forem grandes demais, o erro diz isso.
 */

const MB = 1024 * 1024;

/** Teto do arquivo enviado: abaixo dos 4,5 MB da Vercel, com folga para o resto do formulário. */
export const LIMITE_UPLOAD_BYTES = 3.5 * MB;

/** Lado maior máximo: suficiente para capa em tela retina. */
const LADO_MAXIMO_PX = 2560;

const TIPOS_REDUZIVEIS = new Set(["image/jpeg", "image/png", "image/webp"]);

export class ImagemGrandeDemaisError extends Error {
  constructor(tamanho: number) {
    super(
      `A imagem tem ${(tamanho / MB).toFixed(1)} MB e o limite de envio é ${(LIMITE_UPLOAD_BYTES / MB).toFixed(1)} MB. ` +
        "Reduza a imagem antes de enviar."
    );
    this.name = "ImagemGrandeDemaisError";
  }
}

function paraBlob(canvas: HTMLCanvasElement, tipo: string, qualidade: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, tipo, qualidade));
}

/**
 * Devolve o arquivo pronto para upload: o original se já for pequeno e de
 * dimensões razoáveis, ou uma versão WebP reduzida. Lança ImagemGrandeDemaisError
 * se não der para ficar abaixo do limite.
 */
export async function reduzirImagemParaUpload(arquivo: File): Promise<File> {
  if (!TIPOS_REDUZIVEIS.has(arquivo.type)) {
    if (arquivo.size > LIMITE_UPLOAD_BYTES) throw new ImagemGrandeDemaisError(arquivo.size);
    return arquivo;
  }

  const imagem = await createImageBitmap(arquivo);
  try {
    const maiorLado = Math.max(imagem.width, imagem.height);
    if (arquivo.size <= LIMITE_UPLOAD_BYTES && maiorLado <= LADO_MAXIMO_PX) return arquivo;

    // Tenta tamanhos e qualidades decrescentes até caber no limite.
    for (const [lado, qualidade] of [
      [LADO_MAXIMO_PX, 0.85],
      [LADO_MAXIMO_PX, 0.72],
      [1920, 0.72],
      [1280, 0.7],
    ] as const) {
      const escala = Math.min(1, lado / maiorLado);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(imagem.width * escala);
      canvas.height = Math.round(imagem.height * escala);
      canvas.getContext("2d")?.drawImage(imagem, 0, 0, canvas.width, canvas.height);

      const blob = await paraBlob(canvas, "image/webp", qualidade);
      // Navegador sem WebP no canvas devolve PNG: aí não compensa, tenta o próximo passo.
      if (blob && blob.type === "image/webp" && blob.size <= LIMITE_UPLOAD_BYTES) {
        const nome = arquivo.name.replace(/\.[^.]+$/, "") || "imagem";
        return new File([blob], `${nome}.webp`, { type: "image/webp", lastModified: Date.now() });
      }
    }
  } finally {
    imagem.close();
  }

  if (arquivo.size <= LIMITE_UPLOAD_BYTES) return arquivo;
  throw new ImagemGrandeDemaisError(arquivo.size);
}
