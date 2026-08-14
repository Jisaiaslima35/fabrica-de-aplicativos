import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  db,
  getStreakData,
  getAllProgress,
  markDayCompleted as dbMarkDayCompleted,
  markQuizCompleted as dbMarkQuizCompleted,
  updateStreakRecord,
} from '../db';
import type { StreakData } from '../types';

export type AppTheme = 'light' | 'sepia' | 'dark';
export type AppFontSize = 'sm' | 'base' | 'lg' | 'xl';

interface AppContextType {
  currentRoute: string;
  selectedDay: number;
  streak: StreakData;
  completedDays: number[];
  quizCompletedDays: number[];
  theme: AppTheme;
  fontSize: AppFontSize;
  isChatOpen: boolean;
  activeChatDay: number;
  activeChatTitle: string;
  showOnboarding: boolean;
  streakBreakModalOpen: boolean;
  isOnline: boolean;
  setTheme: (theme: AppTheme) => void;
  setFontSize: (size: AppFontSize) => void;
  navigateTo: (route: string, dayParam?: number) => void;
  markDayComplete: (day: number) => Promise<{ streakUpdated: boolean; newStreak: number; isBreakRecovered?: boolean }>;
  markQuizComplete: (day: number) => Promise<void>;
  openMentorChat: (day?: number, dayTitle?: string) => void;
  closeMentorChat: () => void;
  closeOnboarding: () => void;
  openOnboarding: () => void;
  closeStreakBreakModal: () => void;
  getTodayDayNumber: () => number;
  refreshState: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState<string>('home');
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [streak, setStreak] = useState<StreakData>({
    lastDay: 0,
    lastDate: '',
    streakCount: 0,
    longestStreak: 0,
  });
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [quizCompletedDays, setQuizCompletedDays] = useState<number[]>([]);
  const [theme, setThemeState] = useState<AppTheme>(() => {
    return (localStorage.getItem('ja_theme') as AppTheme) || 'light';
  });
  const [fontSize, setFontSizeState] = useState<AppFontSize>(() => {
    return (localStorage.getItem('ja_font_size') as AppFontSize) || 'base';
  });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatDay, setActiveChatDay] = useState(1);
  const [activeChatTitle, setActiveChatTitle] = useState('Pensamento e Caráter');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [streakBreakModalOpen, setStreakBreakModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Sync state from IndexedDB
  const refreshState = useCallback(async () => {
    try {
      const streakRecord = await getStreakData();
      setStreak(streakRecord);

      const allProgress = await getAllProgress();
      const completed = allProgress.filter((p) => p.completed).map((p) => p.day);
      const quizDone = allProgress.filter((p) => p.quizDone).map((p) => p.day);
      setCompletedDays(completed);
      setQuizCompletedDays(quizDone);

      // Check if streak is broken (if lastDate is older than yesterday)
      if (streakRecord.lastDate) {
        const todayStr = new Date().toISOString().split('T')[0];
        const lastDate = new Date(streakRecord.lastDate);
        const todayDate = new Date(todayStr);
        const diffDays = Math.round((todayDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

        if (diffDays > 1 && streakRecord.streakCount > 0) {
          // Streak broken
          setStreakBreakModalOpen(true);
        }
      }

      // Check first time visit for onboarding
      const hasSeenOnboarding = localStorage.getItem('ja_seen_onboarding');
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    } catch (e) {
      console.error('Error refreshing state from db:', e);
    }
  }, []);

  useEffect(() => {
    refreshState();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshState]);

  // Apply theme class to document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'sepia');
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'sepia') {
      root.classList.add('sepia');
    }
  }, [theme]);

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('ja_theme', newTheme);
  };

  const setFontSize = (newSize: AppFontSize) => {
    setFontSizeState(newSize);
    localStorage.setItem('ja_font_size', newSize);
  };

  // Determine current day for "/hoje"
  const getTodayDayNumber = useCallback(() => {
    if (completedDays.length === 0) {
      return 1;
    }
    // Check next incomplete day
    for (let i = 1; i <= 21; i++) {
      if (!completedDays.includes(i)) {
        return i;
      }
    }
    // If all completed, default to 21 or 1
    return 21;
  }, [completedDays]);

  const navigateTo = (route: string, dayParam?: number) => {
    if (route === 'hoje') {
      const targetDay = getTodayDayNumber();
      setSelectedDay(targetDay);
      setCurrentRoute('dia');
    } else if (route === 'dia' && dayParam) {
      setSelectedDay(dayParam);
      setCurrentRoute('dia');
    } else if (route === 'quiz' && dayParam) {
      setSelectedDay(dayParam);
      setCurrentRoute('quiz');
    } else {
      setCurrentRoute(route);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const markDayComplete = async (day: number) => {
    const res = await dbMarkDayCompleted(day);
    await refreshState();
    return res;
  };

  const markQuizComplete = async (day: number) => {
    await dbMarkQuizCompleted(day);
    await refreshState();
  };

  const openMentorChat = (day?: number, dayTitle?: string) => {
    if (day) setActiveChatDay(day);
    if (dayTitle) setActiveChatTitle(dayTitle);
    setIsChatOpen(true);
  };

  const closeMentorChat = () => {
    setIsChatOpen(false);
  };

  const closeOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('ja_seen_onboarding', 'true');
  };

  const openOnboarding = () => {
    setShowOnboarding(true);
  };

  const closeStreakBreakModal = () => {
    setStreakBreakModalOpen(false);
  };

  return (
    <AppContext.Provider
      value={{
        currentRoute,
        selectedDay,
        streak,
        completedDays,
        quizCompletedDays,
        theme,
        fontSize,
        isChatOpen,
        activeChatDay,
        activeChatTitle,
        showOnboarding,
        streakBreakModalOpen,
        isOnline,
        setTheme,
        setFontSize,
        navigateTo,
        markDayComplete,
        markQuizComplete,
        openMentorChat,
        closeMentorChat,
        closeOnboarding,
        openOnboarding,
        closeStreakBreakModal,
        getTodayDayNumber,
        refreshState,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
