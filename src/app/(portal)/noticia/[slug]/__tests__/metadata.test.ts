import { describe, it, expect, vi } from 'vitest';
import { generateMetadata } from '../page';
import { prisma } from '@/lib/prisma';

// Mock do Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    artigo: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth', () => ({
  obterSessao: vi.fn(),
}));

vi.mock('@/components/portal/NewsletterForm', () => ({
  default: () => null
}));

describe('NoticiaPage Metadata', () => {
  it('should return correct metadata for a valid artigo', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockArticle: any = {
      titulo: 'Notícia de Teste',
      slug: 'noticia-de-teste',
      resumo: 'Este é um resumo de teste.',
      dataPublicacao: new Date('2026-03-24T12:00:00Z'),
    };

    vi.mocked(prisma.artigo.findUnique).mockResolvedValue(mockArticle);

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'noticia-de-teste' }) });

    expect(metadata.title).toBe('Notícia de Teste | Revista Gestão');
    expect(metadata.description).toBe('Este é um resumo de teste.');
    expect(metadata.openGraph?.title).toBe('Notícia de Teste');
  });

  it('should return default title if artigo not found', async () => {
    vi.mocked(prisma.artigo.findUnique).mockResolvedValue(null);

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'not-found' }) });

    expect(metadata.title).toBe('Artigo não encontrado');
  });
});
