'use client'
import { Activity, RefreshCw } from 'lucide-react'

interface Props { generatedAt: string | null }

export default function Header({ generatedAt }: Props) {
  return (
    <header className="flex-shrink-0 flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-950">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
          <Activity className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white">BMW Intelligence Monitor</h1>
          <p className="text-[10px] text-slate-500">Presencia en medios e IA · España</p>
        </div>
      </div>
      {generatedAt && (
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <RefreshCw className="w-3 h-3" />
          Actualizado: {generatedAt}
        </div>
      )}
    </header>
  )
}
