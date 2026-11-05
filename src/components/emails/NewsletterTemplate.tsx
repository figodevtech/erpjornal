import * as React from "react";

interface NewsletterTemplateProps {
  title: string;
  excerpt: string;
  /** Link absoluto da matéria. */
  url: string;
  imageUrl?: string;
  /** Link absoluto de descadastro deste inscrito (LGPD: obrigatório em todo envio). */
  linkDescadastro: string;
}

const botao: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: "#b91c1c",
  color: "#fff",
  padding: "12px 24px",
  borderRadius: "6px",
  textDecoration: "none",
  fontWeight: "bold",
};

/** E-mail de uma matéria para os inscritos confirmados. */
export function NewsletterTemplate({ title, excerpt, url, imageUrl, linkDescadastro }: NewsletterTemplateProps) {
  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        lineHeight: "1.6",
        color: "#1f2937",
        maxWidth: "600px",
        margin: "0 auto",
        padding: "20px",
        border: "1px solid #eee",
        borderRadius: "12px",
        backgroundColor: "#fff",
      }}
    >
      <p style={{ color: "#b91c1c", fontSize: "13px", fontWeight: "bold", letterSpacing: "2px", margin: "0 0 16px" }}>
        REVISTA GESTÃO
      </p>

      {imageUrl && (
        // E-mail: clientes de e-mail exigem <img> simples (next/image não se aplica).
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" style={{ width: "100%", height: "auto", borderRadius: "8px", marginBottom: "20px" }} />
      )}

      <h1 style={{ fontSize: "22px", margin: "0 0 12px 0" }}>{title}</h1>
      {excerpt && <p style={{ color: "#4b5563", fontSize: "16px", marginBottom: "24px" }}>{excerpt}</p>}

      <a href={url} style={botao}>
        Ler a matéria
      </a>

      <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "40px 0 20px 0" }} />

      <p style={{ fontSize: "12px", color: "#6b7280", textAlign: "center" }}>
        Você recebe este e-mail porque confirmou a inscrição na newsletter da Revista Gestão.
        <br />
        <a href={linkDescadastro} style={{ color: "#6b7280" }}>
          Não quero mais receber
        </a>
      </p>
    </div>
  );
}

/** E-mail de confirmação da inscrição (dupla confirmação). */
export function ConfirmacaoNewsletterTemplate({ linkConfirmacao }: { linkConfirmacao: string }) {
  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        lineHeight: "1.6",
        color: "#1f2937",
        maxWidth: "600px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      <p style={{ color: "#b91c1c", fontSize: "13px", fontWeight: "bold", letterSpacing: "2px", margin: "0 0 16px" }}>
        REVISTA GESTÃO
      </p>
      <h1 style={{ fontSize: "22px", margin: "0 0 12px 0" }}>Confirme sua inscrição</h1>
      <p style={{ fontSize: "16px", color: "#4b5563" }}>
        Recebemos um pedido para inscrever este e-mail na newsletter da Revista Gestão. Para começar a receber,
        confirme no botão abaixo.
      </p>
      <p style={{ margin: "24px 0" }}>
        <a href={linkConfirmacao} style={botao}>
          Confirmar inscrição
        </a>
      </p>
      <p style={{ fontSize: "13px", color: "#6b7280" }}>
        Se não foi você, ignore este e-mail: sem a confirmação, você não recebe nada.
      </p>
    </div>
  );
}
