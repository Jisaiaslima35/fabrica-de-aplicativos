import { DAYS } from '../domain/catalog'
import type { Reflection } from '../domain/types'

interface Props {
  reflections: Reflection[]
  onDayClick: (day: number) => void
}

export default function JourneyPage({ reflections, onDayClick }: Props) {
  const completedDays = new Set(reflections.filter(r => r.completed).map(r => r.day))
  return (
    <>
      <h2 style={{ marginBottom: '1rem' }}>Sua Jornada</h2>
      {DAYS.map(day => {
        const completed = completedDays.has(day.number)
        return (
          <div
            key={day.number}
            className={`card day-card ${completed ? 'completed' : ''}`}
            style={{ cursor: 'pointer', position: 'relative' }}
            onClick={() => onDayClick(day.number)}
          >
            <div className="day-num">{day.number}</div>
            <div style={{ flex: 1 }}>
              <h4 style={{ marginBottom: '0.25rem' }}>
                {day.title}
              </h4>
              <p style={{ color: 'var(--ink-light)', fontSize: '0.85rem' }}>
                {day.hint}
              </p>
              {completed && <span style={{ fontSize: '0.75rem', color: 'var(--sage)' }}>✓ Concluído</span>}
            </div>
          </div>
        )
      })}
    </>
  )
}
