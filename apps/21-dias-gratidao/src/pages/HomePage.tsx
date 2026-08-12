import { BOOK_TITLE, BOOK_AUTHOR, DAYS } from '../domain/catalog'

interface Props {
  completedCount: number
  currentDay: number
  onContinue: () => void
  onSeeAll: () => void
}

export default function HomePage({ completedCount, currentDay, onContinue, onSeeAll }: Props) {
  const percent = Math.round((completedCount / 21) * 100)
  const dayInfo = DAYS.find(d => d.number === currentDay)
  return (
    <>
      <div className="hero">
        <h1>21 Dias de Gratidão</h1>
        <p>Uma jornada de 21 dias para desenvolver o hábito da gratidão.</p>
      </div>

      <div className="card">
        <h3>Seu progresso</h3>
        <p style={{ color: 'var(--ink-light)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
          {completedCount} de 21 dias concluídos ({percent}%)
        </p>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${percent}%` }} />
        </div>
      </div>

      {dayInfo && (
        <div className="card">
          <p style={{ fontSize: '0.8rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.25rem' }}>
            Dia {currentDay}
          </p>
          <h3 style={{ marginBottom: '0.5rem' }}>{dayInfo.title}</h3>
          <p style={{ color: 'var(--ink-light)', fontSize: '0.95rem', marginBottom: '1rem' }}>
            {dayInfo.hint}
          </p>
          <button className="btn btn-primary btn-block" onClick={onContinue}>
            Continuar jornada →
          </button>
        </div>
      )}

      <button className="btn btn-secondary btn-block" onClick={onSeeAll}>
        Ver os 21 dias
      </button>

      <div className="card" style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--ink-light)', textAlign: 'center' }}>
        Baseado em <em>{BOOK_TITLE}</em> de {BOOK_AUTHOR}
      </div>
    </>
  )
}
