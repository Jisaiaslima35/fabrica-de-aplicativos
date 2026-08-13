import { BOOK_TITLE, BOOK_SUBTITLE, BOOK_AUTHOR, DAYS, WEEKS } from '../domain/catalog'

interface Props {
  completedCount: number
  currentDay: number
  onContinue: () => void
  onSeeAll: () => void
}

export default function HomePage({ completedCount, currentDay, onContinue, onSeeAll }: Props) {
  const total = 21
  const percent = Math.round((completedCount / total) * 100)
  const dayInfo = DAYS.find(d => d.number === currentDay)
  const weekInfo = WEEKS.find(w => w.number === dayInfo?.week)
  const isFirst = currentDay === 1 && completedCount === 0
  const greeting = getGreeting()

  return (
    <div className="fade-in">
      <div className="hero">
        <span className="mirror-symbol" aria-hidden="true">🪞</span>
        <h1>{BOOK_TITLE}</h1>
        <p className="subtitle">{BOOK_SUBTITLE}</p>
        <p className="author">{BOOK_AUTHOR}</p>
      </div>

      <div className="card">
        <p style={{ fontSize: '0.8rem', color: 'var(--ink-light)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', fontWeight: 500 }}>
          {greeting}
        </p>
        <h3 style={{ marginBottom: '0.75rem', fontSize: '1.4rem' }}>
          {completedCount === 0
            ? 'Sua jornada começa agora'
            : completedCount === total
              ? 'Você completou a jornada! 🌿'
              : `Você está indo bem`}
        </h3>
        <p style={{ color: 'var(--ink-soft)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          {completedCount} de {total} dias concluídos · {percent}%
        </p>
        <div className="progress-bar" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
          <div className="progress-fill" style={{ width: `${percent}%` }} />
        </div>
      </div>

      {dayInfo && (
        <div className="card card-elevated">
          <p style={{
            fontSize: '0.75rem',
            color: 'var(--rose-dark)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginBottom: '0.35rem',
            fontWeight: 600
          }}>
            {weekInfo?.title} · Seu momento de hoje
          </p>
          <h2 style={{ marginBottom: '0.5rem', fontSize: '1.6rem' }}>
            Dia {dayInfo.number} — {dayInfo.title}
          </h2>
          <p style={{ color: 'var(--ink-soft)', fontSize: '0.95rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
            {dayInfo.hint}
          </p>
          {dayInfo.mirror && (
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              color: 'var(--rose-dark)',
              fontSize: '1.05rem',
              marginBottom: '1.25rem',
              padding: '0.75rem 1rem',
              background: 'rgba(200, 155, 138, 0.08)',
              borderLeft: '3px solid var(--rose-soft)',
              borderRadius: 'var(--radius-sm)'
            }}>
              🪞 {dayInfo.mirror}
            </p>
          )}
          <button className="btn btn-primary btn-block" onClick={onContinue}>
            {isFirst ? 'Começar jornada' : 'Continuar jornada'} →
          </button>
        </div>
      )}

      <button className="btn btn-secondary btn-block" onClick={onSeeAll}>
        Ver mapa dos 21 dias
      </button>

      <div className="card card-quiet" style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--ink-light)', textAlign: 'center', fontStyle: 'italic' }}>
        "O espelho é seu aliado. Olhe para si com amor — todos os dias, um pouco mais."
      </div>
    </div>
  )
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 6)  return 'Boa madrugada'
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}
