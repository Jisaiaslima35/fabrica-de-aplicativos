import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  BookOpen,
  Brain,
  ShieldCheck,
  Smartphone,
  Flame,
  CheckCircle2,
  Clock,
  Compass,
  ArrowRight,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { navigateTo, openOnboarding } = useApp();

  const futureSuggestions = [
    {
      title: 'Notificações Diárias Inteligentes (Push Notifications)',
      desc: 'Lembrete matinal personalizado para iniciar a leitura antes que as distrações tomem conta do dia.',
    },
    {
      title: 'Narração Completa em Audiolivro Humanizado',
      desc: 'Faixas de áudio imersivas com trilha ambiente binaural e voz natural gravada para ouvir em caminhadas.',
    },
    {
      title: 'Rastreador de Hábitos Mentais (Habit Matrix)',
      desc: 'Contador diário de pausas conscientes para dizer mentalmente "Paz, fique quieto!".',
    },
    {
      title: 'Modo Foco / Retiro Digital (Pomodoro Meditativo)',
      desc: 'Timer de silêncio de 5 minutos após a leitura para fixação contemplativa antes de responder ao quiz.',
    },
  ];

  return (
    <div id="about-page-view" className="max-w-3xl mx-auto space-y-8 pb-24 animate-in fade-in duration-300">
      {/* Hero Card */}
      <section className="p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-[#1e3a5f] to-[#122338] text-white border border-[#b8893e]/30 shadow-md">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#b8893e]/20 text-[#d4a574] mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Filosofia & Missão
        </span>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold leading-tight mb-3">
          James Allen: Mentalidade
        </h1>

        <p className="font-serif text-lg italic text-[#e0ad5b] leading-relaxed mb-6">
          “Moldar a mente pelo pensamento. 21 dias para cultivar disciplina mental, sair do piloto automático e assumir responsabilidade pelo que você pensa — porque o homem é aquilo que ele pensa.”
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigateTo('hoje')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#b8893e] hover:bg-[#a67b37] text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span>Acessar Leitura de Hoje</span>
          </button>

          <button
            onClick={openOnboarding}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-stone-200 text-xs font-semibold backdrop-blur-xs transition-colors"
          >
            <Compass className="w-4 h-4 text-[#d4a574]" />
            <span>Rever Onboarding</span>
          </button>
        </div>
      </section>

      {/* The Core Work & Public Domain */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111722] sepia:bg-[#ede3d3] border border-slate-200 dark:border-[#1e2836] shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-[#b8893e] flex items-center justify-center">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-[#1e3a5f] dark:text-[#f7f4ed]">
              Sobre a Obra & James Allen
            </h2>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              Obra em domínio público (publicada originalmente em 1902)
            </span>
          </div>
        </div>

        <p className="font-sans text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
          Publicado pelo filósofo e escritor britânico James Allen em 1902 sob o título original <em>As a Man Thinketh</em>, este tratado tornou-se um dos pilares universais da auto-responsabilidade e do desenvolvimento interior.
        </p>

        <p className="font-sans text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
          A tese central de Allen é simples, desprovida de misticismos superficiais: <strong>a mente é como um jardim fértil</strong>. Se você planta pensamentos de coragem, propósito, retidão e calma, colhe uma vida digna e equilibrada. Se abandona o jardim, as ervas daninhas da ansiedade, da queixa e do medo tomarão conta naturalmente.
        </p>
      </section>

      {/* 8 Thematic Pillars */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111722] sepia:bg-[#ede3d3] border border-slate-200 dark:border-[#1e2836] shadow-xs space-y-4">
        <h2 className="font-serif text-xl font-bold text-[#1e3a5f] dark:text-[#f7f4ed]">
          Os 8 Pilares dos 21 Dias
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-700 dark:text-stone-300">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#101620] sepia:bg-[#e6dcce] border border-slate-200 dark:border-[#223044]">
            <strong className="font-serif text-sm text-[#1e3a5f] dark:text-[#d4a574] block mb-1">
              1. Pensamento e Caráter (Dias 1 a 3)
            </strong>
            O caráter é a soma completa dos pensamentos acumulados dia após dia.
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#101620] sepia:bg-[#e6dcce] border border-slate-200 dark:border-[#223044]">
            <strong className="font-serif text-sm text-[#1e3a5f] dark:text-[#d4a574] block mb-1">
              2. O Jardim Mental (Dias 4 e 5)
            </strong>
            As circunstâncias não fazem o homem; apenas revelam seu cultivo interior.
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#101620] sepia:bg-[#e6dcce] border border-slate-200 dark:border-[#223044]">
            <strong className="font-serif text-sm text-[#1e3a5f] dark:text-[#d4a574] block mb-1">
              3. Pensamento e Circunstâncias (Dias 6 a 8)
            </strong>
            A lei infalível de causa e efeito e a superação do sofrimento por antecipação.
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#101620] sepia:bg-[#e6dcce] border border-slate-200 dark:border-[#223044]">
            <strong className="font-serif text-sm text-[#1e3a5f] dark:text-[#d4a574] block mb-1">
              4. Pensamento e Saúde (Dias 9 e 10)
            </strong>
            O corpo como servo da mente; como pensamentos de calma restauram o vigor.
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#101620] sepia:bg-[#e6dcce] border border-slate-200 dark:border-[#223044]">
            <strong className="font-serif text-sm text-[#1e3a5f] dark:text-[#d4a574] block mb-1">
              5. Pensamento e Propósito (Dias 11 a 13)
            </strong>
            A força de vontade como coluna vertebral que ancora o pensamento a metas nobres.
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#101620] sepia:bg-[#e6dcce] border border-slate-200 dark:border-[#223044]">
            <strong className="font-serif text-sm text-[#1e3a5f] dark:text-[#d4a574] block mb-1">
              6. O Fator na Realização (Dias 14 a 16)
            </strong>
            A responsabilidade individual inescapável e o papel da humildade na sabedoria.
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#101620] sepia:bg-[#e6dcce] border border-slate-200 dark:border-[#223044]">
            <strong className="font-serif text-sm text-[#1e3a5f] dark:text-[#d4a574] block mb-1">
              7. Visões e Ideais (Dias 17 e 18)
            </strong>
            Os sonhadores como salvadores do mundo; manter o ideal aceso no coração.
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#101620] sepia:bg-[#e6dcce] border border-slate-200 dark:border-[#223044]">
            <strong className="font-serif text-sm text-[#1e3a5f] dark:text-[#d4a574] block mb-1">
              8. A Mente em Harmonia (Dias 19 a 21)
            </strong>
            A calma como suprema joia da sabedoria: "Diga ao seu coração: Paz, fique quieto!".
          </div>
        </div>
      </section>

      {/* Suggested Future Enhancements Roadmap */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111722] sepia:bg-[#ede3d3] border border-slate-200 dark:border-[#1e2836] shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-[#b8893e] flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-[#1e3a5f] dark:text-[#f7f4ed]">
              Roadmap de Melhorias Futuras
            </h2>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              Próximos passos para evolução contínua da experiência
            </span>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {futureSuggestions.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-[#101620] sepia:bg-[#f3ede1] border border-slate-200 dark:border-[#243346] flex items-start gap-3"
            >
              <div className="w-6 h-6 rounded-full bg-[#1e3a5f]/10 dark:bg-[#b8893e]/20 text-[#1e3a5f] dark:text-[#d4a574] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <div>
                <h4 className="font-sans font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                  {item.title}
                </h4>
                <p className="font-sans text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
