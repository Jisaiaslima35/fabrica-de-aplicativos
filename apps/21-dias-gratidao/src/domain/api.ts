import type { ChatMessage } from './types'

const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

export async function askProfessor(
  question: string,
  day: number,
  dayTitle: string,
): Promise<{ answer: string; pages: number[] }> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, day, day_title: dayTitle }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Professor indisponível: ${res.status} ${err}`)
  }
  return res.json()
}

export type { ChatMessage }
