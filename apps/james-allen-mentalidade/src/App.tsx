import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { MentorChatDrawer } from './components/MentorChatDrawer';
import { QuoteCardShareModal } from './components/QuoteCardShareModal';
import { OnboardingModal } from './components/OnboardingModal';
import { StreakBreakModal } from './components/StreakBreakModal';
import { InstallPrompt } from './components/InstallPrompt';
import { HomePage } from './pages/HomePage';
import { DayReaderPage } from './pages/DayReaderPage';
import { QuizPage } from './pages/QuizPage';
import { JourneyMapPage } from './pages/JourneyMapPage';
import { ReflectionsPage } from './pages/ReflectionsPage';
import { AboutPage } from './pages/AboutPage';
import { MessageSquare, Sparkles } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60, // 1 hour revalidation as requested
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent: React.FC = () => {
  const { currentRoute, selectedDay, openMentorChat } = useApp();

  // Share Modal State
  const [shareModalData, setShareModalData] = useState<{
    isOpen: boolean;
    day: number;
    title: string;
    quote: string;
  }>({
    isOpen: false,
    day: 1,
    title: '',
    quote: '',
  });

  const handleOpenShareModal = (day: number, title: string, quote: string) => {
    setShareModalData({
      isOpen: true,
      day,
      title,
      quote,
    });
  };

  const handleCloseShareModal = () => {
    setShareModalData((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0b0f17] sepia:bg-[#f5ecd8] text-slate-900 dark:text-[#f7f4ed] sepia:text-[#3a2e1e] transition-colors duration-200">
      {/* Header */}
      <Header />

      {/* Install Smart Prompt */}
      <InstallPrompt />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-6">
        {currentRoute === 'home' && (
          <HomePage onOpenShareModal={handleOpenShareModal} />
        )}
        {currentRoute === 'dia' && (
          <DayReaderPage
            day={selectedDay}
            onOpenShareModal={handleOpenShareModal}
          />
        )}
        {currentRoute === 'quiz' && <QuizPage day={selectedDay} />}
        {currentRoute === 'mapa' && <JourneyMapPage />}
        {currentRoute === 'reflexao' && <ReflectionsPage />}
        {currentRoute === 'sobre' && <AboutPage />}
      </main>

      {/* Global Floating Action Button (FAB) for Mentor Chat */}
      <button
        id="global-mentor-fab"
        onClick={() => openMentorChat(selectedDay)}
        className="fixed right-5 bottom-20 z-30 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-[#1e3a5f] to-[#14263e] dark:from-[#b8893e] dark:to-[#8c6527] text-white dark:text-[#0f1419] font-bold text-xs shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all border border-[#b8893e]/40"
        aria-label="Perguntar ao Professor Mentor"
      >
        <MessageSquare className="w-4 h-4 text-[#e0ad5b] dark:text-[#0f1419]" />
        <span className="hidden sm:inline">Perguntar ao Mentor</span>
      </button>

      {/* Fixed Bottom Navigation */}
      <BottomNav />

      {/* Overlays & Modals */}
      <MentorChatDrawer />
      <OnboardingModal />
      <StreakBreakModal />
      <QuoteCardShareModal
        isOpen={shareModalData.isOpen}
        onClose={handleCloseShareModal}
        day={shareModalData.day}
        title={shareModalData.title}
        quote={shareModalData.quote}
      />
    </div>
  );
};

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
