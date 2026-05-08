import RevistaForm from "../components/RevistaForm";

import { exigirPermissao } from "@/lib/auth";

export default async function NovaRevistaPage() {
  await exigirPermissao("revistas:criar");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Nova Edição</h1>
        <p className="mt-1 text-sm text-gray-500">Cadastre a edição da revista e depois adicione os artigos.</p>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <RevistaForm />
      </div>
    </div>
  );
}
