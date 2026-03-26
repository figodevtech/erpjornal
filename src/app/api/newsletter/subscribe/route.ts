import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, origem } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "E-mail é obrigatório" }, { status: 400 });
    }

    const subscription = await (prisma as any).newsletterSubscription.upsert({
      where: { email },
      update: { 
        origem: origem || "unknown"
      },
      create: { 
        email, 
        origem: origem || "unknown" 
      },
    });

    return NextResponse.json({ success: true, data: subscription });
  } catch (error) {
    console.error("Newsletter Subscription Error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
