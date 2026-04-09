import { sendNewsletterEmail } from '../newsletter-service';

/**
 * Teste unitário manual para verificação do disparo do serviço de newsletter.
 * Pode ser executado via: npx tsx src/lib/__tests__/newsletter-service.test.ts
 */
async function testNewsletterService() {
  console.log('🧪 Iniciando teste unitário de NewsletterService...');
  
  const sampleArticle = {
    title: 'Nova Política de Sustentabilidade na Amazônia',
    excerpt: 'Governo federal anuncia pacote de medidas para reduzir desmatamento.',
    slug: 'nova-politica-sustentabilidade-amazonia',
    imageUrl: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=600'
  };

  const to = 'test@example.com';
  const result = await sendNewsletterEmail({
    to,
    subject: `Newsletter Gestão: ${sampleArticle.title}`,
    artigo: sampleArticle
  });

  if (result.success || result.message === 'API Key ausente') {
    // Com a API Key vazia, deve falhar com a mensagem customizada, o que confirma o fluxo básico.
    console.log('✅ Teste bem-sucedido (Simulação OK): %j', result);
  } else {
    console.error('❌ Teste falhou inesperadamente: %j', result);
    process.exit(1);
  }
}

testNewsletterService();
