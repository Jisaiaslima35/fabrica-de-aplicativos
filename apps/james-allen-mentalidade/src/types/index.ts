export interface DayContent {
  day: number;
  title: string;
  module: string;
  modulePart: string;
  keyQuote: string;
  content: string;
  wordCount: number;
  reflectionPrompt: string;
  quiz: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    reflection: string;
    isKeyInsight?: boolean;
  }[];
}

export interface DayProgress {
  day: number;
  completed: boolean;
  completedAt?: string;
  quizDone?: boolean;
}

export interface ReflectionEntry {
  id: string;
  day: number;
  text: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StreakData {
  id?: number;
  lastDay: number;
  lastDate: string; // YYYY-MM-DD
  streakCount: number;
  longestStreak: number;
}

export interface BookmarkEntry {
  day: number;
  note?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'mentor';
  text: string;
  day?: number;
  dayTitle?: string;
  pages?: number[];
  timestamp: string;
}

export interface ContentApiResponse {
  day: number;
  title: string;
  content: string;
  pages?: number[];
  word_count?: number;
}

export interface ChatApiResponse {
  answer: string;
  pages?: number[];
  chunks_count?: number;
  day: number;
}
