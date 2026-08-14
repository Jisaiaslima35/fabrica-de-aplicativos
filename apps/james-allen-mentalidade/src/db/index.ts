import Dexie, { type Table } from 'dexie';
import type { DayProgress, ReflectionEntry, StreakData, BookmarkEntry } from '../types';

export class MentalidadeDatabase extends Dexie {
  days!: Table<DayProgress, number>;
  reflections!: Table<ReflectionEntry, string>;
  streak!: Table<StreakData, number>;
  bookmarks!: Table<BookmarkEntry, number>;

  constructor() {
    super('JamesAllenMentalidadeDB');
    this.version(1).stores({
      days: 'day, completed, quizDone',
      reflections: 'id, day, createdAt',
      streak: '++id, lastDate',
      bookmarks: 'day, createdAt',
    });
  }
}

export const db = new MentalidadeDatabase();

// Initial database helpers
export async function getStreakData(): Promise<StreakData> {
  const records = await db.streak.toArray();
  if (records.length > 0) {
    return records[0];
  }
  const defaultStreak: StreakData = {
    lastDay: 0,
    lastDate: '',
    streakCount: 0,
    longestStreak: 0,
  };
  const id = await db.streak.add(defaultStreak);
  return { ...defaultStreak, id };
}

export async function updateStreakRecord(data: Partial<StreakData>): Promise<void> {
  const current = await getStreakData();
  if (current.id) {
    await db.streak.update(current.id, data);
  }
}

export async function getAllProgress(): Promise<DayProgress[]> {
  return await db.days.toArray();
}

export async function getDayProgress(day: number): Promise<DayProgress | undefined> {
  return await db.days.get(day);
}

export async function markDayCompleted(day: number): Promise<{ streakUpdated: boolean; newStreak: number; isBreakRecovered?: boolean }> {
  const todayStr = new Date().toISOString().split('T')[0];
  const existing = await db.days.get(day);

  await db.days.put({
    day,
    completed: true,
    completedAt: existing?.completedAt || new Date().toISOString(),
    quizDone: existing?.quizDone || false,
  });

  // Calculate Streak
  const streak = await getStreakData();
  const lastDate = streak.lastDate;
  
  if (!lastDate) {
    // First day completed
    const newStreak = 1;
    await updateStreakRecord({
      lastDay: day,
      lastDate: todayStr,
      streakCount: newStreak,
      longestStreak: Math.max(streak.longestStreak, newStreak),
    });
    return { streakUpdated: true, newStreak };
  }

  if (lastDate === todayStr) {
    // Already did an activity today, maintain count
    await updateStreakRecord({ lastDay: day });
    return { streakUpdated: false, newStreak: streak.streakCount };
  }

  const todayDate = new Date(todayStr);
  const prevDate = new Date(lastDate);
  const diffDays = Math.round((todayDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24));

  if (diffDays === 1) {
    // Consecutive day!
    const newStreak = streak.streakCount + 1;
    await updateStreakRecord({
      lastDay: day,
      lastDate: todayStr,
      streakCount: newStreak,
      longestStreak: Math.max(streak.longestStreak, newStreak),
    });
    return { streakUpdated: true, newStreak };
  } else {
    // Streak broken, reset to 1
    const newStreak = 1;
    await updateStreakRecord({
      lastDay: day,
      lastDate: todayStr,
      streakCount: newStreak,
      longestStreak: streak.longestStreak,
    });
    return { streakUpdated: true, newStreak, isBreakRecovered: true };
  }
}

export async function markQuizCompleted(day: number): Promise<void> {
  const existing = await db.days.get(day);
  await db.days.put({
    day,
    completed: existing?.completed || false,
    completedAt: existing?.completedAt,
    quizDone: true,
  });
}
