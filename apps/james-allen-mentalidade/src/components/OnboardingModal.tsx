import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Brain, CheckCircle, Smartphone, ArrowRight, ArrowLeft } from 'lucide-react';

export const OnboardingModal: React.FC = () => {
  const { showOnboarding, closeOnboarding, navigateTo } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!showOnboarding) return null;

  const slides = [
    {
      icon: Brain,
      tag: 'Sabedoria Clássica',
      title: 'Bem-vindo à jornada de 21 dias',
      description:
        'Baseado no clássico atemporal de James Allen (1902). Um percurso prático para sair do piloto automático e transformar seu caráter pela disciplina dos pensamentos.',
      highlight: '“Como o homem pensa em seu coração, assim ele é.”',
    },
    {
      icon: Sparkles,
      tag: 'Uma Ideia Central',
      title: 'Você é literalmente aquilo que pensa',
      description:
        'Cada pensamento é uma semente que gera frutos de saúde, serenidade e realizações. A cada dia, leia um micro-capítulo, responda ao quiz de fixação e registre sua reflexão pessoal.',
      highlight: 'Sem decoreba — pura transformação prática diária.',
    },
    {
      icon: Smartphone,
      tag: 'Pronto para o seu Dia',
      title: 'Instalável no celular e 100% offline',
      description:
        'Acompanhe sua sequência diária (streak), converse com o Professor Mentor quando tiver dúvidas e acesse suas anotações mesmo sem internet.',
      highlight: 'Dê o primeiro passo agora com o Dia 1.',
    },
  ];

  const current = slides[currentSlide];
  const Icon = current.icon;

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      closeOnboarding();
      navigateTo('dia', 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div
      id="onboarding-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in"
    >
      <div
        id="onboarding-modal-card"
        className="w-full max-w-md bg-white dark:bg-[#0f1419] sepia:bg-[#f0e8dc] rounded-3xl border border-slate-200 dark:border-[#1e2836] shadow-2xl p-6 sm:p-8 flex flex-col justify-between min-h-[480px] animate-in zoom-in-95 duration-200"
      >
        {/* Top Tag & Indicators */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[#b8893e] dark:text-[#d4a574] px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-[#b8893e]/30">
              {current.tag}
            </span>
            <div className="flex items-center gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === currentSlide
                      ? 'w-6 bg-[#1e3a5f] dark:bg-[#b8893e]'
                      : 'w-2 bg-stone-300 dark:bg-stone-700'
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-[#1e3a5f]/10 dark:bg-[#b8893e]/20 text-[#1e3a5f] dark:text-[#d4a574] flex items-center justify-center mb-5">
            <Icon className="w-8 h-8" />
          </div>

          {/* Text Content */}
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1e3a5f] dark:text-[#f7f4ed] leading-tight mb-3">
            {current.title}
          </h2>
          <p className="font-sans text-sm text-stone-600 dark:text-stone-300 leading-relaxed mb-4">
            {current.description}
          </p>

          <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-[#161f2c] sepia:bg-[#ece4d5]/60 border-l-3 border-[#b8893e] text-xs font-serif italic text-stone-800 dark:text-stone-200">
            {current.highlight}
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="mt-8 pt-4 border-t border-slate-200 dark:border-[#1e2836] flex items-center justify-between gap-3">
          {currentSlide > 0 ? (
            <button
              onClick={handlePrev}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
          ) : (
            <button
              onClick={closeOnboarding}
              className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 font-medium px-2 py-2"
            >
              Pular introdução
            </button>
          )}

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1e3a5f] dark:bg-[#b8893e] text-white dark:text-[#0f1419] text-xs font-bold shadow-md hover:opacity-90 active:scale-95 transition-all"
          >
            <span>{currentSlide === slides.length - 1 ? 'Começar minha jornada' : 'Avançar'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
