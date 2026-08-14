import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DAYS_CONTENT } from '../data/daysContent';
import confetti from 'canvas-confetti';
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  Check,
} from 'lucide-react';

interface QuizPageProps {
  day: number;
}

export const QuizPage: React.FC<QuizPageProps> = ({ day }) => {
  const { markQuizComplete, navigateTo } = useApp();
  const dayData = DAYS_CONTENT.find((d) => d.day === day) || DAYS_CONTENT[0];
  const questions = dayData.quiz;

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);

  const handleSelectOption = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const isAllAnswered = questions.every((q) => selectedAnswers[q.id]);

  const handleFinishQuiz = async () => {
    await markQuizComplete(day);
    setIsFinished(true);

    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.6 },
      colors: ['#b8893e', '#1e3a5f', '#7a9070'],
    });
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setIsFinished(false);
  };

  return (
    <div id="quiz-page-view" className="max-w-2xl mx-auto space-y-6 pb-24 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateTo('dia', day)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao Texto</span>
        </button>

        <span className="text-xs font-bold uppercase tracking-wider text-[#b8893e] dark:text-[#d4a574]">
          Dia {day} · Quiz de Fixação
        </span>
      </div>

      {/* Quiz Introduction Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111722] sepia:bg-[#ede3d3] border border-slate-200 dark:border-[#1e2836] shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-[#b8893e] flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#1e3a5f] dark:text-[#f7f4ed]">
              Reflexão Guiada · {dayData.title}
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Perguntas para consolidar o entendimento prático, não para mera decoreba.
            </p>
          </div>
        </div>
      </div>

      {/* Question Cards */}
      <div className="space-y-6">
        {questions.map((q, qIndex) => {
          const chosenOptionId = selectedAnswers[q.id];
          const chosenOption = q.options.find((opt) => opt.id === chosenOptionId);

          return (
            <div
              key={q.id}
              className="p-6 rounded-3xl bg-white dark:bg-[#111722] sepia:bg-[#ede3d3] border border-slate-200 dark:border-[#1e2836] shadow-xs space-y-4"
            >
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#1e3a5f]/10 dark:bg-[#b8893e]/20 text-[#1e3a5f] dark:text-[#d4a574] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {qIndex + 1}
                </span>
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 leading-snug">
                  {q.question}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-2.5 pt-1">
                {q.options.map((opt) => {
                  const isSelected = chosenOptionId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(q.id, opt.id)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'bg-amber-50/80 dark:bg-amber-950/40 border-[#b8893e] shadow-2xs'
                          : 'bg-slate-50 dark:bg-[#101620] sepia:bg-[#f5efe5] border-slate-200 dark:border-stone-800 hover:border-slate-300 dark:hover:border-stone-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected
                            ? 'border-[#b8893e] bg-[#b8893e] text-white'
                            : 'border-slate-300 dark:border-stone-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-sm text-stone-800 dark:text-stone-200 font-sans leading-relaxed">
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Reflection Insight after selecting */}
              {chosenOption && (
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-[#1c2838] sepia:bg-[#ece4d5]/60 border-l-3 border-[#b8893e] text-xs leading-relaxed text-stone-800 dark:text-stone-200 animate-in fade-in">
                  <span className="font-bold text-[#b8893e] dark:text-[#e0ad5b] block mb-1">
                    {chosenOption.isKeyInsight ? '💡 Insight de James Allen:' : '💭 Reflexão:'}
                  </span>
                  <p>{chosenOption.reflection}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion Actions */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111722] sepia:bg-[#ede3d3] border border-slate-200 dark:border-[#1e2836] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {!isFinished ? (
          <button
            onClick={handleFinishQuiz}
            disabled={!isAllAnswered}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-[#1e3a5f] hover:bg-[#152a45] text-white text-xs font-bold disabled:opacity-40 shadow-md active:scale-95 transition-all"
          >
            <CheckCircle2 className="w-4 h-4 text-[#e0ad5b]" />
            <span>Concluir Quiz & Registrar</span>
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Quiz Concluído com Sucesso!</span>
            </span>

            <button
              onClick={handleRetake}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refazer</span>
            </button>
          </div>
        )}

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => navigateTo('dia', day)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold hover:bg-stone-200"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Voltar ao Dia {day}</span>
          </button>

          {day < 21 && (
            <button
              onClick={() => navigateTo('dia', day + 1)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#b8893e] text-white text-xs font-bold hover:bg-[#a67b37] shadow-xs"
            >
              <span>Ir para Dia {day + 1}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
