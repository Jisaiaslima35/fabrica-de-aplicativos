interface Props {
  onClear: () => void
}

export default function SettingsPage({ onClear }: Props) {
  return (
    <>
      <h2 style={{ marginBottom: '1rem' }}>Ajustes</h2>

      <div className="card">
        <h4 style={{ marginBottom: '0.5rem' }}>🔒 Privacidade</h4>
        <p style={{ fontSize: '0.9rem', color: 'var(--ink-light)' }}>
          Suas reflexões são armazenadas apenas neste dispositivo. Não enviamos nada para servidores.
        </p>
      </div>

      <div className="card">
        <h4 style={{ marginBottom: '0.5rem' }}>🗑️ Apagar reflexões</h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--ink-light)', marginBottom: '1rem' }}>
          Remove TODAS as suas reflexões e marca todos os dias como não concluídos.
        </p>
        <button className="btn btn-secondary btn-block" onClick={onClear}>
          Apagar todas as minhas reflexões
        </button>
      </div>

      <div className="card">
        <h4 style={{ marginBottom: '0.5rem' }}>ℹ️ Sobre</h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--ink-light)' }}>
          21 Dias de Gratidão — baseado em <em>21 Días para Desarrollar la Gratitud</em> de Octavio Déniz.
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--ink-light)', marginTop: '0.5rem' }}>
          v0.1.0 · AutomaçãoJS © 2026
        </p>
      </div>
    </>
  )
}
