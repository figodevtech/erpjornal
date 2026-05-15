"use server";

import { randomUUID } from "node:crypto";

import { getAppConfigSnapshot, withAppQuota } from "@/lib/app-config";
import { exigirAlgumaPermissao } from "@/lib/auth";
import { criarClienteSupabaseAdmin } from "@/lib/supabase/admin";
import { extractPlainTextFromHtml } from "@/lib/tts-utils";

const ARTICLE_IMAGES_BUCKET = process.env.SUPABASE_ARTICLE_IMAGES_BUCKET || "article-images";
const OPENAI_IMAGE_GENERATIONS_URL = "https://api.openai.com/v1/images/generations";
const OPENAI_IMAGE_EDITS_URL = "https://api.openai.com/v1/images/edits";

type ImageActionInput = {
  title: string;
  resumo?: string;
  corpoTexto?: string;
  referenceImageUrl?: string | null;
};

type OpenAIImageResponse = {
  data?: Array<{
    b64_json?: string;
    url?: string;
  }>;
  error?: {
    message?: string;
  };
};

function getOpenAIApiKey() {
  const apiKey = process.env.GPT_API_KEY || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("Configure GPT_API_KEY ou OPENAI_API_KEY no ambiente do servidor.");
  }

  return apiKey;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80);
}

function extensionFromMimeType(mimeType: string) {
  if (mimeType.includes("png")) return "png";
  if (mimeType.includes("webp")) return "webp";
  return "jpg";
}

async function ensureArticleImagesBucket() {
  const supabase = criarClienteSupabaseAdmin();
  const { data: bucket } = await supabase.storage.getBucket(ARTICLE_IMAGES_BUCKET);

  if (!bucket) {
    const { error } = await supabase.storage.createBucket(ARTICLE_IMAGES_BUCKET, {
      public: true,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
      fileSizeLimit: 15 * 1024 * 1024,
    });

    if (error) {
      throw new Error(`Nao foi possivel criar o bucket de imagens: ${error.message}`);
    }
  }

  return supabase;
}

async function uploadArticleImage(bytes: Buffer, mimeType: string, title: string) {
  const supabase = await ensureArticleImagesBucket();
  const ext = extensionFromMimeType(mimeType);
  const baseName = slugify(title) || "materia";
  const path = `covers/${new Date().getFullYear()}/${baseName}-${randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(ARTICLE_IMAGES_BUCKET).upload(path, bytes, {
    contentType: mimeType,
    upsert: false,
  });

  if (error) {
    throw new Error(`Nao foi possivel enviar a imagem para o Supabase: ${error.message}`);
  }

  const { data } = supabase.storage.from(ARTICLE_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

function buildPrompt(input: ImageActionInput, mode: "create" | "recreate") {
  const bodyText = extractPlainTextFromHtml(input.corpoTexto || "").slice(0, 5000);

  return `Voce e uma IA especializada em criacao de imagens editoriais para um portal de noticias serio, profissional e confiavel.

Sua tarefa e ler cuidadosamente:
1. O titulo da materia;
2. O resumo/descricao;
3. O corpo completo do artigo.

A partir disso, crie uma imagem de capa jornalistica que represente visualmente o tema central da noticia, sem exageros, sem sensacionalismo e sem elementos caricatos.

A imagem deve ter estilo editorial premium, realista, sobrio e institucional, semelhante a capas de grandes portais de economia, politica e negocios.

Antes de criar a imagem, identifique internamente:
- O assunto principal da materia;
- O conflito ou problema central;
- Os personagens, instituicoes ou setores envolvidos;
- O tom da noticia: crise, analise, explicacao, alerta, investigacao, economia, politica publica ou impacto social.

${mode === "recreate" ? "Use a imagem de referencia apenas como insumo visual. Recrie a capa com composicao original, mais limpa, mais profissional e com melhor qualidade editorial, mantendo o tema central quando fizer sentido." : ""}

Regras visuais:
- Nao criar uma montagem poluida com muitos elementos.
- Nao usar setas gigantes, graficos exagerados ou simbolos infantis.
- Nao colocar textos grandes dentro da imagem.
- Nao inventar logotipos falsos.
- Nao distorcer bandeiras, predios publicos, documentos ou simbolos institucionais.
- Nao criar aparencia de propaganda politica.
- Nao criar imagem com tom de meme, YouTube clickbait ou sensacionalismo.
- Evitar rostos de politicos, a menos que a materia seja diretamente centrada na pessoa.
- Usar composicao limpa, equilibrada e com aparencia de fotografia jornalistica ou ilustracao editorial realista.

Estilo desejado:
- Realismo fotografico ou ilustracao editorial realista.
- Iluminacao natural ou dramatica suave.
- Cores sobrias: azul escuro, cinza, branco, tons institucionais e economicos.
- Profundidade de campo profissional.
- Aparencia de capa de jornal digital serio.
- Clima analitico, investigativo e economico.
- Visual com credibilidade, seriedade e clareza.

Composicao:
- Criar uma cena principal forte e objetiva.
- Usar no maximo 3 elementos visuais principais.
- Deixar espaco livre em uma das laterais para possivel insercao de titulo pelo portal.
- Priorizar simbolo visual ao inves de excesso de informacao.

Formato:
- Proporcao 16:9.
- Alta resolucao.
- Sem texto renderizado na imagem, a menos que seja parte natural da cena, como placa, fachada ou documento.
- Sem marcas d'agua.
- Sem aparencia de banco de imagem generico demais.

Agora gere uma imagem de capa com base na materia abaixo:

TITULO:
${input.title}

RESUMO:
${input.resumo || "Sem resumo informado."}

CORPO DA MATERIA:
${bodyText || "Sem corpo informado. Use o titulo e o resumo como base principal."}`;
}

async function parseOpenAIImageResponse(response: Response) {
  const body = (await response.json()) as OpenAIImageResponse;

  if (!response.ok) {
    throw new Error(body.error?.message || "Erro ao gerar imagem com IA.");
  }

  const image = body.data?.[0];
  if (!image?.b64_json) {
    throw new Error("A IA nao retornou uma imagem em base64.");
  }

  return Buffer.from(image.b64_json, "base64");
}

export async function uploadArticleCoverImage(formData: FormData) {
  await exigirAlgumaPermissao(["artigos:criar", "artigos:editar", "artigos:publicar", "curadoria:aprovar"]);

  const file = formData.get("file");
  const title = ((formData.get("title") as string) || "materia").trim();

  if (!(file instanceof File)) {
    throw new Error("Selecione um arquivo de imagem.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("O arquivo selecionado precisa ser uma imagem.");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  return {
    url: await uploadArticleImage(bytes, file.type, title),
  };
}

export async function generateArticleCoverImage(input: ImageActionInput) {
  await exigirAlgumaPermissao(["artigos:criar", "artigos:editar", "artigos:publicar", "curadoria:aprovar"]);

  if (!input.title?.trim()) {
    throw new Error("Informe o titulo da materia antes de gerar a capa.");
  }

  const config = await getAppConfigSnapshot();

  return withAppQuota("imageGeneration", async () => {
    const response = await fetch(OPENAI_IMAGE_GENERATIONS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getOpenAIApiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.imageGenerationModel,
        prompt: buildPrompt(input, "create"),
        size: config.imageGenerationSize,
        quality: config.imageGenerationQuality,
      }),
    });

    const imageBytes = await parseOpenAIImageResponse(response);
    return {
      url: await uploadArticleImage(imageBytes, "image/png", input.title),
    };
  });
}

export async function recreateArticleCoverImage(input: ImageActionInput) {
  await exigirAlgumaPermissao(["artigos:criar", "artigos:editar", "artigos:publicar", "curadoria:aprovar"]);

  if (!input.title?.trim()) {
    throw new Error("Informe o titulo da materia antes de recriar a capa.");
  }

  if (!input.referenceImageUrl) {
    throw new Error("Nao ha imagem original do RSS para recriar.");
  }

  const sourceResponse = await fetch(input.referenceImageUrl, {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; RevistaGestaoBot/1.0)",
      accept: "image/avif,image/webp,image/png,image/jpeg,image/*,*/*",
    },
    cache: "no-store",
  });

  if (!sourceResponse.ok) {
    throw new Error("Nao foi possivel baixar a imagem original do RSS.");
  }

  const mimeType = sourceResponse.headers.get("content-type") || "image/jpeg";
  const sourceBytes = await sourceResponse.arrayBuffer();
  const config = await getAppConfigSnapshot();
  const formData = new FormData();
  formData.append("model", config.imageGenerationModel);
  formData.append("prompt", buildPrompt(input, "recreate"));
  formData.append("size", config.imageGenerationSize);
  formData.append("quality", config.imageGenerationQuality);
  formData.append("image", new Blob([sourceBytes], { type: mimeType }), `reference.${extensionFromMimeType(mimeType)}`);

  return withAppQuota("imageGeneration", async () => {
    const response = await fetch(OPENAI_IMAGE_EDITS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getOpenAIApiKey()}`,
      },
      body: formData,
    });

    const imageBytes = await parseOpenAIImageResponse(response);
    return {
      url: await uploadArticleImage(imageBytes, "image/png", input.title),
    };
  });
}
