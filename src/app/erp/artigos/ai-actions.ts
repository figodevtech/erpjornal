"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function rephraseArticleContent(title: string, text: string, tone: string = "jornalístico") {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Sessão expirada. Por favor, faça login novamente.");

  // Seletor de modelos de ponta (priorizando 2.0 e versões futuras/exp)
  const models = [
    "gemini-2.0-flash",           // Estado da arte (Dec 2024+)
    "gemini-2.0-flash-exp",
    "gemini-1.5-flash-latest"      // Fallback estável
  ];

  let lastError = null;

  for (const modelName of models) {
    try {
      console.log(`🤖 Tentando IA com modelo: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const prompt = `
        Você é o assistente editorial de elite da Revista Gestão ERP. 
        Sua tarefa é REESTRUTURAR o texto abaixo para um nível premium de jornalismo.
        
        DIRETRIZES TÉCNICAS:
        - Tom solicitado: ${tone} (profissional, executivo, analítico).
        - Melhore o fluxo, coesão e impacto editorial.
        - Preserve INTEGRALMENTE as tags HTML (<h2>, <p>, <strong>, <ul>, <li>, <blockquote>).
        - Transforme parágrafos densos em blocos de fácil leitura.
        - Mantenha fatos, dados e rigor técnico.
        
        Título original: ${title}
        Conteúdo original:
        ${text}
        
        Sua resposta DEVE ser um JSON válido no formato:
        {
          "new_title": "...",
          "new_text": "...",
          "summary": "Explicação técnica da melhoria"
        }
      `;

      const result = await model.generateContent(prompt);
      const textResponse = result.response.text().trim();
      
      const jsonContent = textResponse.startsWith("```") 
        ? textResponse.replace(/^```json|```$/g, "").trim()
        : textResponse;

      const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("A IA respondeu em formato não-JSON.");

      return JSON.parse(jsonMatch[0]);
    } catch (error: any) {
      lastError = error;
      const msg = error.message || "";
      
      // Se for 404 (modelo não existe neste SDK/Key), tentamos o próximo modelo
      if (msg.includes("404") || msg.includes("not found")) {
        console.warn(`⚠️ Modelo ${modelName} não encontrado. Tentando próximo...`);
        continue;
      }

      // Se for quota (429), avisamos o usuário para aguardar
      if (msg.includes("429") || msg.includes("Quota exceeded")) {
        throw new Error("🚀 A Mágica de IA está concorrida! Aguarde 20 segundos para a próxima sessão de refinamento.");
      }

      console.error(`❌ Erro crítico no modelo ${modelName}:`, msg);
      throw error; 
    }
  }

  throw new Error(`Não foi possível conectar aos modelos de IA (${lastError?.message}). Tente o Gemini 1.5 estável.`);
}
