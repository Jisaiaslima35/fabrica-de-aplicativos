import { useState, useEffect } from 'react'
import { useTTS, stripMarkdown } from '../hooks/useTTS'
import { getPref, setPref } from '../domain/db'

const PREF_MUTED = 'tts-muted'

interface Props {
  onClear: () => void
}

export default function SettingsPage({ onClear }: Props) {
  const tts = useTTS()
  const [ttsTestText] = useState('Olá! Eu sou o Professor. O espelho é seu aliado. Olhe para si com amor.')

  useEffect(() => {
    getPref<boolean>(PREF_MUTED).then(v => {
      if (v !== null) tts.setMuted(v)
    })
  }, [])

  function toggleMute() {
    tts.toggleMute()
    setPref(PREF_MUTED, !tts.isMuted)
  }

  function testVoice() {
    tts.speak(ttsTestText)
  }

  return (
    <div className="fade-in">
      <h2 style={{ marginBottom: '1.25rem' }}>Ajustes</h2>

      <div className="card">
        <h4 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span aria-hidden="true">🔊</span> Professor falante
        </h4>
        <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', marginBottom: '0.75rem' }}>
          {tts.isSupported
            ? 'O Professor pode ler suas respostas em voz alta, em português do Brasil.'
            : '⚠️ Seu navegador não suporta leitura em voz alta (Web Speech API).'}
        </p>
        {tts.isSupported && (
          <>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              <button
                className={`tts-btn ${tts.isMuted ? '' : 'active'}`}
                onClick={toggleMute}
                aria-pressed={!tts.isMuted}
              >
                {tts.isMuted ? '🔇 Silenciado' : '🔊 Ativado'}
              </button>
              <button
                className="tts-btn"
                onClick={testVoice}
                disabled={tts.isMuted}
              >
                {tts.isSpeaking ? '⏸ Falando...' : '▶ Testar voz'}
              </button>
              {tts.isSpeaking && (
                <button className="tts-btn" onClick={() => tts.cancel()}>
                  ⏹ Parar
                </button>
              )}
            </div>
            {tts.voices.length > 0 && (
              <details style={{ marginTop: '0.5rem' }}>
                <summary style={{ fontSize: '0.8rem', color: 'var(--ink-soft)', cursor: 'pointer' }}>
                  Vozes disponíveis ({tts.voices.length})
                </summary>
                <ul style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--ink-light)', paddingLeft: '1.25rem' }}>
                  {tts.voices.slice(0, 10).map((v, i) => (
                    <li key={i}>{v.name} ({v.lang}){v.default ? ' — padrão' : ''}</li>
                  ))}
                </ul>
              </details>
            )}
          </>
        )}
      </div>

      <div className="card">
        <h4 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span aria-hidden="true">💾</span> Seus dados
        </h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', marginBottom: '1rem', lineHeight: 1.5 }}>
          Suas reflexões e conversas ficam guardadas <strong>apenas neste dispositivo</strong>.
          Nenhuma informação pessoal é enviada para nossos servidores.
        </p>
        <button className="btn btn-secondary btn-block" onClick={onClear}>
          Apagar todas as reflexões
        </button>
      </div>

      <div className="card card-quiet" style={{ fontSize: '0.8rem', color: 'var(--ink-light)', textAlign: 'center', fontStyle: 'italic' }}>
        20 Dias para Curar a Sua Vida<br />
        Lise Bourbeau<br />
        <span style={{ fontSize: '0.7rem' }}>Uma experiência da Fábrica de Aplicativos</span>
      </div>
    </div>
  )
}
