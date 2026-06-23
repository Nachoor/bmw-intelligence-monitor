'use client'
import type { MediaStats, AIStats } from '@/types'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface Props { mediaStats: MediaStats; aiStats: AIStats }

const BRANDS = ['BMW', 'Audi', 'Mercedes-Benz']
const BRAND_COLORS: Record<string, string> = {
  BMW: '#3b82f6', Audi: '#ef4444', 'Mercedes-Benz': '#94a3b8',
}

const TT = ({ active, payload, label }: any) => active && payload?.length ? (
  <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-xl">
    {label && <p className="text-slate-400 mb-1">{label}</p>}
    {payload.map((p: any) => (
      <p key={p.name} style={{ color: p.fill ?? p.color }} className="font-semibold">
        {p.name}: {p.value}{typeof p.value === 'number' && p.unit ? p.unit : '%'}
      </p>
    ))}
  </div>
) : null

function HeadToHeadRow({ label, values }: { label: string; values: { brand: string; value: string | number; highlight?: boolean }[] }) {
  return (
    <div className="grid grid-cols-4 gap-2 py-3 border-b border-slate-800 last:border-0 items-center">
      <span className="text-xs text-slate-400 col-span-1">{label}</span>
      {values.map(v => (
        <div key={v.brand} className="text-center">
          <span className={`text-sm font-bold ${v.highlight ? '' : 'text-slate-300'}`} style={v.highlight ? { color: BRAND_COLORS[v.brand] } : undefined}>
            {v.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function CompetidoresTab({ mediaStats, aiStats }: Props) {
  const sovMonthData = BRANDS.map(b => ({ brand: b, pct: mediaStats.sovMonth[b] ?? 0 }))
  const sovWeekData  = BRANDS.map(b => ({ brand: b, pct: mediaStats.sovWeek[b] ?? 0 }))

  const aiData = BRANDS.map(b => {
    if (b === 'BMW') return { brand: b, rate: aiStats?.bmwAppearanceRate ?? 0 }
    const wins = (aiStats?.competitorWins ?? []).find(([br]) => br === b)?.[1] ?? 0
    const totalQ = aiStats?.totalQueries ?? 1
    return { brand: b, rate: Math.round(wins / totalQ * 100) }
  })

  const sovMonthLeader = BRANDS.reduce((a, b) => (mediaStats.sovMonth[b] ?? 0) > (mediaStats.sovMonth[a] ?? 0) ? b : a)
  const sovWeekLeader  = BRANDS.reduce((a, b) => (mediaStats.sovWeek[b] ?? 0) > (mediaStats.sovWeek[a] ?? 0) ? b : a)
  const aiLeader = 'BMW'

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Header comparativa */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Comparativa directa — BMW vs Audi vs Mercedes-Benz</h3>
        <div className="grid grid-cols-4 gap-2 pb-2 border-b border-slate-700 mb-1">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">Métrica</span>
          {BRANDS.map(b => (
            <span key={b} className="text-[11px] font-bold text-center" style={{ color: BRAND_COLORS[b] }}>{b}</span>
          ))}
        </div>
        <HeadToHeadRow
          label="SoV en medios (30d)"
          values={BRANDS.map(b => ({ brand: b, value: `${mediaStats.sovMonth[b] ?? 0}%`, highlight: b === sovMonthLeader }))}
        />
        <HeadToHeadRow
          label="SoV en medios (7d)"
          values={BRANDS.map(b => ({ brand: b, value: `${mediaStats.sovWeek[b] ?? 0}%`, highlight: b === sovWeekLeader }))}
        />
        <HeadToHeadRow
          label="Artículos BMW (30d)"
          values={[
            { brand: 'BMW', value: mediaStats.bmwArticles, highlight: true },
            { brand: 'Audi', value: '—' },
            { brand: 'Mercedes-Benz', value: '—' },
          ]}
        />
        {aiStats && (
          <>
            <HeadToHeadRow
              label="Presencia en IA"
              values={BRANDS.map(b => ({
                brand: b,
                value: b === 'BMW' ? `${aiStats.bmwAppearanceRate}%` : `${Math.round(((aiStats.competitorWins.find(([br]) => br === b)?.[1] ?? 0) / aiStats.totalQueries) * 100)}% *`,
                highlight: b === aiLeader,
              }))}
            />
            <HeadToHeadRow
              label="Posición media IA"
              values={[
                { brand: 'BMW', value: aiStats.bmwAvgRank ? `#${aiStats.bmwAvgRank}` : '—', highlight: true },
                { brand: 'Audi', value: '—' },
                { brand: 'Mercedes-Benz', value: '—' },
              ]}
            />
          </>
        )}
        {aiStats && <p className="text-[10px] text-slate-600 mt-2">* % de preguntas donde la IA posiciona al competidor antes que a BMW</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SoV mes */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Share of Voice en Medios (30 días)</h3>
          <p className="text-xs text-slate-500 mb-4">% de artículos que mencionan cada marca</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={sovMonthData} barSize={36}>
              <XAxis dataKey="brand" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={v => `${v}%`} />
              <Tooltip content={<TT />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="pct" name="Share" radius={[4,4,0,0]}>
                {sovMonthData.map(d => <Cell key={d.brand} fill={BRAND_COLORS[d.brand]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* SoV semana */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Share of Voice en Medios (7 días)</h3>
          <p className="text-xs text-slate-500 mb-4">% de artículos que mencionan cada marca esta semana</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={sovWeekData} barSize={36}>
              <XAxis dataKey="brand" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={v => `${v}%`} />
              <Tooltip content={<TT />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="pct" name="Share" radius={[4,4,0,0]}>
                {sovWeekData.map(d => <Cell key={d.brand} fill={BRAND_COLORS[d.brand]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Modelos BMW más mencionados */}
      {mediaStats.topModels.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Modelos BMW más mencionados en prensa (30d)</h3>
          <p className="text-xs text-slate-500 mb-4">Frecuencia de aparición en artículos</p>
          <div className="space-y-2">
            {mediaStats.topModels.map(([model, count]) => {
              const max = mediaStats.topModels[0][1]
              return (
                <div key={model} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">BMW {model}</span>
                    <span className="text-blue-400 font-bold">{count} menciones</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-800">
                    <div className="h-1.5 rounded-full bg-blue-500/70" style={{ width: `${(count / max) * 100}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}
