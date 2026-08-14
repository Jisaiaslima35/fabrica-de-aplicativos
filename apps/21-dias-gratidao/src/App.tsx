import { useState, useEffect } from 'react'
import { DAYS } from './domain/catalog'
import { getAllReflections, clearAllReflections } from './domain/db'
import type { Reflection } from './domain/types'
import HomePage from './pages/HomePage'
import JourneyPage from './pages/JourneyPage'
import DayPage from './pages/DayPage'
import ProfessorPage from './pages/ProfessorPage'
import SettingsPage from './pages/SettingsPage'

type Route = 'home' | 'journey' | 'day' | 'professor' | 'settings'

function readRoute(): { route: Route; day?: number } {
  const hash = window.location.hash.replace('#/', '')
  const [route, param] = hash.split('/')
  const valid: Route[] = ['home', 'journey', 'day', 'professor', 'settings']
  if (valid.includes(route as Route)) {
    return { route: route as Route, day: param ? Number(param) : undefined }
  }
  return { route: 'home' }
}

function navigate(route: Route, day?: number) {
  window.location.hash = day !== undefined ? `#/${route}/${day}` : `#/${route}`
}

export default function App() {
  const [{ route, day }, setRoute] = useState(readRoute())
  const [reflections, setReflections] = useState<Reflection[]>([])

  useEffect(() => {
    const onHash = () => setRoute(readRoute())
    window.addEventListener('hashchange', onHash)
    refreshReflections()
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  async function refreshReflections() {
    const all = await getAllReflections()
    setReflections(all)
  }

  const currentDay = day ?? (reflections.length === 0 ? 1 : Math.min(21, Math.max(...reflections.filter(r => r.completed).map(r => r.day), 0) + 1))
  const completedCount = reflections.filter(r => r.completed).length

  return (
    <div className="app">
      <header className="header">
        <h1>🌿 21 Dias de Gratidão</h1>
        <span style={{ fontSize: '0.85rem', color: 'var(--ink-light)' }}>
          {completedCount}/21
        </span>
      </header>

      {route === 'home' && (
        <HomePage
          completedCount={completedCount}
          currentDay={currentDay}
          onContinue={() => navigate('day', currentDay)}
          onSeeAll={() => navigate('journey')}
        />
      )}
      {route === 'journey' && (
        <JourneyPage
          reflections={reflections}
          onDayClick={(d) => navigate('day', d)}
        />
      )}
      {route === 'day' && day && (
        <DayPage
          day={day}
          onBack={() => navigate('journey')}
          onSaved={refreshReflections}
          onAskProfessor={() => navigate('professor', day)}
        />
      )}
      {route === 'professor' && (
        <ProfessorPage
          day={day ?? currentDay}
          onBack={() => navigate('day', day ?? currentDay)}
        />
      )}
      {route === 'settings' && (
        <SettingsPage
          onClear={async () => {
            if (confirm('Apagar TODAS as reflexões? Esta ação não pode ser desfeita.')) {
              await clearAllReflections()
              await refreshReflections()
            }
          }}
        />
      )}

      <nav className="bottom-nav">
        <button className={`nav-item ${route === 'home' ? 'active' : ''}`} onClick={() => navigate('home')}>
          <span>🏠</span>Início
        </button>
        <button className={`nav-item ${route === 'journey' ? 'active' : ''}`} onClick={() => navigate('journey')}>
          <span>📅</span>21 Dias
        </button>
        <button className={`nav-item ${route === 'professor' ? 'active' : ''}`} onClick={() => navigate('professor', currentDay)}>
          <span>🤖</span>Professor
        </button>
        <button className={`nav-item ${route === 'settings' ? 'active' : ''}`} onClick={() => navigate('settings')}>
          <span>⚙️</span>Ajustes
        </button>
      </nav>
    </div>
  )
}
