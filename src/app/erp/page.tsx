import { getEditorialStats } from "@/app/actions/dashboard";
import { FileText, Eye, Clock, CheckCircle, TrendingUp, Newspaper } from "lucide-react";
import Link from "next/link";

export default async function ERPDashboardPage() {
  const stats = await getEditorialStats();

  const cards = [
    { title: "Total de Matérias", value: stats.counts.total, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Em Rascunho", value: stats.counts.draft, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { title: "Publicadas", value: stats.counts.published, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Arquivadas", value: stats.counts.scheduled, icon: Newspaper, color: "text-gray-600", bg: "bg-gray-100" },
  ];

  return (
    <div className="space-y-10 py-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Dashboard Editorial</h1>
        <p className="text-gray-500 mt-1">Indicadores de performance e monitoramento de conteúdo em tempo real.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.title} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.bg} p-2.5 rounded-xl`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <TrendingUp className="w-4 h-4 text-gray-300" />
            </div>
            <div className="text-4xl font-black text-gray-900">{card.value}</div>
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mt-1">{card.title}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Audiência Ranking */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-red-50 p-2 rounded-lg">
                <Eye className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="font-bold text-gray-900">Top 5 - Mais Visualizadas (Tempo Real)</h2>
            </div>
            <Link href="/erp/analytics" className="text-xs font-bold text-red-600 hover:text-red-700 uppercase tracking-widest min-h-[44px] min-w-[80px] flex items-center justify-center p-2 rounded-lg hover:bg-red-50 transition-colors">Ver tudo</Link>
          </div>
          
          <div className="flex-1">
            {stats.popular.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {stats.popular.map((article, idx) => (
                  <div key={article.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
                    <span className="text-2xl font-black text-gray-200 w-8">0{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 truncate">{article.title}</div>
                      <div className="text-xs text-gray-500">/{article.slug}</div>
                    </div>
                    <div className="flex items-center gap-2 bg-red-50 px-3 py-1 rounded-full">
                      <span className="text-xs font-black text-red-700">{article.views}</span>
                      <Eye className="w-3 h-3 text-red-700" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-400 italic">Nenhum dado de audiência registrado.</div>
            )}
          </div>
        </div>

        {/* Quick Actions / Status Chart */}
        <div className="bg-gray-900 rounded-3xl p-8 text-white flex flex-col justify-between shadow-xl shadow-gray-200/50">
          <div>
            <h3 className="text-xl font-bold mb-6">Status da Produção</h3>
            <div className="space-y-4">
              {/* Fake Mini Graph with Actual Stats */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1 uppercase tracking-widest text-gray-400">
                  <span>Publicadas</span>
                  <span>{Math.round((stats.counts.published / (stats.counts.total || 1)) * 100)}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full" 
                    style={{ width: `${(stats.counts.published / (stats.counts.total || 1)) * 100}%` }} 
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-1 uppercase tracking-widest text-gray-400">
                  <span>Rascunhos</span>
                  <span>{Math.round((stats.counts.draft / (stats.counts.total || 1)) * 100)}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full" 
                    style={{ width: `${(stats.counts.draft / (stats.counts.total || 1)) * 100}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-800">
             <Link 
              href="/erp/artigos/novo" 
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-red-900/40 flex items-center justify-center gap-2"
            >
              <FileText className="w-5 h-5" />
              NOVA MATÉRIA
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
