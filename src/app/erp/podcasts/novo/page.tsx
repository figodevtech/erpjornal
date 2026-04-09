import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { exigirPermissao } from "@/lib/auth";

import PodcastForm from "../components/PodcastForm";

export default async function NovoPodcastPage() {
  await exigirPermissao("podcasts:criar");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link
          href="/erp/podcasts"
          className="rounded-full border border-gray-200 bg-white p-2 text-gray-400 shadow-sm transition-all hover:bg-gray-100 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Novo Episodio</h1>
          <p className="mt-1 text-sm text-gray-500">Configure o titulo, audio e metadados do podcast.</p>
        </div>
      </div>

      <PodcastForm />
    </div>
  );
}
