'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { MediaStats } from '@/types'

interface Props { mediaStats: MediaStats }

const TOPIC_LABELS: Record<string, string> = {
  precio: 'Precio', autonomia: 'Autonomía', electrico: 'Eléctrico',
  diseño: 'Diseño', tecnologia: 'Tecnología', fiabilidad: 'Fiabilidad',
  conduccion: 'Conducción', ventas: 'Ventas', lanzamiento: 'Lanzamiento',
}

const TOPIC_COLORS: Record<string, string> = {
  precio: '#f59e0b', autonomia: '#10b981', electrico: '#06b6d4',
  diseño: '#8b5cf6', tecnologia: '#3b82f6', fiabilidad: '#ef4444',
  conduccion: '#f97316', ventas: '#84cc16', lanzamiento: '#ec4899',
}

const TOPIC_DESC: Record<string, string> = {
  precio: 'Artículos sobre precios, ofertas, financiación',
  autonomia: 'Artículos sobre autonomía, batería, recarga',
  electrico: 'Artículos sobre eléctricos e híbridos',
  diseño: 'Artículos sobre diseño, interior, carrocería',
  tecnologia: 'Artículos sobre tecnología, software, conectividad',
  fiabilidad: 'Artículos sobre fiabilidad, averías, calidad',
  conduccion: 'Artículos sobre experiencia de conducción, motor',
  ventas: 'Artículos sobre ventas, matriculaciones, mercado',
  lanzamiento: 'Artículos sobre nuevos modelos y presentaciones',
}

export default function TopicosTab({ mediaStats }: Props) {
  const topicData = Object.entries(mediaStats.topicBreakdown)
    .map(([topic, count]) => ({ topic, label: TOPIC_LABELS[topic] ?? topic, count }))
    .sort((a, b) => b.count - a.count)

  const total = topicData.reduce((s, d) => s + d.count, 0) || 1

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Tópicos en artículos BMW (30d)</h3>
          <p className="text-xs text-slate-500 mb-4">Número de artículos que tocan cada tema</p>
          {topicData.some(d => d.count > 0) ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topicData} layout="vertical" barSize={20}>
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis type="category" dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} width={90} />
                <Tooltip formatter={(v: any) => `${v} artículos`} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="count" name="Artículos" radius={[0, 4, 4, 0]}>
                  {topicData.map(d => <Cell key={d.topic} fill={TOPIC_COLORS[d.topic] ?? '#64748b'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-500 text-xs">Sin datos aún</div>
          )}
        </div>

        {/* Cards */}
        <div className="grid grid-cols-2 gap-3 content-start">
          {topicData.map(d => (
            <div key={d.topic} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: TOPIC_COLORS[d.topic] ?? '#64748b' }} />
                <span className="text-xs font-semibold text-white">{d.label}</span>
              </div>
              <p className="text-2xl font-bold text-white">{d.count}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{Math.round(d.count / total * 100)}% del total</p>
              <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">{TOPIC_DESC[d.topic]}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
