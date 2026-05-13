"use server";

import { exigirAlgumaPermissao } from "@/lib/auth";

type RephrasedArticle = {
  new_title: string;
  new_text: string;
  summary: string;
};

type OpenAIResponseContent = {
  type?: string;
  text?: string;
};

type OpenAIResponseOutput = {
  type?: string;
  content?: OpenAIResponseContent[];
};

type OpenAIResponseBody = {
  output_text?: string;
  output?: OpenAIResponseOutput[];
  error?: {
    message?: string;
    type?: string;
    code?: string;
  };
};

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-5.4-mini";

const articleRewriteSchema = {
  type: "object",
  additionalProperties: false,
  required: ["new_title", "new_text", "summary"],
  properties: {
    new_title: {
      type: "string",
      description: "Titulo reescrito em portugues do Brasil.",
    },
    new_text: {
      type: "string",
      description: "Corpo do artigo reescrito, preservando a estrutura HTML permitida.",
    },
    summary: {
      type: "string",
      description: "Resumo tecnico curto explicando as melhorias editoriais realizadas.",
    },
  },
} as const;

function getOpenAIApiKey() {
  const apiKey = process.env.GPT_API_KEY || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("Configure GPT_API_KEY ou OPENAI_API_KEY no ambiente do servidor.");
  }

  return apiKey;
}

function extractOpenAIText(body: OpenAIResponseBody) {
  if (typeof body.output_text === "string" && body.output_text.trim()) {
    return body.output_text.trim();
  }

  const contentText = body.output
    ?.flatMap((item) => item.content || [])
    .map((content) => content.text)
    .find((text) => typeof text === "string" && text.trim());

  if (!contentText) {
    throw new Error("A IA nao retornou conteudo de texto.");
  }

  return contentText.trim();
}

function parseRephrasedArticle(value: string): RephrasedArticle {
  const parsed = JSON.parse(value) as Partial<RephrasedArticle>;

  if (
    typeof parsed.new_title !== "string" ||
    typeof parsed.new_text !== "string" ||
    typeof parsed.summary !== "string"
  ) {
    throw new Error("A IA respondeu em um formato inesperado.");
  }

  return {
    new_title: parsed.new_title,
    new_text: parsed.new_text,
    summary: parsed.summary,
  };
}

function mapOpenAIError(status: number, message?: string) {
  if (status === 401 || status === 403) {
    return new Error("A chave da OpenAI foi recusada. Verifique GPT_API_KEY no servidor.");
  }

  if (status === 429) {
    return new Error("A fila da IA esta ocupada ou sem cota. Aguarde alguns segundos e tente novamente.");
  }

  if (status >= 500) {
    return new Error("A OpenAI esta indisponivel no momento. Tente novamente em instantes.");
  }

  return new Error(message || "Erro ao comunicar com a OpenAI.");
}

export async function rephraseArticleContent(
  title: string,
  text: string,
  tone: string = "jornalistico"
): Promise<RephrasedArticle> {
  await exigirAlgumaPermissao(["artigos:editar", "artigos:publicar"]);

  const apiKey = getOpenAIApiKey();
  const model = process.env.GPT_MODEL || DEFAULT_MODEL;

  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content:
            "Voce e o assistente editorial da Revista Gestao ERP. Responda sempre em JSON valido, em portugues do Brasil, seguindo exatamente o schema solicitado.",
        },
        {
          role: "user",
          content: [
            "Reestruture o texto abaixo para um nivel premium de jornalismo.",
            "",
            "Diretrizes:",
            `- Tom solicitado: ${tone}.`,
            "- Preserve integralmente as tags HTML existentes e use apenas estrutura HTML editorial basica quando necessario: <h2>, <p>, <strong>, <ul>, <li>, <blockquote>.",
            "- Melhore fluxo, coesao e impacto editorial.",
            "- Mantenha fatos, dados, nomes, numeros e rigor tecnico.",
            "- Nao invente informacoes, fontes ou citacoes.",
            "",
            `Titulo original: ${title}`,
            "Conteudo original:",
            text,
          ].join("\n"),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "article_rewrite",
          strict: true,
          schema: articleRewriteSchema,
        },
      },
    }),
  });

  const body = (await response.json()) as OpenAIResponseBody;

  if (!response.ok) {
    throw mapOpenAIError(response.status, body.error?.message);
  }

  return parseRephrasedArticle(extractOpenAIText(body));
}
