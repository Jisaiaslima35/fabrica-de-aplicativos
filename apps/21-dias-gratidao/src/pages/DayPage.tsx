import { useState, useEffect } from 'react'
import { DAYS } from '../domain/catalog'
import { getReflection, saveReflection } from '../domain/db'
import type { Reflection } from '../domain/types'

interface Props {
  day: number
  onBack: () => void
  onSaved: () => void
  onAskProfessor: () => void
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

  useEffect(() => {
    getReflection(day).then(r => {
      if (r) setReflection(r)
    })
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
