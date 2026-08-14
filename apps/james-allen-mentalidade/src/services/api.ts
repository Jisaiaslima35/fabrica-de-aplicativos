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
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

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

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    const data: ChatApiResponse = await res.json();
    return data;
  } catch {
    // Elegant fallback mentor response based on James Allen philosophy
    return {
      day: params.day,
      answer: `Com base nos ensinamentos de James Allen para o **${params.dayTitle}** (📖 Dia ${params.day}):\n\nLembre-se de que cada pensamento que você nutre é uma causa geradora. Diante de "${params.question}", observe a sua mente sem julgamento e pergunte a si mesmo: *este pensamento constrói serenidade ou alimenta a perturbação?*\n\n**Micro-prática do dia:** Respire fundo três vezes e repita em silêncio: *"O homem é o mestre de seu destino na medida em que governa seus próprios pensamentos."*`,
      chunks_count: 1,
      pages: [params.day],
    };
  }
}
