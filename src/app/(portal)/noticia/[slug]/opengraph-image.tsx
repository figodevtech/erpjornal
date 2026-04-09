import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const alt = "Revista Gestao - Noticia";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const artigo = await prisma.artigo.findUnique({
    where: { slug },
    include: {
      categoria: true,
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
            background: "white",
          }}
        >
          <h1>Artigo nao encontrado</h1>
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
          alignItems: "flex-start",
          justifyContent: "flex-end",
          backgroundColor: "#fff",
          padding: "60px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#0f172a",
            zIndex: -1,
          }}
        />

        <div
          style={{
            position: "absolute",
            top: "40px",
            left: "40px",
            bottom: "40px",
            width: "8px",
            backgroundColor: "#d32f2f",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginLeft: "20px",
          }}
        >
          {artigo.categoria && (
            <div
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#d32f2f",
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
              fontSize: "60px",
              fontWeight: "900",
              lineHeight: 1.1,
              color: "white",
              marginBottom: "20px",
              paddingRight: "60px",
            }}
          >
            {artigo.titulo}
          </div>

          {artigo.resumo && (
            <div
              style={{
                fontSize: "28px",
                color: "#94a3b8",
                lineHeight: 1.4,
                marginBottom: "40px",
                display: "flex",
                paddingRight: "100px",
              }}
            >
              {artigo.resumo}
            </div>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: "10px",
            }}
          >
            <div
              style={{
                fontSize: "24px",
                fontWeight: "900",
                color: "white",
                letterSpacing: "-0.02em",
              }}
            >
              REVISTA <span style={{ color: "#d32f2f" }}>GESTAO</span>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
