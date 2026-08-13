import type { ChatMessage } from './types'

// Path API: prefixo da rota no nginx (/curar-sua-vida/api)
const API_BASE = (import.meta.env.VITE_API_URL ?? '/curar-sua-vida/api').replace(/\/$/, '')

export async function askProfessor(
  question: string,
  day: number,
  dayTitle: string,
  dayContent?: string,
): Promise<{ answer: string; pages: number[] }> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question,
      day,
      day_title: dayTitle,
      day_content: dayContent ?? '',
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Professor indisponível: ${res.status} ${err}`)
  }
  return res.json()
}

export async function getDayContent(day: number): Promise<{ content: string; pages: number[] }> {
  const res = await fetch(`${API_BASE}/content/${day}`)
  if (!res.ok) {
    throw new Error(`Conteúdo indisponível: ${res.status}`)
  }
  return res.json()
}

export async function health(): Promise<{ ok: boolean; service: string; book: string }> {
  const res = await fetch(`${API_BASE}/health`)
  if (!res.ok) throw new Error('API down')
  return res.json()
}

export type { ChatMessage }
