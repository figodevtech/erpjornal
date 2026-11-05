import type { Metadata } from "next";
import Link from "next/link";

import PaginaInstitucional from "@/components/portal/PaginaInstitucional";
import { emailContato } from "@/lib/contato";

export const metadata: Metadata = {
  title: "Política de privacidade | Revista Gestão",
  description: "Como a Revista Gestão trata dados pessoais, em conformidade com a LGPD.",
};

/**
 * Texto descreve o tratamento de dados que o sistema realmente faz.
 * Deve ser revisado pelo jurídico antes da publicação em produção.
 */
export default function PoliticaPrivacidadePage() {
  const email = emailContato();

  return (
    <PaginaInstitucional
      eyebrow="LGPD"
      titulo="Política de privacidade"
      descricao="Como tratamos os seus dados pessoais (Lei nº 13.709/2018)."
    >
      <h2>Quais dados coletamos e por quê</h2>
      <ul>
        <li>
          <strong>Newsletter:</strong> e-mail e a página em que você se inscreveu, para enviar a newsletter.
        </li>
        <li>
          <strong>Conta de leitor ou da equipe:</strong> nome, e-mail e senha (guardada de forma criptografada
          pelo nosso provedor de autenticação), para liberar o acesso a conteúdos exclusivos e ao sistema
          editorial.
        </li>
        <li>
          <strong>Contagem de leituras:</strong> registramos quantas vezes cada matéria foi lida, sem identificar
          o leitor. O endereço IP é usado apenas de forma transitória (até 30 minutos) para evitar contagens
          repetidas.
        </li>
        <li>
          <strong>Métricas de uso e desempenho:</strong> estatísticas agregadas de navegação e de velocidade do
          site (Vercel Analytics e Speed Insights).
        </li>
        <li>
          <strong>Diagnóstico de erros:</strong> relatórios técnicos de falhas (Sentry), configurados para não
          enviar cookies, conteúdo de formulários nem dados de identificação.
        </li>
      </ul>

      <h2>Cookies e armazenamento local</h2>
      <p>
        Usamos cookies apenas para manter a sua sessão quando você entra na sua conta. A preferência de tema
        (claro ou escuro) fica salva no seu próprio navegador.
      </p>

      <h2>Compartilhamento</h2>
      <p>
        Não vendemos dados pessoais. Os dados são tratados por fornecedores que operam a infraestrutura do
        site (hospedagem, banco de dados e autenticação, envio de e-mails e monitoramento), apenas para essas
        finalidades.
      </p>

      <h2>Seus direitos</h2>
      <p>
        Você pode solicitar a confirmação do tratamento, o acesso, a correção, a anonimização ou a exclusão dos
        seus dados, além de cancelar a newsletter a qualquer momento.
        {email ? (
          <>
            {" "}Envie o pedido para <a href={`mailto:${email}`}>{email}</a>.
          </>
        ) : (
          <>
            {" "}Use os canais da página de <Link href="/contato">contato</Link>.
          </>
        )}
      </p>

      <p className="text-sm">Última atualização: novembro de 2026.</p>
    </PaginaInstitucional>
  );
}
