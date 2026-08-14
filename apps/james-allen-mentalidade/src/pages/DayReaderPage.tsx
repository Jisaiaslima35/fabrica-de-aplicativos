import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { fetchDayContentFromApi } from '../services/api';
import { DAYS_CONTENT } from '../data/daysContent';
import { db } from '../db';
import type { DayContent, ReflectionEntry } from '../types';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  CheckCircle2,
  Bookmark,
  Share2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  MessageSquare,
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  PenTool,
  Save,
  Check,
  RotateCcw,
  Type,
} from 'lucide-react';

interface DayReaderPageProps {
  day: number;
  onOpenShareModal: (day: number, title: string, quote: string) => void;
}

export const DayReaderPage: React.FC<DayReaderPageProps> = ({
  day,
  onOpenShareModal,
}) => {
  const {
    completedDays,
    quizCompletedDays,
    markDayComplete,
    fontSize,
    setFontSize,
    navigateTo,
    openMentorChat,
  } = useApp();

  const [dayData, setDayData] = useState<DayContent>(() => {
    return DAYS_CONTENT.find((d) => d.day === day) || DAYS_CONTENT[0];
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [reflectionText, setReflectionText] = useState('');
  const [savedReflectionTime, setSavedReflectionTime] = useState<string | null>(null);
  const [isSavingReflection, setIsSavingReflection] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  // Audio Speech state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isCompleted = completedDays.includes(day);
  const isQuizDone = quizCompletedDays.includes(day);

  // Load Day Content & DB entries
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    // Cancel ongoing speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }

    async function loadData() {
      // 1. Fetch content (with local fallback)
      const content = await fetchDayContentFromApi(day);
      if (isMounted) {
        setDayData(content);
        setIsLoading(false);
      }

      // 2. Check bookmark
      const bookmark = await db.bookmarks.get(day);
      if (isMounted) {
        setIsBookmarked(!!bookmark);
      }

      // 3. Load reflection for this day
      const reflections = await db.reflections.where('day').equals(day).toArray();
      if (isMounted && reflections.length > 0) {
        const latest = reflections[reflections.length - 1];
        setReflectionText(latest.text);
        setSavedReflectionTime(
          new Date(latest.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        );
      } else if (isMounted) {
        setReflectionText('');
        setSavedReflectionTime(null);
      }
    }

    loadData();

    return () => {
      isMounted = false;
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [day]);

  // Audio speech handler
  const handleToggleAudio = () => {
    if (!('speechSynthesis' in window)) {
      alert('Seu navegador não suporta leitura em áudio nativa.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean plain text without markdown symbols for speech
    const cleanText = dayData.content
      .replace(/\*/g, '')
      .replace(/#/g, '')
      .replace(/"/g, '');

    const fullSpeechText = `Dia ${dayData.day}. ${dayData.title}. ${cleanText}`;

    const utterance = new SpeechSynthesisUtterance(fullSpeechText);
    utterance.lang = 'pt-BR';
    utterance.rate = speechRate;

    utterance.onend = () => {
      setIsPlayingAudio(false);
    };

    utterance.onerror = () => {
      setIsPlayingAudio(false);
    };

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  const handleCycleSpeed = () => {
    const nextRate = speechRate === 1.0 ? 1.25 : speechRate === 1.25 ? 1.5 : 1.0;
    setSpeechRate(nextRate);
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }
  };

  // Toggle Bookmark
  const handleToggleBookmark = async () => {
    if (isBookmarked) {
      await db.bookmarks.delete(day);
      setIsBookmarked(false);
    } else {
      await db.bookmarks.put({
        day,
        note: dayData.title,
        createdAt: new Date().toISOString(),
      });
      setIsBookmarked(true);
    }
  };

  // Save Reflection
  const handleSaveReflection = async () => {
    if (!reflectionText.trim()) return;
    setIsSavingReflection(true);

    try {
      const entry: ReflectionEntry = {
        id: `ref-${day}-${Date.now()}`,
        day,
        text: reflectionText.trim(),
        createdAt: new Date().toISOString(),
      };
      await db.reflections.put(entry);
      setSavedReflectionTime(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    } catch (e) {
      console.error('Error saving reflection:', e);
    } finally {
      setIsSavingReflection(false);
    }
  };

  // Complete Day
  const handleCompleteDay = async () => {
    try {
      await markDayComplete(day);
      setJustCompleted(true);

      // Trigger Confetti Celebration (1.5s max as requested)
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#b8893e', '#1e3a5f', '#7a9070', '#e0ad5b'],
      });

      // Save reflection if entered
      if (reflectionText.trim()) {
        await handleSaveReflection();
      }
    } catch (e) {
      console.error('Error completing day:', e);
    }
  };

  // Font size class mapping
  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'sm':
        return 'text-base sm:text-lg leading-relaxed';
      case 'lg':
        return 'text-xl sm:text-2xl leading-relaxed';
      case 'xl':
        return 'text-2xl sm:text-3xl leading-relaxed';
      default:
        return 'text-lg sm:text-xl leading-relaxed';
    }
  };

  return (
    <div id="day-reader-view" className="max-w-3xl mx-auto space-y-6 pb-24 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Controls Bar */}
      <div className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-white/90 dark:bg-[#111722]/90 sepia:bg-[#ede3d3]/90 border border-slate-200 dark:border-[#1e2836] shadow-2xs backdrop-blur-xs">
        <button
          onClick={() => navigateTo('mapa')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-slate-100 dark:hover:bg-stone-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Todos os Dias</span>
        </button>

        <div className="flex items-center gap-1.5">
          {/* Audio TTS button */}
          <button
            onClick={handleToggleAudio}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isPlayingAudio
                ? 'bg-amber-50 dark:bg-amber-950/60 border-[#b8893e] text-[#b8893e]'
                : 'bg-slate-100 dark:bg-stone-800 border-slate-200 dark:border-stone-700 text-stone-600 dark:text-stone-300'
            }`}
            title={isPlayingAudio ? 'Pausar leitura em áudio' : 'Ouvir capítulo em áudio'}
            aria-label="Ouvir em áudio"
          >
            {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isPlayingAudio ? 'Pausar' : 'Ouvir'}</span>
          </button>

          {isPlayingAudio && (
            <button
              onClick={handleCycleSpeed}
              className="px-2 py-1.5 rounded-xl text-xs font-bold bg-amber-100 dark:bg-amber-900/60 text-[#b8893e] border border-[#b8893e]/40"
              title="Ajustar velocidade de leitura"
            >
              {speechRate}x
            </button>
          )}

          {/* Font Size Adjuster */}
          <div className="flex items-center bg-slate-100 dark:bg-stone-800 rounded-xl p-0.5 border border-slate-200 dark:border-stone-700">
            <button
              onClick={() => setFontSize(fontSize === 'xl' ? 'sm' : fontSize === 'lg' ? 'xl' : fontSize === 'base' ? 'lg' : 'base')}
              className="p-1.5 text-stone-600 dark:text-stone-300 hover:text-[#1e3a5f] rounded-lg"
              title="Alternar tamanho da fonte"
              aria-label="Ajustar tamanho da fonte"
            >
              <Type className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={handleToggleBookmark}
            className={`p-2 rounded-xl border transition-all ${
              isBookmarked
                ? 'bg-amber-50 dark:bg-amber-950/50 border-[#b8893e] text-[#b8893e]'
                : 'bg-slate-100 dark:bg-stone-800 border-slate-200 dark:border-stone-700 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
            title={isBookmarked ? 'Salvo nos favoritos' : 'Favoritar este dia'}
            aria-label="Favoritar capítulo"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-[#b8893e]' : ''}`} />
          </button>

          {/* Share Card Button */}
          <button
            onClick={() => onOpenShareModal(day, dayData.title, dayData.keyQuote)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-stone-800 border border-slate-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:text-[#b8893e] transition-colors"
            title="Compartilhar Cartão de Sabedoria"
            aria-label="Compartilhar frase do dia"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Chapter Card */}
      <article
        id="day-chapter-article"
        className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-[#111722] sepia:bg-[#ede3d3] border border-slate-200 dark:border-[#1e2836] shadow-sm relative overflow-hidden"
      >
        {/* Module Header Badge */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#b8893e] dark:text-[#d4a574]">
            {dayData.module} · {dayData.modulePart}
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
            Dia {day} de 21
          </span>
        </div>

        {/* Title */}
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-4xl font-bold text-[#1e3a5f] dark:text-[#f7f4ed] leading-tight mb-6">
          {dayData.title}
        </h1>

        {/* Key Quote Callout Banner */}
        <div className="my-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200/70 dark:from-[#1b2636] dark:to-[#121a24] sepia:from-[#e5dac6] sepia:to-[#dcd0bb] border-l-4 border-[#b8893e] text-stone-800 dark:text-stone-200 shadow-2xs">
          <p className="font-serif italic font-medium text-lg sm:text-xl leading-relaxed text-[#1e3a5f] dark:text-[#f7f4ed]">
            “{dayData.keyQuote}”
          </p>
          <span className="block not-italic font-sans text-xs font-semibold tracking-wider uppercase text-[#b8893e] dark:text-[#d4a574] mt-2">
            — James Allen
          </span>
        </div>

        {/* Chapter Prose Content */}
        <div className={`font-serif text-stone-800 dark:text-stone-200 ${getFontSizeClass()} space-y-4 my-8`}>
          {dayData.content.split('\n\n').map((paragraph, idx) => {
            // Strip leading/trailing markdown if any
            const cleaned = paragraph.replace(/^\*"/, '“').replace(/"\*$/, '”');
            return (
              <p key={idx} className="leading-relaxed">
                {cleaned}
              </p>
            );
          })}
        </div>

        {/* Complete Day & Quiz CTA Banner */}
        <div className="mt-10 pt-8 border-t border-slate-200 dark:border-[#1e2836] flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            id="complete-day-action-btn"
            onClick={handleCompleteDay}
            className={`w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-md active:scale-95 ${
              isCompleted
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-[#1e3a5f] hover:bg-[#152a45] text-white'
            }`}
          >
            <CheckCircle2 className={`w-5 h-5 ${isCompleted ? 'text-white' : 'text-[#e0ad5b]'}`} />
            <span>{isCompleted ? 'Dia Concluído ✓' : 'Marcar como Concluído'}</span>
          </button>

          {/* Quiz of the Day Button */}
          <button
            onClick={() => navigateTo('quiz', day)}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl border text-xs font-bold transition-all ${
              isQuizDone
                ? 'bg-amber-50 dark:bg-amber-950/40 border-[#b8893e] text-[#b8893e] dark:text-[#e0ad5b]'
                : 'bg-white dark:bg-[#1e2836] border-slate-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:border-[#b8893e]'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-[#b8893e]" />
            <span>{isQuizDone ? 'Refazer Quiz de Fixação' : 'Fazer Quiz de Fixação'}</span>
          </button>

          {/* Ask Mentor Button */}
          <button
            onClick={() => openMentorChat(day, dayData.title)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-slate-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-stone-700 transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-[#b8893e]" />
            <span>Tirar Dúvida</span>
          </button>
        </div>
      </article>

      {/* Interactive Reflection / Diary Block */}
      <section
        id="day-reflection-box"
        className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111722] sepia:bg-[#ede3d3] border border-slate-200 dark:border-[#1e2836] shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-[#b8893e] flex items-center justify-center">
              <PenTool className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#1e3a5f] dark:text-[#f7f4ed]">
                Espelho & Reflexão Pessoal
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Como esse capítulo ressoou em você hoje?
              </p>
            </div>
          </div>

          {savedReflectionTime && (
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Salvo às {savedReflectionTime}
            </span>
          )}
        </div>

        {/* Guided Prompt Callout */}
        <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-[#1c2635] sepia:bg-[#e6dcce] border border-slate-200 dark:border-[#223044] text-xs font-medium text-stone-700 dark:text-stone-300">
          💡 <strong className="text-[#1e3a5f] dark:text-[#d4a574]">Pergunta guia:</strong> {dayData.reflectionPrompt}
        </div>

        {/* Reflection Textarea */}
        <div className="relative">
          <textarea
            id="day-reflection-input"
            rows={4}
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            placeholder="Escreva livremente aqui suas impressões, decisões ou sentimentos sobre a leitura de hoje..."
            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-[#101620] sepia:bg-[#f3ede1] border border-slate-200 dark:border-[#243346] text-stone-900 dark:text-stone-100 text-sm font-sans placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] dark:focus:ring-[#b8893e] resize-y"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-stone-400">
            {reflectionText.trim().split(/\s+/).filter(Boolean).length} palavras · Salvo localmente (IndexedDB)
          </span>

          <button
            id="save-reflection-btn"
            onClick={handleSaveReflection}
            disabled={!reflectionText.trim() || isSavingReflection}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1e3a5f] dark:bg-[#b8893e] text-white dark:text-[#0f1419] text-xs font-bold disabled:opacity-40 hover:opacity-90 active:scale-95 transition-all shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSavingReflection ? 'Salvando...' : 'Salvar Reflexão'}</span>
          </button>
        </div>
      </section>

      {/* Prev / Next Chapter Navigation */}
      <div className="flex items-center justify-between gap-3 pt-2">
        {day > 1 ? (
          <button
            onClick={() => navigateTo('dia', day - 1)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white dark:bg-[#111722] sepia:bg-[#ede3d3] border border-slate-200 dark:border-[#1e2836] text-xs font-bold text-stone-700 dark:text-stone-300 hover:border-[#b8893e] transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dia {day - 1}</span>
          </button>
        ) : (
          <div />
        )}

        {day < 21 ? (
          <button
            onClick={() => navigateTo('dia', day + 1)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#1e3a5f] text-white text-xs font-bold hover:bg-[#152a45] transition-all shadow-xs"
          >
            <span>Próximo: Dia {day + 1}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => navigateTo('mapa')}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#b8893e] text-white text-xs font-bold hover:bg-[#a67b37] transition-all shadow-xs"
          >
            <span>Ver Mapa Completo</span>
            <Sparkles className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
