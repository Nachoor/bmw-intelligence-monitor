'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { MediaStats, AIStats } from '@/types'

interface Props { mediaStats: MediaStats; aiStats: AIStats }

const COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#eff6ff']

export default function ModelosTab({ mediaStats, aiStats }: Props) {
  const mediaModels = (mediaStats.topModels ?? []).map(([model, count]) => ({ model, count }))
  const aiModels = (aiStats.topModels ?? []).map(([model, count]) => ({ model, count }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Modelos en prensa */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Modelos BMW más mencionados en prensa</h3>
          <p className="text-xs text-slate-500 mb-4">Últimos 30 días</p>
          {mediaModels.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={mediaModels} layout="vertical" barSize={18}>
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis type="category" dataKey="model" tick={{ fill: '#94a3b8', fontSize: 11 }} width={70} />
                <Tooltip formatter={(v: any) => `${v} artículos`} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="count" name="Artículos" radius={[0, 4, 4, 0]}>
                  {mediaModels.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-500 text-xs">Sin datos aún</div>
          )}
        </div>

        {/* Modelos en IA */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Modelos BMW recomendados por la IA</h3>
          <p className="text-xs text-slate-500 mb-4">Menciones en respuestas de Groq + Gemini</p>
          {aiModels.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={aiModels} layout="vertical" barSize={18}>
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis type="category" dataKey="model" tick={{ fill: '#94a3b8', fontSize: 11 }} width={70} />
                <Tooltip formatter={(v: any) => `${v} menciones`} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="count" name="Menciones" radius={[0, 4, 4, 0]}>
                  {aiModels.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-500 text-xs">Sin datos aún</div>
          )}
        </div>
      </div>

      {/* Tabla comparativa */}
      {mediaModels.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-white">Ranking comparativo</h3>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50">
                {['#', 'Modelo', 'Artículos en prensa', 'Menciones en IA'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-slate-500 font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mediaModels.map((row, i) => {
                const aiCount = aiModels.find(m => m.model === row.model)?.count ?? 0
                return (
                  <tr key={row.model} className="border-b border-slate-800/40 hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-2.5 text-slate-500 font-bold">#{i + 1}</td>
                    <td className="px-4 py-2.5 text-white font-semibold">{row.model}</td>
                    <td className="px-4 py-2.5 text-blue-400 font-bold">{row.count}</td>
                    <td className="px-4 py-2.5 text-slate-300">{aiCount > 0 ? aiCount : '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
