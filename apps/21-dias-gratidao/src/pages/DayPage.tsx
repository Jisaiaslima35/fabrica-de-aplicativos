import { useState, useEffect } from 'react'
import { DAYS } from '../domain/catalog'
import { getReflection, saveReflection } from '../domain/db'
import { getDayContent } from '../domain/api'
import type { Reflection } from '../domain/types'

interface Props {
  day: number
  onBack: () => void
  onSaved: () => void
  onAskProfessor: () => void
}

interface DayContent {
  content: string
  pages: number[]
}

export default function DayPage({ day, onBack, onSaved, onAskProfessor }: Props) {
  const dayInfo = DAYS.find(d => d.number === day)!
  const [reflection, setReflection] = useState<Reflection>({
    day,
    text: '',
    completed: false,
    updatedAt: new Date().toISOString(),
  })
  const [saving, setSaving] = useState(false)
  const [content, setContent] = useState<DayContent | null>(null)
  const [contentLoading, setContentLoading] = useState(true)
  const [contentExpanded, setContentExpanded] = useState(false)

  useEffect(() => {
    getReflection(day).then(r => {
      if (r) setReflection(r)
    })
  }, [day])

  useEffect(() => {
    setContentLoading(true)
    setContent(null)
    setContentExpanded(false)
    getDayContent(day)
      .then(c => setContent(c))
      .catch(() => setContent({ content: '', pages: [] }))
      .finally(() => setContentLoading(false))
  }, [day])

  // autosave debounced
  useEffect(() => {
    if (!reflection.text && !reflection.completed) return
    const t = setTimeout(async () => {
      setSaving(true)
      await saveReflection(reflection)
      setSaving(false)
      onSaved()
    }, 800)
    return () => clearTimeout(t)
  }, [reflection.text, reflection.completed])

  const contentText = content?.content?.trim() || ''
  const hasContent = contentText.length > 0
  const pages = content?.pages || []
  const pagesStr = pages.length > 0 ? `📖 Páginas ${pages.map(p => p + 1).join(', ')} do livro` : ''
  const isLong = contentText.length > 600
  const displayedContent = isLong && !contentExpanded
    ? contentText.slice(0, 600) + '...'
    : contentText

  return (
    <>
      <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: '1rem' }}>
        ← Voltar
      </button>

      <div className="card">
        <p style={{ fontSize: '0.8rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Dia {dayInfo.number}
        </p>
        <h2 style={{ marginBottom: '0.5rem' }}>{dayInfo.title}</h2>
        <p style={{ color: 'var(--ink-light)', marginBottom: '1.5rem' }}>
          {dayInfo.hint}
        </p>
      </div>

      {/* === BLOCO DE LEITURA DO LIVRO === */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #fef9e8 0%, #f7f3ea 100%)', borderLeft: '4px solid var(--gold)' }}>
        <h4 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          📖 Leitura do livro
        </h4>

        {contentLoading ? (
          <p style={{ color: 'var(--ink-light)', fontStyle: 'italic' }}>Carregando texto...</p>
        ) : hasContent ? (
          <>
            {pagesStr && (
              <p style={{ fontSize: '0.7rem', color: 'var(--gold-dark)', marginBottom: '0.5rem', fontWeight: 600 }}>
                {pagesStr}
              </p>
            )}
            <div style={{
              fontFamily: 'Georgia, serif',
              fontSize: '0.95rem',
              lineHeight: '1.7',
              color: 'var(--ink)',
              whiteSpace: 'pre-wrap',
              maxHeight: contentExpanded ? 'none' : '400px',
              overflow: 'hidden',
              position: 'relative',
            }}>
              {displayedContent}
              {isLong && !contentExpanded && (
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '60px',
                  background: 'linear-gradient(to bottom, transparent, #f7f3ea)',
                  pointerEvents: 'none',
                }} />
              )}
            </div>
            {isLong && (
              <button
                onClick={() => setContentExpanded(!contentExpanded)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--sage-dark)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '0.5rem 0',
                  marginTop: '0.5rem',
                  fontSize: '0.9rem',
                }}
              >
                {contentExpanded ? '↑ Recolher leitura' : '↓ Ler conteúdo completo'}
              </button>
            )}
          </>
        ) : (
          <p style={{ color: 'var(--ink-light)', fontStyle: 'italic' }}>
            Conteúdo desta página em formato de imagem ou não detectado no texto.
            Talvez o exercício desta seção seja mais visual — use o Professor IA abaixo pra ajudar.
          </p>
        )}
      </div>

      <div className="card">
        <h4 style={{ marginBottom: '0.5rem' }}>📝 Minha reflexão</h4>
        <textarea
          className="reflection-area"
          placeholder="Escreva livremente o que este exercício trouxe à sua mente..."
          value={reflection.text}
          onChange={(e) => setReflection(prev => ({ ...prev, text: e.target.value }))}
        />
        <p style={{ fontSize: '0.75rem', color: 'var(--ink-light)', marginTop: '0.5rem' }}>
          {saving ? '💾 Salvando...' : '✓ Salvo automaticamente'}
        </p>
      </div>

      <button
        className={`btn ${reflection.completed ? 'btn-secondary' : 'btn-gold'} btn-block`}
        onClick={() => setReflection(prev => ({ ...prev, completed: !prev.completed }))}
        style={{ marginBottom: '0.75rem' }}
      >
        {reflection.completed ? '✓ Concluído — reabrir' : 'Concluir este dia'}
      </button>

      <button className="btn btn-primary btn-block" onClick={onAskProfessor}>
        🤖 Perguntar ao Professor IA
      </button>
    </>
  )
}
