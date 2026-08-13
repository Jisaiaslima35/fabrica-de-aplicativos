import { DAYS, WEEKS } from '../domain/catalog'
import type { Reflection } from '../domain/types'

interface Props {
  reflections: Reflection[]
  currentDay: number
  onDayClick: (day: number) => void
}

export default function JourneyPage({ reflections, currentDay, onDayClick }: Props) {
  const completedDays = new Set(reflections.filter(r => r.completed).map(r => r.day))
  const startedDays = new Set(reflections.map(r => r.day))

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ marginBottom: '0.4rem' }}>Sua jornada</h2>
        <p style={{ color: 'var(--ink-soft)', fontSize: '0.9rem' }}>
          Toque em um dia para revisitar ou começar
        </p>
      </div>

      {WEEKS.map(week => {
        const weekDays = DAYS.filter(d => d.week === week.number)
        const weekCompleted = weekDays.filter(d => completedDays.has(d.number)).length
        return (
          <section key={week.number}>
            <div className="week-divider">
              <div className="week-num" aria-hidden="true">{week.number}</div>
              <div className="week-info">
                <div className="week-title">{week.title}</div>
                <div className="week-subtitle">
                  {week.subtitle} · {weekCompleted}/{weekDays.length} dias
                </div>
              </div>
            </div>

            {weekDays.map(day => {
              const completed = completedDays.has(day.number)
              const isCurrent = day.number === currentDay && !completed
              const isLocked = day.number > currentDay && !completed && !startedDays.has(day.number)
              return (
                <div
                  key={day.number}
                  className={`card day-card ${completed ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                  onClick={() => onDayClick(day.number)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onDayClick(day.number) }}
                  aria-label={`Dia ${day.number}: ${day.title}${completed ? ' (concluído)' : isCurrent ? ' (atual)' : ''}`}
                  style={{ opacity: isLocked ? 0.85 : 1 }}
                >
                  <div className="day-num" aria-hidden="true">
                    {completed ? '✓' : day.number}
                  </div>
                  <div className="day-content">
                    <div className="day-title">{day.title}</div>
                    <div className="day-hint">{day.hint}</div>
                    <div className={`day-status ${completed ? 'completed' : isCurrent ? 'current' : ''}`}>
                      {completed
                        ? <>✓ Concluído</>
                        : isCurrent
                          ? <>● Hoje</>
                          : <>○ Próximo</>}
                    </div>
                  </div>
                </div>
              )
            })}
          </section>
        )
      })}
    </div>
  )
}
