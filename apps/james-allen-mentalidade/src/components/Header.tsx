import React from 'react';
import { useApp } from '../context/AppContext';
import { Flame, Sparkles, Sun, Moon, Coffee, Download, WifiOff } from 'lucide-react';

export const Header: React.FC = () => {
  const { streak, theme, setTheme, navigateTo, isOnline } = useApp();

  return (
    <header
      id="app-header"
      className="sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors duration-200 bg-white/90 dark:bg-[#0b0f17]/90 sepia:bg-[#f5ecd8]/90 border-slate-200 dark:border-[#1e2836] sepia:border-[#ded3c2]"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo & Title */}
        <button
          id="header-logo-btn"
          onClick={() => navigateTo('home')}
          className="flex items-center gap-3 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b8893e] rounded-lg p-1"
          aria-label="Ir para a página inicial"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1e3a5f] to-[#12233a] dark:from-[#b8893e] dark:to-[#8c6527] flex items-center justify-center shadow-sm text-white dark:text-[#0b0f17] font-serif font-bold text-xl transition-transform group-hover:scale-105">
            <span>M</span>
          </div>
          <div>
            <span className="block font-serif text-lg font-bold tracking-tight text-[#1e3a5f] dark:text-[#f7f4ed] leading-tight">
              James Allen
            </span>
            <span className="block text-[11px] tracking-wider uppercase font-sans font-semibold text-[#b8893e] dark:text-[#d4a574]">
              Mentalidade · 21 Dias
            </span>
          </div>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Offline indicator */}
          {!isOnline && (
            <span
              id="offline-badge"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-200"
              title="Modo offline ativo: o conteúdo completo está salvo localmente"
            >
              <WifiOff className="w-3.5 h-3.5" />
              <span>Offline</span>
            </span>
          )}

          {/* Streak Counter */}
          <button
            id="streak-badge-btn"
            onClick={() => navigateTo('mapa')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
              streak.streakCount > 0
                ? 'bg-amber-50 dark:bg-amber-950/40 border-[#b8893e]/40 text-[#b8893e] dark:text-[#e0ad5b]'
                : 'bg-slate-100 dark:bg-stone-850 border-slate-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
            }`}
            title={`Sequência atual: ${streak.streakCount} dias (Recorde: ${streak.longestStreak} dias)`}
            aria-label={`Sequência de ${streak.streakCount} dias`}
          >
            <Flame className={`w-4 h-4 ${streak.streakCount > 0 ? 'text-[#b8893e] fill-[#b8893e]/20' : ''}`} />
            <span>{streak.streakCount} {streak.streakCount === 1 ? 'dia' : 'dias'}</span>
          </button>

          {/* Quick "Hoje" button */}
          <button
            id="quick-today-btn"
            onClick={() => navigateTo('hoje')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1e3a5f] hover:bg-[#152a45] text-white text-xs font-semibold transition-all shadow-sm active:scale-95"
            aria-label="Ir para a leitura de hoje"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#e0ad5b]" />
            <span>Hoje</span>
          </button>

          {/* Theme switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-stone-800 p-0.5 rounded-full border border-slate-200 dark:border-stone-700">
            <button
              onClick={() => setTheme('light')}
              className={`p-1.5 rounded-full transition-colors ${
                theme === 'light'
                  ? 'bg-white text-[#1e3a5f] shadow-xs'
                  : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
              }`}
              title="Tema Claro"
              aria-label="Ativar tema claro"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('sepia')}
              className={`p-1.5 rounded-full transition-colors ${
                theme === 'sepia'
                  ? 'bg-[#e8dcc8] text-[#5c3e1e] shadow-xs'
                  : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
              }`}
              title="Tema Sépia (Leitura Suave)"
              aria-label="Ativar tema sépia"
            >
              <Coffee className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded-full transition-colors ${
                theme === 'dark'
                  ? 'bg-stone-700 text-[#d4a574] shadow-xs'
                  : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
              }`}
              title="Tema Escuro"
              aria-label="Ativar tema escuro"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
