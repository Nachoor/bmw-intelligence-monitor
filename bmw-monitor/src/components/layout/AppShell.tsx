'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import Header from './Header'
import TabNav from './TabNav'
import { useMonitorData } from '@/hooks/useMonitorData'
import { Loader2 } from 'lucide-react'
import type { ActiveTab } from '@/types'

const OverviewTab  = dynamic(() => import('@/components/tabs/OverviewTab'))
const PrensaTab    = dynamic(() => import('@/components/tabs/PrensaTab'))
const ModelosTab   = dynamic(() => import('@/components/tabs/ModelosTab'))
const TopicosTab   = dynamic(() => import('@/components/tabs/TopicosTab'))
const AIRadarTab   = dynamic(() => import('@/components/tabs/AIRadarTab'))

export default function AppShell() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview')
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
            {activeTab === 'overview'   && <OverviewTab  mediaStats={data.mediaStats} aiStats={data.aiStats} />}
            {activeTab === 'prensa'     && <PrensaTab    articles={data.recentArticles} />}
            {activeTab === 'modelos'    && <ModelosTab   mediaStats={data.mediaStats} aiStats={data.aiStats} />}
            {activeTab === 'topicos'    && <TopicosTab   mediaStats={data.mediaStats} />}
            {activeTab === 'ai-radar'   && <AIRadarTab   aiStats={data.aiStats} recentQueries={data.recentQueries} />}
          </div>
        )}
      </main>
    </div>
  )
}
