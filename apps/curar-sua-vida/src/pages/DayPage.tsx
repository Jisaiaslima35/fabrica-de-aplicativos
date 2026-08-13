import { useState, useEffect } from 'react'
import { DAYS, WEEKS } from '../domain/catalog'
import { getReflection, saveReflection } from '../domain/db'
import { getDayContent } from '../domain/api'
import type { Reflection } from '../domain/types'

interface Props {
  day: number
  onBack: () => void
  onSaved: () => void
  onAskProfessor: () => void
  onNavigate: (day: number) => void
}

interface DayContent {
  content: string
  pages: number[]
}

export default function DayPage({ day, onBack, onSaved, onAskProfessor, onNavigate }: Props) {
  const dayInfo = DAYS.find(d => d.number === day)
  const weekInfo = WEEKS.find(w => w.number === dayInfo?.week)
  const prevDay = day > 1 ? day - 1 : null
  const nextDay = day < 21 ? day + 1 : null

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
  const [justCompleted, setJustCompleted] = useState(false)

  useEffect(() => {
    getReflection(day).then(r => {
      if (r) setReflection(r)
    })
  }, [day])

  useEffect(() => {
    setContentLoading(true)
    setContent(null)
    setContentExpanded(false)
    setJustCompleted(false)
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

  if (!dayInfo) return null

  const contentText = content?.content?.trim() || ''
  const hasContent = contentText.length > 0
  const pages = content?.pages || []
  const pagesStr = pages.length > 0 ? `📖 Páginas ${pages.map(p => p + 1).join(', ')} do livro` : ''
  const isLong = contentText.length > 600
  const displayedContent = isLong && !contentExpanded
    ? contentText.slice(0, 600) + '...'
    : contentText

  function toggleComplete() {
    const next = !reflection.completed
    setReflection(prev => ({ ...prev, completed: next }))
    if (next) setJustCompleted(true)
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <button className="btn btn-ghost" onClick={onBack} aria-label="Voltar para o mapa">
          ← Voltar
        </button>
        {prevDay && (
          <button className="btn btn-ghost" onClick={() => onNavigate(prevDay)} aria-label="Dia anterior">
            ← Dia {prevDay}
          </button>
        )}
        {nextDay && (
          <button className="btn btn-ghost" onClick={() => onNavigate(nextDay)} aria-label="Próximo dia">
            Dia {nextDay} →
          </button>
        )}
      </div>

      <div className="card">
        <p style={{
          fontSize: '0.72rem',
          color: 'var(--rose-dark)',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          marginBottom: '0.4rem',
          fontWeight: 600
        }}>
          {weekInfo?.title} · Dia {dayInfo.number}
        </p>
        <h2 style={{ marginBottom: '0.5rem', fontSize: '1.6rem', lineHeight: 1.15 }}>
          {dayInfo.title}
        </h2>
        <p style={{ color: 'var(--ink-soft)', fontSize: '0.95rem', lineHeight: 1.6 }}>
          {dayInfo.hint}
        </p>
      </div>

      {/* === PRÁTICA DO ESPELHO (componente especial) === */}
      {dayInfo.mirror && (
        <div className="mirror-card" role="region" aria-label="Prática do espelho">
          <span className="mirror-symbol-large" aria-hidden="true">🪞</span>
          <div className="mirror-title">Seu momento diante do espelho</div>
          <div className="mirror-subtitle">Reserve alguns minutos para olhar para si</div>
          <div className="mirror-instruction">{dayInfo.mirror}</div>
        </div>
      )}

      {/* === LEITURA DO LIVRO === */}
      <div className="day-content-card">
        <h4>
          <span aria-hidden="true">📖</span> Leitura do livro
        </h4>
        {contentLoading ? (
          <p style={{ color: 'var(--ink-soft)', fontStyle: 'italic' }}>
            <span className="loading" style={{ marginRight: '0.5rem' }} /> Carregando texto...
          </p>
        ) : hasContent ? (
          <>
            {pagesStr && (
              <div className="day-content-pages">{pagesStr}</div>
            )}
            <div className="day-content-text" style={{
              maxHeight: contentExpanded ? 'none' : '380px',
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
                  background: 'linear-gradient(to bottom, transparent, #faf2e2)',
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
                  color: 'var(--rose-dark)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '0.6rem 0',
                  marginTop: '0.5rem',
                  fontSize: '0.88rem',
                }}
                aria-label={contentExpanded ? 'Recolher leitura' : 'Ler conteúdo completo'}
              >
                {contentExpanded ? '↑ Recolher leitura' : '↓ Ler conteúdo completo'}
              </button>
            )}
          </>
        ) : (
          <p style={{ color: 'var(--ink-soft)', fontStyle: 'italic' }}>
            Conteúdo desta página em formato de imagem ou não detectado no texto.
            Use o Professor IA abaixo para explorar este dia.
          </p>
        )}
      </div>

      {/* === DIÁRIO / REFLEXÃO === */}
      <div className="card">
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
          <span aria-hidden="true">📝</span> Minha reflexão
        </h4>
        <textarea
          className="reflection-area"
          placeholder="O que eu percebi sobre mim hoje? Escreva livremente..."
          value={reflection.text}
          onChange={(e) => setReflection(prev => ({ ...prev, text: e.target.value }))}
          aria-label="Campo de reflexão pessoal"
        />
        <div className={`reflection-status ${saving ? 'saving' : 'saved'}`}>
          {saving
            ? <><span className="loading" style={{ width: 10, height: 10 }} /> Salvando...</>
            : <>✓ Salvo automaticamente neste dispositivo</>}
        </div>
      </div>

      <button
        className={`btn ${reflection.completed ? 'btn-sage' : 'btn-gold'} btn-block ${justCompleted ? 'celebrate' : ''}`}
        onClick={toggleComplete}
        style={{ marginBottom: '0.75rem' }}
        aria-pressed={reflection.completed}
      >
        {reflection.completed ? '✓ Concluído — reabrir dia' : 'Concluir este dia'}
      </button>

      <button className="btn btn-primary btn-block" onClick={onAskProfessor}>
        🤖 Perguntar ao Professor IA
      </button>
    </div>
  )
}
