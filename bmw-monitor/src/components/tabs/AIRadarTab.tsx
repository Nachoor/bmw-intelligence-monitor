'use client'
import type { AIStats, AIQueryResult } from '@/types'
import { Bot, Trophy, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

interface Props { aiStats: AIStats; recentQueries: AIQueryResult[] }

const CAT_LABELS: Record<string, string> = {
  recomendacion_general: 'Recomendación general',
  comparativa: 'Comparativa directa',
  electrico: 'Eléctrico / Autonomía',
  precio: 'Precio',
  fiabilidad: 'Fiabilidad',
  tecnologia: 'Tecnología',
  suv: 'SUV',
}

const BRAND_COLORS: Record<string, string> = {
  BMW: '#3b82f6', Audi: '#ef4444', 'Mercedes-Benz': '#94a3b8',
  Tesla: '#10b981', Porsche: '#f59e0b',
}

function QueryCard({ q }: { q: AIQueryResult }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-start justify-between p-4 text-left hover:bg-slate-800/40 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              {CAT_LABELS[q.category] ?? q.category}
            </span>
            <span className="text-[10px] text-slate-600 uppercase">{q.llm}</span>
            {q.bmwFound ? (
              <span className="text-[10px] font-bold text-green-400">BMW #{q.bmwRank}</span>
            ) : (
              <span className="text-[10px] font-bold text-red-400">BMW no mencionado</span>
            )}
          </div>
          <p className="text-sm text-slate-200">{q.question}</p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-500 ml-3 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 ml-3 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-slate-800 pt-3">
          <p className="text-xs text-slate-400 leading-relaxed mb-3">{q.response}</p>
          {q.bmwFound && (
            <div className="flex flex-wrap gap-2">
              {q.bmwPositiveAttrs.map(a => (
                <span key={a} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                  <ThumbsUp className="w-2.5 h-2.5" /> {a}
                </span>
              ))}
              {q.bmwNegativeAttrs.map(a => (
                <span key={a} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                  <ThumbsDown className="w-2.5 h-2.5" /> {a}
                </span>
              ))}
            </div>
          )}
          {q.brandMentions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {q.brandMentions.map(bm => (
                <span key={bm.brand} className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                  style={{ color: BRAND_COLORS[bm.brand] ?? '#94a3b8', borderColor: `${BRAND_COLORS[bm.brand] ?? '#94a3b8'}40`, background: `${BRAND_COLORS[bm.brand] ?? '#94a3b8'}10` }}>
                  #{bm.rank} {bm.brand}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function AIRadarTab({ aiStats, recentQueries }: Props) {
  if (!aiStats || !aiStats.totalQueries) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-500">
        <Bot className="w-10 h-10 opacity-30" />
        <p className="text-sm">Sin datos de IA aún. Aparecerán tras la primera ejecución del pipeline.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Queries totales</p>
          <p className="text-3xl font-bold text-white">{aiStats.totalQueries}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Aparición BMW</p>
          <p className="text-3xl font-bold text-blue-400">{aiStats.bmwAppearanceRate}%</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Posición media</p>
          <p className="text-3xl font-bold text-white">{aiStats.bmwAvgRank ? `#${aiStats.bmwAvgRank}` : '—'}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">LLMs analizados</p>
          <p className="text-3xl font-bold text-white">{Object.keys(aiStats.byLLM ?? {}).length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Atributos positivos */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <ThumbsUp className="w-4 h-4 text-green-400" />
            <h3 className="text-sm font-semibold text-white">Atributos positivos asociados a BMW</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {(aiStats.positiveAttributes ?? []).map(([attr, count]) => (
              <span key={attr} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 font-medium">
                {attr} <span className="text-green-600 font-bold">{count}</span>
              </span>
            ))}
            {!aiStats.positiveAttributes?.length && <p className="text-xs text-slate-500">Sin datos aún</p>}
          </div>
        </div>

        {/* Atributos negativos */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <ThumbsDown className="w-4 h-4 text-red-400" />
            <h3 className="text-sm font-semibold text-white">Atributos negativos asociados a BMW</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {(aiStats.negativeAttributes ?? []).map(([attr, count]) => (
              <span key={attr} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-medium">
                {attr} <span className="text-red-600 font-bold">{count}</span>
              </span>
            ))}
            {!aiStats.negativeAttributes?.length && <p className="text-xs text-slate-500">Sin datos aún</p>}
          </div>
        </div>
      </div>

      {/* Competidores que superan a BMW */}
      {(aiStats.competitorWins ?? []).length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Marcas que la IA posiciona antes que BMW</h3>
            <span className="text-xs text-slate-500">— nº de preguntas donde aparecen en posición superior</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {aiStats.competitorWins.map(([brand, count]) => (
              <div key={brand} className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2">
                <span className="text-sm font-semibold" style={{ color: BRAND_COLORS[brand] ?? '#94a3b8' }}>{brand}</span>
                <span className="text-sm font-bold text-white">{count}x</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Respuestas recientes */}
      {recentQueries.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white">Respuestas de hoy</h3>
          {recentQueries.map(q => <QueryCard key={q.id} q={q} />)}
        </div>
      )}
    </div>
  )
}
