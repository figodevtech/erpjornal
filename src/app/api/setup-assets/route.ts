import { NextResponse } from "next/server";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

export async function GET() {
  const projectDir = "/home/italo/Área de trabalho/Jornal/erpjornal";
  const logs: string[] = [];

  try {
    const logoSrc = path.join(projectDir, "LOGO PADÃO BRANCA E VERMELHA.png");
    const logoDest = path.join(projectDir, "public/logo.png");
    if (fs.existsSync(logoSrc)) {
      fs.copyFileSync(logoSrc, logoDest);
      logs.push("Logo copiada para public/logo.png");
    } else {
      logs.push("Logo original não encontrada.");
    }

    const pyScript = path.join(projectDir, "scripts/add_background.py");
    if (fs.existsSync(pyScript)) {
      execSync(`python3 "${pyScript}"`, { cwd: projectDir });
      logs.push("Script Python do Favicon executado com sucesso.");
    } else {
      logs.push("Script Python não encontrado.");
    }

    return NextResponse.json({ success: true, logs });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message });
  }
}
