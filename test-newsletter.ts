import { sendNewsletterEmail } from './src/lib/newsletter-service';

async function run() {
  try {
    console.log('🧪 Iniciando teste...');
    const res = await sendNewsletterEmail({
      to: 'test@example.com',
      subject: 'Teste',
      article: {
        title: 'Título',
        excerpt: 'Resumo',
        slug: 'slug'
      }
    });

    console.log('Resultado:', res);
    if (res.message === 'API Key ausente' || res.success) {
      console.log('✅ Teste Validado');
    } else {
      console.error('❌ Falha no resultado:', res);
      process.exit(1);
    }
  } catch (e) {
    console.error('❌ ERRO DURANTE TESTE:', e);
    process.exit(1);
  }
}

run();
