import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { exigirPermissao } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  STORAGE_BUCKETS,
  mensagemErroUpload,
  validarArquivoParaBucket,
} from "@/lib/storage/buckets";
import { criarClienteSupabaseAdmin } from "@/lib/supabase/admin";

const BUCKET = STORAGE_BUCKETS.mediaKitAssets;

const EXTENSOES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export async function POST(req: NextRequest) {
  try {
    // Apenas quem edita mídia kits pode subir arquivos comerciais.
    await exigirPermissao("midia-kit:editar");

    const formData = await req.formData();
    const file = formData.get("file");
    const mediaKitId = formData.get("mediaKitId");
    const tipo = (formData.get("tipo") as string) || "image";

    if (!(file instanceof File) || typeof mediaKitId !== "string" || !mediaKitId) {
      return NextResponse.json({ error: "Arquivo ou mediaKitId ausente" }, { status: 400 });
    }

    const erroArquivo = validarArquivoParaBucket(BUCKET, file);
    if (erroArquivo) {
      return NextResponse.json({ error: erroArquivo }, { status: 400 });
    }

    // Confere o mídia kit ANTES de subir o arquivo, para não deixar órfãos no Storage.
    const kit = await prisma.mediaKit.findUnique({
      where: { id: mediaKitId },
      select: { id: true },
    });
    if (!kit) {
      return NextResponse.json({ error: "Mídia kit não encontrado" }, { status: 404 });
    }

    // Estrutura: <media-kit-id>/<timestamp>-<uuid>.<ext> (extensão derivada do MIME, não do nome)
    const fileName = `${kit.id}/${Date.now()}-${randomUUID()}.${EXTENSOES[file.type]}`;
    const supabase = criarClienteSupabaseAdmin();

    const { error: uploadError } = await supabase.storage
      .from(BUCKET.name)
      .upload(fileName, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      console.error("Supabase Storage Error:", uploadError);
      return NextResponse.json(
        { error: mensagemErroUpload(BUCKET, uploadError.message) },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET.name).getPublicUrl(fileName);

    const asset = await prisma.mediaKitAsset.create({
      data: {
        mediaKitId: kit.id,
        nome: file.name,
        url: publicUrl,
        tipo,
        tamanho: file.size,
        // altText pode ser editado posteriormente na UI
      },
    });

    return NextResponse.json(asset);
  } catch (error: unknown) {
    const err = error as { digest?: string };
    // Redirecionamentos do Next (ex.: /403 vindo de exigirPermissao) devem seguir adiante.
    if (err.digest?.includes("NEXT_REDIRECT")) {
      throw error;
    }

    console.error("Upload Route Error:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
