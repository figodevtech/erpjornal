import { extractPlainTextFromHtml, splitTextIntoChunks } from '../tts-utils';

/**
 * Teste unitário manual para verificação do extrator de texto TTS.
 * Pode ser executado via: npx tsx src/lib/__tests__/tts-utils.test.ts
 */
async function testTtsUtils() {
  console.log('🧪 Iniciando teste unitário de TtsUtils...');

  // Teste 1: Limpeza do HTML (extrair plain text)
  const sampleHtml = `
    <h1>Título da Matéria</h1>
    <p>Este é o <strong>primeiro</strong> parágrafo de notícia.</p>
    <p>O segundo parágrafo vem agora.&nbsp;Onde temos espaços inquebráveis.</p>
    <h2>Subtítulo Relevante</h2>
    <p>Frase final aqui.</p>
  `;

  const expectedTextSnippet = "Título da Matéria.\n\nEste é o primeiro parágrafo de notícia.";
  const cleanResult = extractPlainTextFromHtml(sampleHtml);

  console.log('--- HTML Limpo ---');
  console.log(cleanResult);

  if (!cleanResult.includes("Título da Matéria.\n\n") || cleanResult.includes("<strong>")) {
    console.error('❌ Teste de extrator de texto falhou: Formato ou conteúdo incorreto.');
    process.exit(1);
  }

  // Teste 2: Chuncking do texto
  const longText = "Esta é uma frase curta. Esta frase é propositalmente mais longa para testar a capacidade de quebra de blocos em sentenças menores para que a API de síntese de voz nativa não congele no Webview do celular.";
  const chunks = splitTextIntoChunks(longText, 50);

  console.log('--- Chunks Gerados ---');
  console.log(chunks);

  if (chunks.length < 2 || chunks.some(c => c.length > 150)) { // 150 é margem de segurança do maxLength
    console.error('❌ Teste de quebra de texto falhou.');
    process.exit(1);
  }

  console.log('✅ Teste de TtsUtils finalizado com sucesso!');
}

testTtsUtils();
