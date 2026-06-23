'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import Header from './Header'
import TabNav from './TabNav'
import { useMonitorData } from '@/hooks/useMonitorData'
import { Loader2 } from 'lucide-react'
import type { ActiveTab } from '@/types'

const BriefingTab     = dynamic(() => import('@/components/tabs/BriefingTab'))
const PrensaTab       = dynamic(() => import('@/components/tabs/PrensaTab'))
const AIRadarTab      = dynamic(() => import('@/components/tabs/AIRadarTab'))
const CompetidoresTab = dynamic(() => import('@/components/tabs/CompetidoresTab'))

export default function AppShell() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('briefing')
  const { data, loading, error } = useMonitorData()

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white overflow-hidden">
      <Header generatedAt={data?.generatedAt ?? null} />
      <TabNav activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
            <p className="text-slate-400 text-sm">Cargando datos...</p>
          </div>
        )}
        {error && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-500">
            <p className="text-sm">No hay datos disponibles aún.</p>
            <p className="text-xs">Ejecuta el pipeline para generar <code className="bg-slate-800 px-1 rounded">monitor_data.json</code></p>
          </div>
        )}
        {data && (
          <div className="p-6" key={activeTab}>
            {activeTab === 'briefing'      && <BriefingTab     briefing={data.briefing} mediaStats={data.mediaStats} aiStats={data.aiStats} />}
            {activeTab === 'ai-radar'      && <AIRadarTab      aiStats={data.aiStats} recentQueries={data.recentQueries} />}
            {activeTab === 'competidores'  && <CompetidoresTab mediaStats={data.mediaStats} aiStats={data.aiStats} />}
            {activeTab === 'prensa'        && <PrensaTab       articles={data.recentArticles} />}
          </div>
        )}
      </main>
    </div>
  )
}
