import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PodcastForm from "../components/PodcastForm";

export default async function NovoPodcastPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link href="/erp/podcasts" className="text-gray-400 hover:text-gray-900 bg-white hover:bg-gray-100 p-2 rounded-full shadow-sm transition-all border border-gray-200">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Novo Episódio</h1>
          <p className="text-sm text-gray-500 mt-1">Configure o título, áudio e metadados do podcast.</p>
        </div>
      </div>

      <PodcastForm />
    </div>
  );
}

