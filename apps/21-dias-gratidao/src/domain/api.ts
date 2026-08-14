import type { ChatMessage } from './types'

// API oficial do Professor IA na VPS (Fábrica de Aplicativos).
// Pode ser sobrescrita por VITE_API_URL no painel do Lovable.
const API_BASE = (import.meta.env.VITE_API_URL ?? 'https://preview.automacaojs.us/21-dias-gratidao/api').replace(/\/$/, '')

export async function askProfessor(
  question: string,
  day: number,
  dayTitle: string,
  dayContent?: string,         // texto da página pra dar contexto pro Professor
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

export type { ChatMessage }
