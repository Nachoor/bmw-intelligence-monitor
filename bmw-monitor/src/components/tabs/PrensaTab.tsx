'use client'
import { ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { Article } from '@/types'

interface Props { articles: Article[] }

const SENTIMENT_STYLES = {
  positive: { badge: 'bg-green-500/10 text-green-400 border-green-500/20', icon: <TrendingUp className="w-3 h-3" /> },
  neutral:  { badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20',  icon: <Minus className="w-3 h-3" /> },
  negative: { badge: 'bg-red-500/10 text-red-400 border-red-500/20',        icon: <TrendingDown className="w-3 h-3" /> },
}

const BRAND_COLORS: Record<string, string> = {
  BMW: 'text-blue-400', Audi: 'text-red-400', 'Mercedes-Benz': 'text-slate-300',
  Tesla: 'text-green-400', Porsche: 'text-amber-400',
}

const TOPIC_LABELS: Record<string, string> = {
  precio: 'Precio', autonomia: 'Autonomía', electrico: 'Eléctrico',
  diseño: 'Diseño', tecnologia: 'Tecnología', fiabilidad: 'Fiabilidad',
  conduccion: 'Conducción', ventas: 'Ventas', lanzamiento: 'Lanzamiento',
}

export default function PrensaTab({ articles }: Props) {
  if (!articles.length) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
        No hay artículos recientes. El pipeline los generará en la próxima ejecución.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{articles.length} artículos recientes</p>
      </div>
      {articles.map(a => {
        const s = SENTIMENT_STYLES[a.sentiment]
        return (
          <div key={a.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">{a.source}</span>
                  <span className="text-[10px] text-slate-600">·</span>
                  <span className="text-[10px] text-slate-600">{a.publishedAt.split('T')[0]}</span>
                  <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.badge}`}>
                    {s.icon} {a.sentiment}
                  </span>
                  {a.brands.map(b => (
                    <span key={b} className={`text-[10px] font-bold ${BRAND_COLORS[b] ?? 'text-slate-400'}`}>{b}</span>
                  ))}
                </div>
                <a href={a.url} target="_blank" rel="noopener noreferrer"
                  className="text-sm font-semibold text-white hover:text-blue-400 transition-colors line-clamp-2">
                  {a.title}
                </a>
                {a.description && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{a.description}</p>
                )}
                {a.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {a.topics.map(t => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        {TOPIC_LABELS[t] ?? t}
                      </span>
                    ))}
                    {a.models.map(m => (
                      <span key={m} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {m}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <a href={a.url} target="_blank" rel="noopener noreferrer"
                className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>
          </div>
        )
      })}
    </div>
  )
}
