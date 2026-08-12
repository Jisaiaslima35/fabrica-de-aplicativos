import { useState, useEffect, useRef } from 'react'
import { DAYS } from '../domain/catalog'
import { askProfessor } from '../domain/api'
import { getChatForDay, saveChatMessage } from '../domain/db'
import type { ChatMessage } from '../domain/types'

interface Props {
  day: number
  onBack: () => void
}

export default function ProfessorPage({ day, onBack }: Props) {
  const dayInfo = DAYS.find(d => d.number === day)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getChatForDay(day).then(setMessages)
  }, [day])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    await saveChatMessage(day, userMsg)
    setInput('')
    setLoading(true)
    try {
      const { answer, pages } = await askProfessor(text, day, dayInfo?.title ?? '')
      const aiMsg: ChatMessage = { role: 'assistant', content: answer, pages, timestamp: new Date().toISOString() }
      setMessages(prev => [...prev, aiMsg])
      await saveChatMessage(day, aiMsg)
    } catch (err: any) {
      const errMsg: ChatMessage = {
        role: 'assistant',
        content: `❌ Erro: ${err.message ?? 'Professor indisponível'}. Tente novamente em alguns segundos.`,
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errMsg])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: '1rem' }}>
        ← Voltar
      </button>

      <div className="card">
        <p style={{ fontSize: '0.8rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          🤖 Professor IA
        </p>
        <h3 style={{ marginBottom: '0.25rem' }}>Estudando o Dia {day}</h3>
        <p style={{ color: 'var(--ink-light)', fontSize: '0.9rem' }}>
          {dayInfo?.title}
        </p>
      </div>

      <div
        ref={scrollRef}
        style={{
          maxHeight: 'calc(100vh - 380px)',
          overflowY: 'auto',
          padding: '0.5rem 0',
          marginBottom: '1rem',
        }}
      >
        {messages.length === 0 && (
          <div className="card" style={{ fontSize: '0.9rem', color: 'var(--ink-light)', textAlign: 'center' }}>
            Pergunte qualquer coisa sobre este dia ou sobre o livro.
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.role === 'user' ? 'chat-user' : 'chat-assistant'}`}>
            <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
            {m.pages && m.pages.length > 0 && (
              <div className="chat-citations">📖 Páginas: {m.pages.join(', ')}</div>
            )}
          </div>
        ))}
        {loading && (
          <div className="chat-bubble chat-assistant">
            <em>Professor pensando...</em>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          placeholder="Sua pergunta..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          disabled={loading}
          style={{ flex: 1 }}
        />
        <button className="btn btn-primary" onClick={send} disabled={loading || !input.trim()}>
          Enviar
        </button>
      </div>
    </>
  )
}
