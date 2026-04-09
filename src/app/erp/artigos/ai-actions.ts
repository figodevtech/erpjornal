"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

import { exigirAlgumaPermissao } from "@/lib/auth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function rephraseArticleContent(
  title: string,
  text: string,
  tone: string = "jornalistico"
) {
  await exigirAlgumaPermissao(["artigos:editar", "artigos:publicar"]);

  const models = ["gemini-2.0-flash", "gemini-2.0-flash-exp", "gemini-1.5-flash-latest"];

  let lastError: Error | null = null;

  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = `
        Voce e o assistente editorial da Revista Gestao ERP.
        Sua tarefa e reestruturar o texto abaixo para um nivel premium de jornalismo.

        Diretrizes:
        - Tom solicitado: ${tone}.
        - Preserve integralmente as tags HTML (<h2>, <p>, <strong>, <ul>, <li>, <blockquote>).
        - Melhore fluxo, coesao e impacto editorial.
        - Mantenha fatos, dados e rigor tecnico.

        Titulo original: ${title}
        Conteudo original:
        ${text}

        Sua resposta deve ser um JSON valido no formato:
        {
          "new_title": "...",
          "new_text": "...",
          "summary": "Explicacao tecnica da melhoria"
        }
      `;

      const result = await model.generateContent(prompt);
      const textResponse = result.response.text().trim();
      const jsonContent = textResponse.startsWith("```")
        ? textResponse.replace(/^```json|```$/g, "").trim()
        : textResponse;

      const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("A IA respondeu em formato nao JSON.");

      return JSON.parse(jsonMatch[0]);
    } catch (error: any) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const msg = lastError.message || "";

      if (msg.includes("404") || msg.includes("not found")) {
        continue;
      }

      if (msg.includes("429") || msg.includes("Quota exceeded")) {
        throw new Error("A fila da IA esta ocupada. Aguarde alguns segundos e tente novamente.");
      }

      throw lastError;
    }
  }

  throw new Error(
    `Nao foi possivel conectar aos modelos de IA (${lastError?.message || "erro desconhecido"}).`
  );
}
