import { NextRequest, NextResponse } from "next/server";
import { criarClienteSupabaseServer } from "@/lib/supabase/server";
import { exigirPermissao } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // 1. Verificar permissão (apenas editores/admins podem subir mídias comerciais)
    await exigirPermissao("midia-kit:editar");

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const mediaKitId = formData.get("mediaKitId") as string;
    const tipo = (formData.get("tipo") as string) || "image";

    if (!file || !mediaKitId) {
      return NextResponse.json(
        { error: "Arquivo ou mediaKitId ausente" },
        { status: 400 }
      );
    }

    const supabase = await criarClienteSupabaseServer();

    // 2. Upload para o bucket 'media-kit-assets'
    // Estrutura: media-kit-id/timestamp-random.ext
    const fileExt = file.name.split(".").pop();
    const fileName = `${mediaKitId}/${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("media-kit-assets")
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase Storage Error:", uploadError);
      return NextResponse.json(
        { error: "Falha ao enviar arquivo para o storage" },
        { status: 500 }
      );
    }

    // 3. Obter URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from("media-kit-assets").getPublicUrl(fileName);

    // 4. Registrar no Banco de Dados
    const asset = await prisma.mediaKitAsset.create({
      data: {
        mediaKitId,
        nome: file.name,
        url: publicUrl,
        tipo,
        tamanho: file.size,
        // altText pode ser editado posteriormente na UI
      },
    });

    return NextResponse.json(asset);
  } catch (error: any) {
    // Se for erro de redirecionamento do Next.js (403), repassamos
    if (error.digest?.includes("NEXT_REDIRECT")) {
      throw error;
    }

    console.error("Upload Route Error:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
