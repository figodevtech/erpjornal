import { ImageResponse } from "next/og";

import { filtroArtigoNoAr } from "@/lib/data/artigos";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const alt = "Revista Gestão - Notícia";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const COR_FUNDO = "#0f172a";
const COR_DESTAQUE = "#d32f2f";

function limitar(texto: string, maximo: number) {
  return texto.length > maximo ? `${texto.slice(0, maximo - 1).trimEnd()}…` : texto;
}

/**
 * Observação: o Satori (motor do ImageResponse) exige `display: flex` em toda
 * <div> com mais de um filho e não suporta z-index.
 */
function Marca({ tamanho }: { tamanho: number }) {
  return (
    <div style={{ display: "flex", fontSize: tamanho, fontWeight: 900, letterSpacing: "-0.02em" }}>
      <span style={{ color: "white" }}>REVISTA&nbsp;</span>
      <span style={{ color: COR_DESTAQUE }}>GESTÃO</span>
    </div>
  );
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Só matérias publicadas e já no ar: rascunhos e agendadas não podem vazar o título.
  const artigo = await prisma.artigo.findFirst({
    where: {
      slug,
      ...filtroArtigoNoAr(),
    },
    select: {
      titulo: true,
      resumo: true,
      categoria: { select: { nome: true } },
    },
  });

  if (!artigo) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: COR_FUNDO,
          }}
        >
          <Marca tamanho={72} />
        </div>
      ),
      { ...size }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          backgroundColor: COR_FUNDO,
          padding: "60px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "40px",
            left: "40px",
            bottom: "40px",
            width: "8px",
            backgroundColor: COR_DESTAQUE,
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", marginLeft: "20px" }}>
          {artigo.categoria && (
            <div
              style={{
                display: "flex",
                fontSize: "24px",
                fontWeight: "bold",
                color: COR_DESTAQUE,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "10px",
              }}
            >
              {artigo.categoria.nome}
            </div>
          )}

          <div
            style={{
              display: "flex",
              fontSize: "60px",
              fontWeight: 900,
              lineHeight: 1.1,
              color: "white",
              marginBottom: "20px",
              paddingRight: "60px",
            }}
          >
            {limitar(artigo.titulo, 110)}
          </div>

          {artigo.resumo && (
            <div
              style={{
                display: "flex",
                fontSize: "28px",
                color: "#94a3b8",
                lineHeight: 1.4,
                marginBottom: "40px",
                paddingRight: "100px",
              }}
            >
              {limitar(artigo.resumo, 160)}
            </div>
          )}

          <Marca tamanho={24} />
        </div>
      </div>
    ),
    { ...size }
  );
}
