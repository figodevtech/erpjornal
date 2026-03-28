import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/prisma';

// Route segment config
export const runtime = 'nodejs'; // Using nodejs because of Prisma

// Image metadata
export const alt = 'Revista Gestão - Notícia';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Image generation
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
        categoria: true
    }
  });

  if (!article) {
    return new ImageResponse(
      (
        <div style={{ display: 'flex', width: '100%', height: '100%', background: 'white' }}>
          <h1>Artigo não encontrado</h1>
        </div>
      ),
      { ...size }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          backgroundColor: '#fff',
          padding: '60px',
          position: 'relative',
        }}
      >
        {/* Background Decorative Element */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#0f172a', // gray-900
            zIndex: -1,
          }}
        />
        
        {/* Border Accent */}
        <div
          style={{
            position: 'absolute',
            top: '40px',
            left: '40px',
            bottom: '40px',
            width: '8px',
            backgroundColor: '#d32f2f', // red-700
          }}
        />

        {/* Content Container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginLeft: '20px',
          }}
        >
          {/* Category */}
          {article.categoria && (
            <div
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#d32f2f',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '10px',
              }}
            >
              {article.categoria.nome}
            </div>
          )}

          {/* Title */}
          <div
            style={{
              fontSize: '60px',
              fontWeight: '900',
              lineHeight: 1.1,
              color: 'white',
              marginBottom: '20px',
              paddingRight: '60px',
            }}
          >
            {article.titulo}
          </div>

          {/* Excerpt/Summary */}
          {article.resumo && (
            <div
              style={{
                fontSize: '28px',
                color: '#94a3b8',
                lineHeight: 1.4,
                marginBottom: '40px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                paddingRight: '100px',
              }}
            >
              {article.resumo}
            </div>
          )}

          {/* Brand Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: '10px',
            }}
          >
            <div
              style={{
                fontSize: '24px',
                fontWeight: '900',
                color: 'white',
                letterSpacing: '-0.02em',
              }}
            >
              REVISTA <span style={{ color: '#d32f2f' }}>GESTàƒO</span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

