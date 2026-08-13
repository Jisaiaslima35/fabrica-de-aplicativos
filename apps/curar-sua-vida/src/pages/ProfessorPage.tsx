import { useState, useEffect, useRef } from 'react'
import { DAYS } from '../domain/catalog'
import { askProfessor, getDayContent } from '../domain/api'
import { getChatForDay, saveChatMessage, getPref, setPref } from '../domain/db'
import { useTTS } from '../hooks/useTTS'
import type { ChatMessage } from '../domain/types'

interface Props {
  day: number
  onBack: () => void
}

const PREF_MUTED = 'tts-muted'

export default function ProfessorPage({ day, onBack }: Props) {
  const dayInfo = DAYS.find(d => d.number === day)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dayContent, setDayContent] = useState<string>('')
  const [ttsEnabled, setTtsEnabled] = useState(true)
  const [activeSpeechId, setActiveSpeechId] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const tts = useTTS()

  // Carrega pref de mute
  useEffect(() => {
    getPref<boolean>(PREF_MUTED).then(v => {
      if (v !== null) {
        tts.setMuted(v)
      }
    })
  }, [])

  useEffect(() => {
    getChatForDay(day).then(setMessages)
    getDayContent(day)
      .then(c => setDayContent(c.content || ''))
      .catch(() => setDayContent(''))
  }, [day])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  // Cancela fala ao sair da página
  useEffect(() => {
    return () => {
      tts.cancel()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Quando fala termina, limpa o active
  useEffect(() => {
    if (!tts.isSpeaking && activeSpeechId !== null) {
      setActiveSpeechId(null)
    }
  }, [tts.isSpeaking, activeSpeechId])

  function handleMuteToggle() {
    tts.toggleMute()
    setPref(PREF_MUTED, !tts.isMuted)
  }

  function speakMessage(idx: number, text: string) {
    if (activeSpeechId === idx) {
      // já tá falando esse — para
      tts.cancel()
      setActiveSpeechId(null)
    } else {
      // inicia fala (cancela qualquer anterior automaticamente)
      tts.speak(text)
      setActiveSpeechId(idx)
    }
  }

  async function send() {
    const text = input.trim()
    if (!text || loading) return

    // SEMPRE cancela fala ao enviar nova pergunta
    tts.cancel()
    setActiveSpeechId(null)

    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])
    await saveChatMessage(day, userMsg)
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const { answer, pages } = await askProfessor(text, day, dayInfo?.title ?? '', dayContent)
      const aiMsg: ChatMessage = {
        role: 'assistant',
        content: answer,
        pages,
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, aiMsg])
      await saveChatMessage(day, aiMsg)

      // Fala automaticamente a resposta (se TTS ligado)
      if (ttsEnabled && !tts.isMuted && tts.isSupported) {
        // pequeno delay pra UI atualizar primeiro
        setTimeout(() => {
          tts.speak(answer)
          setActiveSpeechId(messages.length + 1) // índice do aiMsg
        }, 250)
      }
    } catch (err: any) {
      setError('O Professor está meditando agora. Tente novamente em alguns segundos.')
      console.error('Professor error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fade-in">
      <button className="btn btn-ghost" onClick={onBack} style={{ marginBottom: '0.75rem' }} aria-label="Voltar para o dia">
        ← Voltar
      </button>

      <div className="card">
        <p style={{
          fontSize: '0.75rem',
          color: 'var(--rose-dark)',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          marginBottom: '0.3rem',
          fontWeight: 600
        }}>
          🤖 Professor IA
        </p>
        <h3 style={{ marginBottom: '0.25rem', fontSize: '1.3rem' }}>
          Estudando o Dia {day}
        </h3>
        <p style={{ color: 'var(--ink-soft)', fontSize: '0.9rem' }}>
          {dayInfo?.title}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        <button
          className={`tts-btn ${ttsEnabled ? 'active' : ''}`}
          onClick={() => setTtsEnabled(v => !v)}
          aria-pressed={ttsEnabled}
          title={ttsEnabled ? 'Voz ligada — Professor fala as respostas' : 'Voz desligada'}
        >
          {ttsEnabled ? '🔊' : '🔇'} Voz {ttsEnabled ? 'ligada' : 'desligada'}
        </button>
        {tts.isSupported && (
          <span style={{ fontSize: '0.75rem', color: 'var(--ink-light)', alignSelf: 'center' }}>
            {tts.hasVoice ? '· voz pt-BR detectada' : '· usando voz padrão do navegador'}
          </span>
        )}
      </div>

      <div
        ref={scrollRef}
        style={{
          maxHeight: 'calc(100vh - 420px)',
          minHeight: '200px',
          overflowY: 'auto',
          padding: '0.5rem 0',
          marginBottom: '1rem',
        }}
      >
        {messages.length === 0 && !loading && (
          <div className="card" style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', textAlign: 'center', fontStyle: 'italic' }}>
            Pergunte qualquer coisa sobre este dia ou sobre o trabalho com o espelho.
            <br /><br />
            <em style={{ fontSize: '0.85rem', color: 'var(--ink-light)' }}>
              "Não entendi esse exercício."<br />
              "Como faço a prática do espelho?"<br />
              "Pode me explicar de outro jeito?"
            </em>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.role === 'user' ? 'chat-user' : 'chat-assistant'}`}>
            <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
            {m.role === 'assistant' && m.pages && m.pages.length > 0 && (
              <div className="chat-citations">
                📖 Páginas consultadas: {m.pages.join(', ')}
              </div>
            )}
            {m.role === 'assistant' && tts.isSupported && (
              <div className="tts-controls">
                <button
                  className={`tts-btn ${activeSpeechId === i ? 'active' : ''}`}
                  onClick={() => speakMessage(i, m.content)}
                  aria-label={activeSpeechId === i ? 'Parar fala' : 'Ouvir resposta'}
                >
                  {activeSpeechId === i && tts.isSpeaking ? '⏸ Parar' : '🔊 Ouvir'}
                </button>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="chat-thinking">
            Professor pensando...
          </div>
        )}
        {error && (
          <div className="card" style={{ background: 'rgba(200, 155, 138, 0.12)', borderColor: 'var(--rose-soft)', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
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
          aria-label="Pergunta para o Professor IA"
          style={{ flex: 1, minHeight: 48 }}
        />
        <button
          className="btn btn-primary"
          onClick={send}
          disabled={loading || !input.trim()}
          aria-label="Enviar pergunta"
        >
          Enviar
        </button>
      </div>
    </div>
  )
}
