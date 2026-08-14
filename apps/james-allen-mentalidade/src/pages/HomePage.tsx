import React from 'react';
import { useApp } from '../context/AppContext';
import { DAYS_CONTENT, MODULE_GROUPS } from '../data/daysContent';
import {
  Sparkles,
  Flame,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  MessageSquare,
  Share2,
  Feather,
  Compass,
  Trophy,
  Brain,
  ShieldCheck,
  Sprout,
  HeartPulse,
  Target,
  Star,
} from 'lucide-react';

interface HomePageProps {
  onOpenShareModal: (day: number, title: string, quote: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenShareModal }) => {
  const {
    streak,
    completedDays,
    getTodayDayNumber,
    navigateTo,
    openMentorChat,
  } = useApp();

  const todayDayNum = getTodayDayNumber();
  const todayDayData = DAYS_CONTENT.find((d) => d.day === todayDayNum) || DAYS_CONTENT[0];
  const progressPercent = Math.round((completedDays.length / 21) * 100);

  const getModuleIcon = (iconName: string) => {
    switch (iconName) {
      case 'feather':
        return <Feather className="w-5 h-5" />;
      case 'sprout':
        return <Sprout className="w-5 h-5" />;
      case 'compass':
        return <Compass className="w-5 h-5" />;
      case 'heart-pulse':
        return <HeartPulse className="w-5 h-5" />;
      case 'target':
        return <Target className="w-5 h-5" />;
      case 'sparkles':
        return <Sparkles className="w-5 h-5" />;
      case 'star':
        return <Star className="w-5 h-5" />;
      case 'shield-check':
        return <ShieldCheck className="w-5 h-5" />;
      default:
        return <Brain className="w-5 h-5" />;
    }
  };

  return (
    <div id="home-page-view" className="space-y-8 pb-20">
      {/* Hero Welcome Card */}
      <section
        id="home-hero-section"
        className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#1e3a5f] via-[#162d4a] to-[#0f1d30] text-[#f7f4ed] shadow-xl border border-[#b8893e]/30 relative overflow-hidden"
      >
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#b8893e]/20 border border-[#b8893e]/40 text-[#d4a574] mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Jornada de 21 Dias · James Allen (1902)
          </span>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight mb-3">
            Moldar a mente pelo pensamento.
          </h1>

          <p className="font-sans text-sm sm:text-base text-stone-300 leading-relaxed mb-6 max-w-xl">
            21 dias para cultivar disciplina mental, sair do piloto automático e assumir responsabilidade pelo que você pensa — porque o homem é aquilo que ele pensa.
          </p>

          {/* Action CTA & Streak summary */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="hero-start-journey-btn"
              onClick={() => navigateTo('dia', todayDayNum)}
              className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-[#b8893e] hover:bg-[#a67b37] text-white font-bold text-sm shadow-md active:scale-95 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>
                {completedDays.length === 0
                  ? 'Começar Minha Jornada'
                  : `Continuar: Dia ${todayDayNum}`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => openMentorChat(todayDayNum, todayDayData.title)}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-stone-200 text-xs font-semibold backdrop-blur-xs transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-[#d4a574]" />
              <span>Perguntar ao Mentor</span>
            </button>
          </div>
        </div>

        {/* Decorative background watermark */}
        <div className="absolute -right-8 -bottom-12 font-serif text-[180px] font-bold text-white/5 select-none pointer-events-none">
          21
        </div>
      </section>

      {/* Progress & Streak Bar */}
      <section
        id="home-progress-section"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {/* Streak card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111722] sepia:bg-[#ede3d3] border border-slate-200 dark:border-[#1e2836] shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-[#b8893e]/30 flex items-center justify-center text-[#b8893e]">
              <Flame className="w-6 h-6 fill-[#b8893e]/20" />
            </div>
            <div>
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400 block">
                Sequência Atual
              </span>
              <span className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
                {streak.streakCount} {streak.streakCount === 1 ? 'Dia' : 'Dias'}
              </span>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-stone-400 dark:text-stone-500">
            Recorde: {streak.longestStreak}
          </span>
        </div>

        {/* Completed days card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111722] sepia:bg-[#ede3d3] border border-slate-200 dark:border-[#1e2836] shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400 block">
                Dias Concluídos
              </span>
              <span className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
                {completedDays.length} de 21
              </span>
            </div>
          </div>
          <span className="text-xs font-bold text-[#b8893e]">{progressPercent}%</span>
        </div>

        {/* Journey completion card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111722] sepia:bg-[#ede3d3] border border-slate-200 dark:border-[#1e2836] shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-[#1e3a5f]/30 flex items-center justify-center text-[#1e3a5f] dark:text-[#d4a574]">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400 block">
                Próxima Meta
              </span>
              <span className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 truncate max-w-[140px] block">
                {completedDays.length === 21 ? 'Jornada Completa!' : `Dia ${todayDayNum}`}
              </span>
            </div>
          </div>
          <button
            onClick={() => navigateTo('mapa')}
            className="text-xs text-[#1e3a5f] dark:text-[#d4a574] font-semibold hover:underline"
          >
            Ver Mapa
          </button>
        </div>
      </section>

      {/* Progress Bar Line */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#111722] sepia:bg-[#ede3d3] border border-slate-200 dark:border-[#1e2836] shadow-xs">
        <div className="flex items-center justify-between text-xs font-medium text-stone-600 dark:text-stone-400 mb-2">
          <span>Progresso da Mente Disciplinada</span>
          <span className="font-bold text-[#b8893e]">{completedDays.length}/21 Capítulos</span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-stone-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#1e3a5f] via-[#b8893e] to-[#7a9070] transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Spotlight Thought of the Day */}
      <section
        id="home-thought-of-the-day"
        className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200/70 dark:from-[#131b26] dark:to-[#0d141e] sepia:from-[#eae0cf] sepia:to-[#dfd3bf] border border-slate-300 dark:border-[#b8893e]/30 shadow-sm relative"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#b8893e] dark:text-[#d4a574]">
            <Sparkles className="w-4 h-4" />
            <span>Pensamento em Destaque · Dia {todayDayData.day}</span>
          </div>

          <button
            onClick={() =>
              onOpenShareModal(
                todayDayData.day,
                todayDayData.title,
                todayDayData.keyQuote
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-[#1e2a3c] text-stone-700 dark:text-stone-200 hover:text-[#b8893e] shadow-xs transition-colors"
            aria-label="Compartilhar pensamento"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Compartilhar</span>
          </button>
        </div>

        <blockquote className="font-serif text-2xl sm:text-3xl italic font-medium text-[#1e3a5f] dark:text-[#f7f4ed] leading-relaxed my-4">
          “{todayDayData.keyQuote}”
        </blockquote>

        <div className="flex items-center justify-between pt-4 border-t border-slate-300/60 dark:border-[#b8893e]/20 text-xs text-stone-600 dark:text-stone-400">
          <span className="font-serif font-bold text-sm text-[#1e3a5f] dark:text-[#d4a574]">
            James Allen
          </span>
          <button
            onClick={() => navigateTo('dia', todayDayData.day)}
            className="font-sans font-bold text-[#1e3a5f] dark:text-[#e0ad5b] hover:underline flex items-center gap-1"
          >
            <span>Ler reflexão completa</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* 8 Thematic Modules Grid */}
      <section id="home-modules-section" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1e3a5f] dark:text-[#f7f4ed]">
              Módulos da Jornada
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              8 pilares de transformação do pensamento ao longo de 21 dias
            </p>
          </div>
          <button
            onClick={() => navigateTo('mapa')}
            className="text-xs font-bold text-[#b8893e] dark:text-[#d4a574] hover:underline"
          >
            Ver todos
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {MODULE_GROUPS.map((mod) => {
            const completedInModule = mod.days.filter((d) =>
              completedDays.includes(d)
            ).length;
            const isModuleComplete = completedInModule === mod.days.length;

            return (
              <div
                key={mod.id}
                onClick={() => navigateTo('dia', mod.days[0])}
                className="group cursor-pointer p-4 rounded-2xl bg-white dark:bg-[#111722] sepia:bg-[#ede3d3] border border-slate-200 dark:border-[#1e2836] hover:border-[#b8893e] dark:hover:border-[#b8893e]/60 transition-all shadow-2xs hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-stone-800 text-[#1e3a5f] dark:text-[#d4a574] flex items-center justify-center group-hover:scale-105 transition-transform">
                      {getModuleIcon(mod.icon)}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                      Dias {mod.days[0]}–{mod.days[mod.days.length - 1]}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 group-hover:text-[#1e3a5f] dark:group-hover:text-[#d4a574] transition-colors leading-snug">
                    {mod.name}
                  </h3>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-stone-800/80 flex items-center justify-between text-xs">
                  <span
                    className={`font-semibold ${
                      isModuleComplete
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-stone-500'
                    }`}
                  >
                    {completedInModule}/{mod.days.length} concluídos
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#b8893e] group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
