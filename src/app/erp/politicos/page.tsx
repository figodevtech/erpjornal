import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPoliticians } from "./actions";
import PoliticianManager from "./components/PoliticianManager";

export default async function PoliticosPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin");

  // Apenas editores e admins gerenciam políticos
  if (session.user.role === "reporter") {
    redirect("/erp/artigos");
  }

  const politicians = await getPoliticians();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PoliticianManager initialPoliticians={politicians as any} />
    </div>
  );
}

