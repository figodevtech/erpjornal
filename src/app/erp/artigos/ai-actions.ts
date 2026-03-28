"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function rephraseArticleContent(title: string, text: string, tone: string = "jornalístico") {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Não autorizado");

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
    Você é o assistente editorial da Revista Gestão ERP.
    Sua tarefa é REESTRUTURAR o texto abaixo para torná-lo mais fluido, jornalístico e profissional.
    
    DIRETRIZES:
    - Melhore a clareza e concisão.
    - Mantenha a coerência técnica para o público de ERP e Gestão.
    - Transforme parágrafos longos em blocos menores e mais legíveis.
    - Mantenha todo o conteúdo original (fatos, nomes, datas), apenas melhore a redação editorial.
    - Preserve exatamente as tags HTML (<h2>, <p>, <strong>, etc) do conteúdo original.
    - Tom solicitado: ${tone}
    
    Título original: ${title}
    Conteúdo original para reestruturar:
    ${text}
    
    Responda em formato JSON puro:
    {
      "new_title": "Título refinado aqui",
      "new_text": "Corpo do texto com HTML preservado aqui",
      "summary": "Breve explicação do que foi melhorado"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const textResponse = result.response.text().trim();
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("A IA não retornou um formato válido.");

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("AI Rephrase Error:", error);
    throw new Error("Erro ao processar com IA: " + (error instanceof Error ? error.message : "Desconhecido"));
  }
}
