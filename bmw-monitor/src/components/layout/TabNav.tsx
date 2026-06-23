'use client'
import { FileText, Newspaper, Bot, BarChart2 } from 'lucide-react'
import type { ActiveTab } from '@/types'

const TABS: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
  { id: 'briefing',      label: 'Briefing',      icon: <FileText className="w-4 h-4" /> },
  { id: 'ai-radar',     label: 'AI Radar',       icon: <Bot className="w-4 h-4" /> },
  { id: 'competidores', label: 'Competidores',   icon: <BarChart2 className="w-4 h-4" /> },
  { id: 'prensa',       label: 'Prensa',         icon: <Newspaper className="w-4 h-4" /> },
]

interface Props { activeTab: ActiveTab; setActiveTab: (t: ActiveTab) => void }

export default function TabNav({ activeTab, setActiveTab }: Props) {
  return (
    <nav className="flex-shrink-0 flex gap-1 px-6 py-2 border-b border-slate-800 bg-slate-950 overflow-x-auto">
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
            activeTab === tab.id
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
