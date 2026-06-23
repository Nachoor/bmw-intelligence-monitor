'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import type { MediaStats, AIStats } from '@/types'
import { Newspaper, Bot, TrendingUp, TrendingDown, Eye, Star } from 'lucide-react'

interface Props { mediaStats: MediaStats; aiStats: AIStats }

const BRAND_COLORS: Record<string, string> = {
  BMW: '#3b82f6', Audi: '#ef4444', 'Mercedes-Benz': '#94a3b8',
}

const SENTIMENT_COLORS = { positive: '#10b981', neutral: '#64748b', negative: '#ef4444' }

const TT = ({ active, payload, label }: any) => active && payload?.length ? (
  <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-xl">
    {label && <p className="text-slate-400 mb-1">{label}</p>}
    {payload.map((p: any) => (
      <p key={p.name} style={{ color: p.color || p.fill }} className="font-semibold">
        {p.name}: {typeof p.value === 'number' ? `${p.value}%` : p.value}
      </p>
    ))}
  </div>
) : null

function KpiCard({ label, value, sub, icon, trend }: {
  label: string; value: string | number; sub?: string; icon: React.ReactNode; trend?: number
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-blue-400">{icon}</div>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trend >= 0 ? '+' : ''}{trend}% vs semana anterior
        </div>
      )}
    </div>
  )
}

export default function OverviewTab({ mediaStats, aiStats }: Props) {
  const sovData = Object.entries(mediaStats.sovMonth)
    .map(([brand, pct]) => ({ brand, pct }))
    .sort((a, b) => b.pct - a.pct)

  const sentimentData = [
    { name: 'Positivo', value: mediaStats.sentimentBreakdown.positive, fill: SENTIMENT_COLORS.positive },
    { name: 'Neutro',   value: mediaStats.sentimentBreakdown.neutral,  fill: SENTIMENT_COLORS.neutral },
    { name: 'Negativo', value: mediaStats.sentimentBreakdown.negative, fill: SENTIMENT_COLORS.negative },
  ].filter(d => d.value > 0)

  const aiCatData = Object.entries(aiStats.byCategory || {})
    .map(([cat, s]) => ({ cat: cat.replace('_', ' '), rate: s.rate }))
    .sort((a, b) => b.rate - a.rate)

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Artículos BMW (30d)"
          value={mediaStats.bmwArticles}
          sub={`de ${mediaStats.totalArticles} totales`}
          icon={<Newspaper className="w-4 h-4" />}
          trend={mediaStats.trendVsLastWeek}
        />
        <KpiCard
          label="Share of Voice BMW"
          value={`${mediaStats.sovMonth['BMW'] ?? 0}%`}
          sub="en medios del motor (30d)"
          icon={<Eye className="w-4 h-4" />}
        />
        <KpiCard
          label="Presencia en IA"
          value={`${aiStats.bmwAppearanceRate ?? 0}%`}
          sub="de queries donde aparece BMW"
          icon={<Bot className="w-4 h-4" />}
        />
        <KpiCard
          label="Posición media IA"
          value={aiStats.bmwAvgRank ? `#${aiStats.bmwAvgRank}` : 'N/A'}
          sub="cuando la IA recomienda BMW"
          icon={<Star className="w-4 h-4" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Share of Voice en medios */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Share of Voice en Medios (30d)</h3>
          <p className="text-xs text-slate-500 mb-4">% de artículos que mencionan cada marca</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sovData} layout="vertical" barSize={20}>
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={v => `${v}%`} />
              <YAxis type="category" dataKey="brand" tick={{ fill: '#94a3b8', fontSize: 11 }} width={90} />
              <Tooltip content={<TT />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="pct" name="Share">
                {sovData.map(d => <Cell key={d.brand} fill={BRAND_COLORS[d.brand] ?? '#64748b'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sentimiento BMW */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Sentimiento en Prensa (BMW, 30d)</h3>
          <p className="text-xs text-slate-500 mb-4">Tono de los artículos que mencionan BMW</p>
          <div className="flex items-center gap-8">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie data={sentimentData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3}>
                  {sentimentData.map(d => <Cell key={d.name} fill={d.fill} />)}
                </Pie>
                <Tooltip formatter={(v: any) => `${v} artículos`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {sentimentData.map(d => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: d.fill }} />
                  <span className="text-xs text-slate-300">{d.name}</span>
                  <span className="text-xs font-bold text-white ml-auto">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Radar por categoría */}
      {aiCatData.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Presencia BMW en IA por tipo de pregunta</h3>
          <p className="text-xs text-slate-500 mb-4">% de veces que la IA menciona BMW según el tema de la pregunta</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={aiCatData} barSize={28}>
              <XAxis dataKey="cat" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={v => `${v}%`} />
              <Tooltip content={<TT />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="rate" name="Aparición" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
