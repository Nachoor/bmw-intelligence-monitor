'use client'
import { CheckCircle, AlertTriangle, XCircle, Info, TrendingUp, TrendingDown, Minus, Newspaper, Bot, Eye, Star } from 'lucide-react'
import type { Briefing, MediaStats, AIStats } from '@/types'

interface Props { briefing: Briefing; mediaStats: MediaStats; aiStats: AIStats }

const ALERT_STYLES = {
  success: { border: 'border-green-500/30', bg: 'bg-green-500/5', icon: <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />, badge: 'text-green-400' },
  warning: { border: 'border-amber-500/30', bg: 'bg-amber-500/5', icon: <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />, badge: 'text-amber-400' },
  alert:   { border: 'border-red-500/30',   bg: 'bg-red-500/5',   icon: <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />,     badge: 'text-red-400' },
  info:    { border: 'border-blue-500/30',  bg: 'bg-blue-500/5',  icon: <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />,        badge: 'text-blue-400' },
}

const BRAND_COLORS: Record<string, string> = {
  BMW: '#3b82f6', Audi: '#ef4444', 'Mercedes-Benz': '#94a3b8',
}

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
        <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-slate-400'}`}>
          {trend > 0 ? <TrendingUp className="w-3 h-3" /> : trend < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
          {trend > 0 ? '+' : ''}{trend}% vs semana anterior
        </div>
      )}
    </div>
  )
}

function SovBar({ brand, pct }: { brand: string; pct: number }) {
  const color = BRAND_COLORS[brand] ?? '#64748b'
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold" style={{ color }}>{brand}</span>
        <span className="text-white font-bold">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-800">
        <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

export default function BriefingTab({ briefing, mediaStats, aiStats }: Props) {
  const trend = mediaStats.trendVsLastWeek
  const normalizedTrend = Math.abs(trend) > 200 ? undefined : trend

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Artículos BMW (30d)"
          value={mediaStats.bmwArticles}
          sub={`de ${mediaStats.totalArticles} totales en medios`}
          icon={<Newspaper className="w-4 h-4" />}
          trend={normalizedTrend}
        />
        <KpiCard
          label="Share of Voice BMW"
          value={`${mediaStats.sovMonth['BMW'] ?? 0}%`}
          sub="en medios del motor (mes)"
          icon={<Eye className="w-4 h-4" />}
        />
        <KpiCard
          label="Presencia en IA"
          value={`${aiStats?.bmwAppearanceRate ?? 0}%`}
          sub="de preguntas donde la IA menciona BMW"
          icon={<Bot className="w-4 h-4" />}
        />
        <KpiCard
          label="Posición IA"
          value={aiStats?.bmwAvgRank ? `#${aiStats.bmwAvgRank}` : 'N/A'}
          sub="posición media en recomendaciones"
          icon={<Star className="w-4 h-4" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resumen ejecutivo */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Resumen ejecutivo</h3>
            <span className="text-xs text-slate-500 ml-auto">Generado hoy</span>
          </div>
          <ul className="space-y-3">
            {briefing.insights.map((insight, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-300 leading-relaxed">
                <span className="text-blue-400 font-bold flex-shrink-0">{i + 1}.</span>
                {insight}
              </li>
            ))}
          </ul>
        </div>

        {/* Share of Voice visual */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Share of Voice en Medios</h3>
          <p className="text-xs text-slate-500 mb-5">% de artículos que mencionan cada marca (últimos 30 días)</p>
          <div className="space-y-4">
            {Object.entries(mediaStats.sovMonth)
              .sort((a, b) => b[1] - a[1])
              .map(([brand, pct]) => <SovBar key={brand} brand={brand} pct={pct} />)}
          </div>
          <div className="mt-5 pt-4 border-t border-slate-800">
            <p className="text-xs text-slate-500 mb-3">Esta semana</p>
            <div className="space-y-3">
              {Object.entries(mediaStats.sovWeek)
                .sort((a, b) => b[1] - a[1])
                .map(([brand, pct]) => <SovBar key={brand} brand={brand} pct={pct} />)}
            </div>
          </div>
        </div>
      </div>

      {/* Alertas accionables */}
      {briefing.alerts.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">Alertas & Recomendaciones</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {briefing.alerts.map((alert, i) => {
              const s = ALERT_STYLES[alert.type]
              return (
                <div key={i} className={`rounded-xl border p-4 ${s.border} ${s.bg}`}>
                  <div className="flex gap-3">
                    {s.icon}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold mb-1 ${s.badge}`}>{alert.title}</p>
                      <p className="text-xs text-slate-400 mb-2 leading-relaxed">{alert.body}</p>
                      <p className="text-xs text-slate-500">
                        <span className="font-semibold text-slate-400">Acción → </span>
                        {alert.action}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Temas en prensa */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-1">Temas más comentados sobre BMW este mes</h3>
        <p className="text-xs text-slate-500 mb-4">Basado en {mediaStats.bmwArticles} artículos</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(mediaStats.topicBreakdown)
            .filter(([, v]) => v > 0)
            .sort((a, b) => b[1] - a[1])
            .map(([topic, count]) => {
              const labels: Record<string, string> = { precio: 'Precio', autonomia: 'Autonomía', electrico: 'Eléctrico', diseño: 'Diseño', tecnologia: 'Tecnología', fiabilidad: 'Fiabilidad', conduccion: 'Conducción', ventas: 'Ventas', lanzamiento: 'Lanzamiento' }
              const heat = count > 20 ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : count > 10 ? 'bg-slate-700 text-slate-200 border-slate-600' : 'bg-slate-800 text-slate-400 border-slate-700'
              return (
                <span key={topic} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${heat}`}>
                  {labels[topic] ?? topic}
                  <span className="font-bold opacity-70">{count}</span>
                </span>
              )
            })}
        </div>
      </div>

    </div>
  )
}
