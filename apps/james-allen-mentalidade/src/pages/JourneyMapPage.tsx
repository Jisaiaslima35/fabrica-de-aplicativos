import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DAYS_CONTENT, MODULE_GROUPS } from '../data/daysContent';
import {
  Compass,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
  BookOpen,
  HelpCircle,
  Feather,
  Sprout,
  HeartPulse,
  Target,
  Star,
  ShieldCheck,
  Brain,
  Filter,
} from 'lucide-react';

export const JourneyMapPage: React.FC = () => {
  const { completedDays, quizCompletedDays, navigateTo, getTodayDayNumber } = useApp();
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');

  const todayDayNum = getTodayDayNumber();
  const progressPercent = Math.round((completedDays.length / 21) * 100);

  const getModuleIcon = (iconName: string) => {
    switch (iconName) {
      case 'feather':
        return <Feather className="w-4 h-4" />;
      case 'sprout':
        return <Sprout className="w-4 h-4" />;
      case 'compass':
        return <Compass className="w-4 h-4" />;
      case 'heart-pulse':
        return <HeartPulse className="w-4 h-4" />;
      case 'target':
        return <Target className="w-4 h-4" />;
      case 'sparkles':
        return <Sparkles className="w-4 h-4" />;
      case 'star':
        return <Star className="w-4 h-4" />;
      case 'shield-check':
        return <ShieldCheck className="w-4 h-4" />;
      default:
        return <Brain className="w-4 h-4" />;
    }
  };

  return (
    <div id="journey-map-view" className="space-y-8 pb-24 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#1e3a5f] to-[#122338] text-white border border-[#b8893e]/30 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#b8893e]/20 text-[#d4a574] mb-2">
              <Compass className="w-3.5 h-3.5" />
              Mapa da Jornada
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
              Os 21 Dias de Transformação
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 mt-1">
              8 módulos temáticos para consolidar o domínio e a serenidade do pensamento.
            </p>
          </div>

          {/* Quick Progress Ring */}
          <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-xs border border-white/10">
            <div>
              <span className="text-[11px] text-stone-300 block">Progresso Total</span>
              <span className="font-serif text-2xl font-bold text-[#e0ad5b]">
                {completedDays.length} / 21
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-white block">{progressPercent}%</span>
              <span className="text-[10px] text-stone-400">concluído</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 bg-white dark:bg-[#111722] sepia:bg-[#ede3d3] p-1 rounded-2xl border border-slate-200 dark:border-[#1e2836] shadow-2xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-[#1e3a5f] text-white'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
            }`}
          >
            Todos (21)
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filter === 'completed'
                ? 'bg-emerald-600 text-white'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
            }`}
          >
            Concluídos ({completedDays.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filter === 'pending'
                ? 'bg-[#b8893e] text-white'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
            }`}
          >
            Pendentes ({21 - completedDays.length})
          </button>
        </div>

        <button
          onClick={() => navigateTo('hoje')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1e3a5f] text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
        >
          <BookOpen className="w-3.5 h-3.5 text-[#e0ad5b]" />
          <span>Continuar do Dia {todayDayNum}</span>
        </button>
      </div>

      {/* Modules & Day Cards List */}
      <div className="space-y-8">
        {MODULE_GROUPS.map((mod) => {
          const moduleDays = DAYS_CONTENT.filter((d) => mod.days.includes(d.day));
          const filteredModuleDays = moduleDays.filter((d) => {
            const isCompleted = completedDays.includes(d.day);
            if (filter === 'completed') return isCompleted;
            if (filter === 'pending') return !isCompleted;
            return true;
          });

          if (filteredModuleDays.length === 0) return null;

          const completedCount = moduleDays.filter((d) => completedDays.includes(d.day)).length;
          const isModuleDone = completedCount === moduleDays.length;

          return (
            <section
              key={mod.id}
              className="space-y-3.5 p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#111722] sepia:bg-[#ede3d3] border border-slate-200 dark:border-[#1e2836] shadow-xs"
            >
              {/* Module Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-stone-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-[#b8893e] flex items-center justify-center">
                    {getModuleIcon(mod.icon)}
                  </div>
                  <div>
                    <h2 className="font-serif text-lg font-bold text-[#1e3a5f] dark:text-[#f7f4ed]">
                      {mod.name}
                    </h2>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400">
                      Dias {mod.days[0]} a {mod.days[mod.days.length - 1]}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    isModuleDone
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  {completedCount}/{mod.days.length} concluídos
                </span>
              </div>

              {/* Day Cards in Module */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                {filteredModuleDays.map((dayItem) => {
                  const isDone = completedDays.includes(dayItem.day);
                  const isQuizDone = quizCompletedDays.includes(dayItem.day);
                  const isCurrent = dayItem.day === todayDayNum && !isDone;

                  return (
                    <div
                      key={dayItem.day}
                      onClick={() => navigateTo('dia', dayItem.day)}
                      className={`group cursor-pointer p-4 rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden ${
                        isCurrent
                          ? 'bg-amber-50/70 dark:bg-[#1a2432] border-[#b8893e] shadow-sm ring-1 ring-[#b8893e]'
                          : isDone
                          ? 'bg-slate-50/80 dark:bg-[#121822] sepia:bg-[#f5efe5] border-slate-200 dark:border-stone-800 hover:border-[#b8893e]'
                          : 'bg-slate-50/50 dark:bg-[#0f151e] sepia:bg-[#f0e8dc] border-slate-200 dark:border-stone-800 hover:border-slate-300'
                      }`}
                    >
                      {/* Top Badges */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold font-serif text-[#1e3a5f] dark:text-[#d4a574]">
                            Dia {dayItem.day}
                          </span>

                          <div className="flex items-center gap-1">
                            {isDone && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Lido</span>
                              </span>
                            )}
                            {isQuizDone && (
                              <span className="text-[10px] font-bold text-[#b8893e] bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.5 rounded-full" title="Quiz concluído">
                                Quiz ✓
                              </span>
                            )}
                            {isCurrent && (
                              <span className="text-[10px] font-bold text-white bg-[#b8893e] px-2 py-0.5 rounded-full">
                                Hoje
                              </span>
                            )}
                          </div>
                        </div>

                        <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 group-hover:text-[#1e3a5f] dark:group-hover:text-[#d4a574] transition-colors leading-snug line-clamp-1">
                          {dayItem.title}
                        </h3>

                        <p className="font-serif italic text-xs text-stone-600 dark:text-stone-400 mt-2 line-clamp-2">
                          “{dayItem.keyQuote}”
                        </p>
                      </div>

                      {/* Footer Action */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-stone-800/80 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-stone-400">
                          {dayItem.wordCount} palavras
                        </span>
                        <span className="font-semibold text-[#1e3a5f] dark:text-[#d4a574] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          <span>{isDone ? 'Revisar' : 'Iniciar'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
