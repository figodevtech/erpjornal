import { Resend } from 'resend';
import { NewsletterTemplate } from '../components/emails/NewsletterTemplate';
import * as React from 'react';

interface SendNewsEmailParams {
  to: string | string[];
  subject: string;
  artigo: {
    title: string;
    excerpt: string;
    slug: string;
    imageUrl?: string;
  };
}

/**
 * Serviço responsável pelo disparo de newsletters.
 * Integração realizada via Resend API.
 */
export const sendNewsletterEmail = async ({
  to,
  subject,
  artigo
}: SendNewsEmailParams) => {
  const from = process.env.EMAIL_FROM || 'Revista Gestão <contato@revistagestao.com>';
  
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY não configurada. E-mail simulado:', { to, subject, artigo });
    return { success: false, message: 'API Key ausente' };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      react: NewsletterTemplate(artigo) as React.ReactElement,
    });

    if (error) {
       console.error('Erro ao enviar e-mail via Resend:', error);
       return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Exceção fatal durante disparo de newsletter:', err);
    return { success: false, error: err };
  }
};
