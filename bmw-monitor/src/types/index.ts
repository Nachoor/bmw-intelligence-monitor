export type Brand = 'BMW' | 'Audi' | 'Mercedes-Benz' | 'Tesla' | 'Porsche' | 'Volvo' | 'Lexus'
export type Sentiment = 'positive' | 'neutral' | 'negative'
export type LLM = 'groq' | 'gemini'

export interface Article {
  id: string
  title: string
  description: string
  url: string
  source: string
  publishedAt: string
  brands: Brand[]
  models: string[]
  topics: string[]
  sentiment: Sentiment
}

export interface BrandMention {
  brand: Brand
  rank: number
  positiveAttributes: string[]
  negativeAttributes: string[]
}

export interface AIQueryResult {
  id: string
  date: string
  question: string
  category: string
  llm: LLM
  response: string
  brandMentions: BrandMention[]
  bmwFound: boolean
  bmwRank: number | null
  bmwPositiveAttrs: string[]
  bmwNegativeAttrs: string[]
  bmwModels: string[]
}

export interface MediaStats {
  totalArticles: number
  bmwArticles: number
  sovWeek: Record<string, number>
  sovMonth: Record<string, number>
  topicBreakdown: Record<string, number>
  sentimentBreakdown: { positive: number; neutral: number; negative: number }
  topModels: [string, number][]
  trendVsLastWeek: number
}

export interface AIStats {
  totalQueries: number
  bmwAppearanceRate: number
  bmwAvgRank: number | null
  byCategory: Record<string, { total: number; found: number; rate: number; avgRank: number | null }>
  positiveAttributes: [string, number][]
  negativeAttributes: [string, number][]
  competitorWins: [string, number][]
  topModels: [string, number][]
  byLLM: Record<string, { total: number; rate: number }>
}

export interface MonitorData {
  generatedAt: string
  mediaStats: MediaStats
  aiStats: AIStats
  recentArticles: Article[]
  recentQueries: AIQueryResult[]
}

export type ActiveTab = 'overview' | 'prensa' | 'modelos' | 'topicos' | 'ai-radar' | 'tendencias'
