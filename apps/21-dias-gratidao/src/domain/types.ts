export interface Day {
  number: number
  title: string
  hint: string
}

export interface Reflection {
  day: number
  text: string
  completed: boolean
  updatedAt: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  pages?: number[]
  timestamp: string
}

export interface Progress {
  totalDays: number
  completedDays: number
  currentDay: number
  percent: number
}
