import * as React from 'react';

interface NewsletterTemplateProps {
  title: string;
  excerpt: string;
  slug: string;
  imageUrl?: string;
}

export const NewsletterTemplate: React.FC<Readonly<NewsletterTemplateProps>> = ({
  title,
  excerpt,
  slug,
  imageUrl,
}) => (
  <div style={{
    fontFamily: 'system-ui, -apple-system, sans-serif',
    lineHeight: '1.6',
    color: '#333',
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    border: '1px solid #eee',
    borderRadius: '12px',
    backgroundColor: '#fff'
  }}>
    <h1 style={{ color: '#d32f2f', fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
      Revista Gestão - Resumo de Notícias
    </h1>
    
    {imageUrl && (
      <img 
        src={imageUrl} 
        alt={title} 
        style={{ width: '100%', height: 'auto', borderRadius: '8px', marginBottom: '20px' }} 
      />
    )}

    <h2 style={{ fontSize: '20px', margin: '0 0 12px 0' }}>{title}</h2>
    <p style={{ color: '#666', fontSize: '16px', marginBottom: '24px' }}>
      {excerpt}
    </p>
    
    <a 
      href={`https://revistagestao.com/noticia/${slug}`} 
      style={{
        display: 'inline-block',
        backgroundColor: '#d32f2f',
        color: '#fff',
        padding: '12px 24px',
        borderRadius: '6px',
        textDecoration: 'none',
        fontWeight: 'bold'
      }}
    >
      Ler notícia completa
    </a>

    <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '40px 0 20px 0' }} />
    
    <p style={{ fontSize: '12px', color: '#999', textAlign: 'center' }}>
      Você recebeu este e-mail porque está inscrito na newsletter da Revista Gestão.
      <br />
      © 2026 Revista Gestão - Todos os direitos reservados.
    </p>
  </div>
);
