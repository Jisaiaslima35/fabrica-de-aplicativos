import React from 'react';
import { useApp } from '../context/AppContext';
import { BookOpen, Compass, BookMarked, Info, Sparkles } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { currentRoute, navigateTo, getTodayDayNumber, completedDays } = useApp();

  const todayNum = getTodayDayNumber();
  const isTodayComplete = completedDays.includes(todayNum);

  const navItems = [
    {
      id: 'hoje',
      label: 'Hoje',
      icon: BookOpen,
      badge: !isTodayComplete ? 'Dia ' + todayNum : undefined,
      isActive: currentRoute === 'dia' || currentRoute === 'hoje' || currentRoute === 'quiz',
      action: () => navigateTo('hoje'),
    },
    {
      id: 'mapa',
      label: 'Mapa',
      icon: Compass,
      isActive: currentRoute === 'mapa',
      action: () => navigateTo('mapa'),
    },
    {
      id: 'reflexao',
      label: 'Diário',
      icon: BookMarked,
      isActive: currentRoute === 'reflexao',
      action: () => navigateTo('reflexao'),
    },
    {
      id: 'sobre',
      label: 'Sobre',
      icon: Info,
      isActive: currentRoute === 'sobre',
      action: () => navigateTo('sobre'),
    },
  ];

  return (
    <nav
      id="bottom-navigation-bar"
      className="fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-lg bg-white/95 dark:bg-[#0b0f17]/95 sepia:bg-[#f5ecd8]/95 border-slate-200 dark:border-[#1e2836] sepia:border-[#ded3c2] safe-area-pb"
      aria-label="Navegação principal"
    >
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              id={`nav-btn-${item.id}`}
              onClick={item.action}
              className={`flex flex-col items-center justify-center flex-1 h-full relative py-1 transition-all group ${
                item.isActive
                  ? 'text-[#1e3a5f] dark:text-[#d4a574] font-semibold'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
              aria-label={item.label}
              aria-current={item.isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${item.isActive ? 'stroke-[2.25px]' : 'stroke-2'}`} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-3 px-1 py-0.2 text-[9px] font-bold bg-[#b8893e] text-white rounded-full leading-tight">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] tracking-wide mt-1">
                {item.label}
              </span>
              {item.isActive && (
                <span className="absolute bottom-1 w-6 h-0.5 rounded-full bg-[#1e3a5f] dark:bg-[#d4a574]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
