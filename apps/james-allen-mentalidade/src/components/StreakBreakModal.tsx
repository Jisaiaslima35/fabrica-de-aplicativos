import React from 'react';
import { useApp } from '../context/AppContext';
import { Flame, RefreshCw, HeartHandshake } from 'lucide-react';

export const StreakBreakModal: React.FC = () => {
  const { streakBreakModalOpen, closeStreakBreakModal, navigateTo, streak } = useApp();

  if (!streakBreakModalOpen) return null;

  const handleRestart = () => {
    closeStreakBreakModal();
    navigateTo('hoje');
  };

  return (
    <div
      id="streak-break-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div
        id="streak-break-modal-content"
        className="w-full max-w-md bg-white dark:bg-[#0f1419] sepia:bg-[#f0e8dc] rounded-3xl border border-slate-200 dark:border-[#1e2836] shadow-2xl p-6 sm:p-7 text-center animate-in zoom-in-95 duration-200"
      >
        <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 dark:bg-amber-950/50 text-[#b8893e] flex items-center justify-center mb-4">
          <Flame className="w-7 h-7 stroke-[2.25px]" />
        </div>

        <h3 className="font-serif text-2xl font-bold text-[#1e3a5f] dark:text-[#f7f4ed] mb-2">
          Quebrou o streak, recomeçar faz parte
        </h3>

        <p className="font-sans text-sm text-stone-600 dark:text-stone-300 leading-relaxed mb-4">
          Na jornada do autodomínio, o que importa não é a perfeição ininterrupta, mas a capacidade serena de retornar ao foco sem culpa ou desânimo.
        </p>

        <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-[#161f2c] sepia:bg-[#ece4d5]/60 text-xs font-serif italic text-stone-800 dark:text-stone-200 mb-6">
          “A força de vontade é a coluna vertebral do caráter. Cada vez que você retoma sua meta, seu caráter se fortalece.”
          <span className="block not-italic font-sans text-[10px] text-[#b8893e] font-semibold mt-1">
            — James Allen
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={handleRestart}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#1e3a5f] text-white text-xs font-bold hover:bg-[#152a45] active:scale-95 transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Recomeçar com foco</span>
          </button>

          <button
            onClick={closeStreakBreakModal}
            className="py-3 px-4 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-slate-100 dark:hover:bg-stone-800 transition-colors"
          >
            Continuar mesmo assim
          </button>
        </div>
      </div>
    </div>
  );
};
