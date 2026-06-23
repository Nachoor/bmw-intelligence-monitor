'use client'
import { useState } from 'react'
import type { AIStats, AIQueryResult } from '@/types'
import { Bot, Trophy, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'

interface Props { aiStats: AIStats; recentQueries: AIQueryResult[] }

const CAT_LABELS: Record<string, string> = {
  recomendacion_general: 'Recomendación',
  comparativa: 'Comparativas',
  electrico: 'Eléctrico',
  precio: 'Precio',
  fiabilidad: 'Fiabilidad',
  tecnologia: 'Tecnología',
  suv: 'SUV',
}

const BRAND_COLORS: Record<string, string> = {
  BMW: '#3b82f6', Audi: '#ef4444', 'Mercedes-Benz': '#94a3b8',
}

function QueryCard({ q }: { q: AIQueryResult }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-start justify-between p-4 text-left hover:bg-slate-800/40 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              {CAT_LABELS[q.category] ?? q.category}
            </span>
            <span className="text-[10px] text-slate-600 uppercase">{q.llm}</span>
            {q.bmwFound ? (
              <span className="flex items-center gap-1 text-[10px] font-bold text-green-400">
                <CheckCircle className="w-3 h-3" /> BMW #{q.bmwRank}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-bold text-red-400">
                <XCircle className="w-3 h-3" /> BMW no mencionado
              </span>
            )}
          </div>
          <p className="text-sm text-slate-200">{q.question}</p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-500 ml-3 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 ml-3 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-slate-800 pt-3 space-y-3">
          <p className="text-xs text-slate-400 leading-relaxed">{q.response}</p>
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
            {q.brandMentions.map(bm => (
              <span key={bm.brand} className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                style={{ color: BRAND_COLORS[bm.brand] ?? '#94a3b8', borderColor: `${BRAND_COLORS[bm.brand] ?? '#94a3b8'}40`, background: `${BRAND_COLORS[bm.brand] ?? '#94a3b8'}10` }}>
                #{bm.rank} {bm.brand}
              </span>
            ))}
          </div>
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
        <p className="text-sm">Sin datos de IA aún.</p>
      </div>
    )
  }

  const radarData = Object.entries(aiStats.byCategory).map(([cat, s]) => ({
    cat: CAT_LABELS[cat] ?? cat,
    rate: s.rate,
    fullMark: 100,
  }))

  const totalQueries = aiStats.totalQueries
  const rate = aiStats.bmwAppearanceRate
  const rank = aiStats.bmwAvgRank

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Hero metric */}
      <div className="bg-gradient-to-br from-blue-950/60 to-slate-900 border border-blue-500/20 rounded-2xl p-8">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="text-center lg:text-left">
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-2">BMW · AI Share of Voice</p>
            <div className="flex items-end gap-3">
              <span className="text-7xl font-black text-white">{rate}%</span>
              <span className="text-slate-400 text-sm mb-3 leading-tight">de las preguntas<br/>sobre coches premium</span>
            </div>
            <p className="text-slate-400 text-sm mt-2">
              Cuando alguien le pregunta a una IA qué coche premium comprar, <strong className="text-white">BMW aparece en {rate}% de las respuestas</strong>, con una posición media de <strong className="text-blue-400">#{rank}</strong>.
            </p>
          </div>

          {/* Radar chart */}
          {radarData.length > 0 && (
            <div className="w-full lg:w-64 h-56 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="cat" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Radar dataKey="rate" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
                  <Tooltip formatter={(v: any) => `${v}%`} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Por categoría */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Presencia BMW por tipo de pregunta</h3>
          <div className="space-y-3">
            {Object.entries(aiStats.byCategory)
              .sort((a, b) => b[1].rate - a[1].rate)
              .map(([cat, s]) => (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">{CAT_LABELS[cat] ?? cat}</span>
                    <div className="flex items-center gap-2">
                      {s.avgRank && <span className="text-slate-500">pos. #{s.avgRank}</span>}
                      <span className={`font-bold ${s.rate >= 90 ? 'text-green-400' : s.rate >= 70 ? 'text-amber-400' : 'text-red-400'}`}>{s.rate}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-800">
                    <div className="h-1.5 rounded-full transition-all"
                      style={{ width: `${s.rate}%`, background: s.rate >= 90 ? '#10b981' : s.rate >= 70 ? '#f59e0b' : '#ef4444' }} />
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="space-y-4">
          {/* Competidores en IA */}
          {(aiStats.competitorWins ?? []).length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">Competidores que la IA pone antes que BMW</h3>
              </div>
              <div className="space-y-3">
                {aiStats.competitorWins.map(([brand, count]) => {
                  const pct = Math.round(count / totalQueries * 100)
                  return (
                    <div key={brand} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold" style={{ color: BRAND_COLORS[brand] ?? '#94a3b8' }}>{brand}</span>
                        <span className="text-white font-bold">{count} preguntas ({pct}%)</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-800">
                        <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: BRAND_COLORS[brand] ?? '#64748b' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Atributos */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Cómo describe la IA a BMW</h3>
            <div className="mb-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Positivo</p>
              <div className="flex flex-wrap gap-1.5">
                {(aiStats.positiveAttributes ?? []).map(([attr, count]) => (
                  <span key={attr} className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 font-medium">
                    {attr} <span className="text-green-600 font-bold">{count}</span>
                  </span>
                ))}
              </div>
            </div>
            {(aiStats.negativeAttributes ?? []).length > 0 && (
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Negativo</p>
                <div className="flex flex-wrap gap-1.5">
                  {aiStats.negativeAttributes.map(([attr, count]) => (
                    <span key={attr} className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-medium">
                      {attr} <span className="text-red-600 font-bold">{count}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Respuestas del día */}
      {recentQueries.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Respuestas de la IA — hoy</h3>
            <span className="text-xs text-slate-500">{recentQueries.length} preguntas analizadas</span>
          </div>
          {recentQueries.map(q => <QueryCard key={q.id} q={q} />)}
        </div>
      )}
    </div>
  )
}
