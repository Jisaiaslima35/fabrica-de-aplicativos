import { DAYS_CONTENT } from '../data/daysContent';
import type { ContentApiResponse, ChatApiResponse, DayContent } from '../types';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://preview.automacaojs.us/james-allen-mentalidade/api';

export async function checkApiHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${API_BASE_URL}/health`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchDayContentFromApi(day: number): Promise<DayContent> {
  const localDay = DAYS_CONTENT.find((d) => d.day === day) || DAYS_CONTENT[0];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${API_BASE_URL}/content/${day}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data: ContentApiResponse = await res.json();
      return {
        ...localDay,
        title: data.title || localDay.title,
        content: data.content || localDay.content,
        wordCount: data.word_count || localDay.wordCount,
      };
    }
  } catch {
    // Network or API failure, gracefully fall back to rich local content
  }

  return localDay;
}

export async function sendMentorQuestion(params: {
  question: string;
  day: number;
  dayTitle: string;
}): Promise<ChatApiResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    console.log('[Mentor API] Sending question to backend:', {
      url: `${API_BASE_URL}/chat`,
      day: params.day,
      questionLen: params.question.length,
    });

    const res = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: params.question,
        day: params.day,
        day_title: params.dayTitle,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    console.log('[Mentor API] HTTP status:', res.status);

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    const data: ChatApiResponse = await res.json();
    console.log('[Mentor API] Got answer, length:', data.answer?.length);
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    console.error('[Mentor API] Error:', err);
    // Sem fallback mockado. Devolve um sinal claro para o MentorChatDrawer renderizar msg de erro.
    return {
      day: params.day,
      answer: '',
      chunks_count: 0,
      pages: [],
      error: err instanceof Error ? err.message : String(err),
    } as ChatApiResponse & { error?: string };
  }
}
