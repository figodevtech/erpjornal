/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';
import sitemap from '../sitemap';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    artigo: { findMany: vi.fn() },
    category: { findMany: vi.fn() },
    politician: { findMany: vi.fn() },
    podcastEpisode: { findMany: vi.fn() },
  },
}));

describe('Sitemap Generator', () => {
  it('should include fixed routes and dynamic routes', async () => {
     
    vi.mocked(prisma.artigo.findMany).mockResolvedValue([
      { slug: 'artigo-1', atualizadoEm: new Date() }
    ] as any);
    
     
    vi.mocked(prisma.categoria.findMany).mockResolvedValue([
        { slug: 'politica' }
    ] as any);

     
    vi.mocked(prisma.politico.findMany).mockResolvedValue([
        { id: '123', atualizadoEm: new Date() }
    ] as any);

     
    vi.mocked(prisma.episodioPodcast.findMany).mockResolvedValue([
        { slug: 'podcast-1', atualizadoEm: new Date() }
    ] as any);

    const result = await sitemap();

    const urls = result.map(u => u.url);
    
    expect(urls).toContain('https://revistagestao.com.br');
    expect(urls).toContain('https://revistagestao.com.br/noticia/artigo-1');
    expect(urls).toContain('https://revistagestao.com.br/categoria/politica');
    expect(urls).toContain('https://revistagestao.com.br/politicos/123');
    expect(urls).toContain('https://revistagestao.com.br/podcasts/podcast-1');
  });
});
