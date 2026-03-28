/**
 * Utilitários para o Serviço de Text-to-Speech (TTS).
 * Focado em sanetizar o HTML do artigo para leitura limpa por síntese de voz.
 */

/**
 * Extrai texto plano de uma string HTML, mantendo quebras de linha básicas.
 * @param html String HTML vinda do TipTap ou Banco de Dados.
 * @returns Texto limpo para leitura.
 */
export function extractPlainTextFromHtml(html: string): string {
    if (!html) return "";

    // 1. Substitui tags comuns de bloco por quebra de linha para manter a pausabilidade natural
    let clean = html
        .replace(/<\/p>/g, "\n\n")
        .replace(/<\/h1>|<\/h2>|<\/h3>|<\/h4>/g, ".\n\n")
        .replace(/<br\s*\/?>/g, "\n");

    // 2. Remove todas as demais tags HTML remanescentes
    clean = clean.replace(/<[^>]*>?/gm, "");

    // 3. Decodifica entidades HTML comuns (ex: &nbsp;)
    const entities: { [key: string]: string } = {
        '&nbsp;': ' ',
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&apos;': "'",
        '&#39;': "'",
    };
    
    for (const entity in entities) {
        clean = clean.replace(new RegExp(entity, 'g'), entities[entity]);
    }

    // 4. Limpeza final de espaços redundantes e trim
    return clean
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n\n');
}

/**
 * Divide o texto em blocos menores para evitar travamentos em sínteses nativas e garantir 
 * compatibilidade cross-browser (especialmente mobile Safari).
 */
export function splitTextIntoChunks(text: string, maxLength: number = 200): string[] {
    const chunks: string[] = [];
    const sentences = text.split(/([.!?]\s+)/);
    let currentChunk = "";

    // Helper para adicionar texto ao chunk atual ou criar novos
    const addText = (txt: string) => {
        if ((currentChunk + txt).length > maxLength) {
            if (currentChunk) chunks.push(currentChunk.trim());
            
            // Se o próprio texto for maior que maxLength, quebra por palavras
            if (txt.length > maxLength) {
                const words = txt.split(' ');
                let subChunk = "";
                for (const word of words) {
                    if ((subChunk + word).length > maxLength) {
                        if (subChunk) chunks.push(subChunk.trim());
                        subChunk = word + " ";
                    } else {
                        subChunk += word + " ";
                    }
                }
                currentChunk = subChunk;
            } else {
                currentChunk = txt;
            }
        } else {
            currentChunk += txt;
        }
    };

    for (let i = 0; i < sentences.length; i++) {
        addText(sentences[i]);
    }

    if (currentChunk.trim()) chunks.push(currentChunk.trim());
    return chunks;
}
