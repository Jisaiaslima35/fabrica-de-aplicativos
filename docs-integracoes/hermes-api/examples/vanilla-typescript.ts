// Exemplo completo de integração com Hermes API - vanilla TypeScript
// Para usar em React, Vue, Svelte ou Vanilla JS

const API_BASE = 'https://preview.automacaojs.us/21-dias-gratidao/api'

// ============================================================================
// 1. Health check
// ============================================================================
async function checkHealth(): Promise<boolean> {
  try {
    const r = await fetch(`${API_BASE}/health`)
    return r.ok
  } catch {
    return false
  }
}

// ============================================================================
// 2. Carregar conteúdo do dia do livro
// ============================================================================
interface DayContent {
  day: number
  content: string
  pages: number[]
}

async function loadDayContent(day: number): Promise<DayContent | null> {
  try {
    const r = await fetch(`${API_BASE}/content/${day}`)
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return await r.json()
  } catch (e) {
    console.error('Erro ao carregar conteúdo:', e)
    return null
  }
}

// ============================================================================
// 3. Perguntar ao Professor IA (síncrono, ~6-15s)
// ============================================================================
interface ChatResponse {
  answer: string
  pages: number[]
  chunks_count: number
}

async function askProfessor(
  question: string,
  day: number,
  dayTitle: string,
  dayContent?: string
): Promise<ChatResponse> {
  const ctrl = new AbortController()
  const timeout = setTimeout(() => ctrl.abort(), 60000)

  try {
    const r = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        day,
        day_title: dayTitle,
        day_content: dayContent || '', // vazio = backend busca sozinho
      }),
      signal: ctrl.signal,
    })

    if (!r.ok) {
      const err = await r.json()
      throw new Error(err.error || `HTTP ${r.status}`)
    }

    return await r.json()
  } catch (e: any) {
    if (e.name === 'AbortError') {
      return {
        answer: '⏱️ O Professor demorou demais. Tenta de novo?',
        pages: [],
        chunks_count: 0,
      }
    }
    return {
      answer: '🤖 Tô com uma dificuldade técnica. Já volto! 🙏',
      pages: [],
      chunks_count: 0,
    }
  } finally {
    clearTimeout(timeout)
  }
}

// ============================================================================
// 4. Gerenciador de chat com histórico
// ============================================================================
interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  pages?: number[]
  timestamp: string
}

class ProfessorChat {
  private messages: ChatMessage[] = []
  private currentDay: number
  private currentDayTitle: string

  constructor(day: number, dayTitle: string) {
    this.currentDay = day
    this.currentDayTitle = dayTitle
  }

  async send(text: string): Promise<ChatMessage> {
    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    }

    this.messages.push(userMsg)
    this.emit('message', userMsg)

    const loadingMsg: ChatMessage = {
      role: 'assistant',
      content: 'Tô pensando aqui... 🙏',
      timestamp: new Date().toISOString(),
    }
    this.messages.push(loadingMsg)
    this.emit('message', loadingMsg)

    const response = await askProfessor(
      text,
      this.currentDay,
      this.currentDayTitle
    )

    const aiMsg: ChatMessage = {
      role: 'assistant',
      content: response.answer,
      pages: response.pages,
      timestamp: new Date().toISOString(),
    }

    this.messages[this.messages.length - 1] = aiMsg
    this.emit('message', aiMsg)

    return aiMsg
  }

  private listeners: Array<(msg: ChatMessage) => void> = []

  onMessage(fn: (msg: ChatMessage) => void) {
    this.listeners.push(fn)
  }

  private emit(event: string, data: any) {
    if (event === 'message') {
      this.listeners.forEach(fn => fn(data))
    }
  }

  getMessages(): ChatMessage[] {
    return this.messages
  }
}

// ============================================================================
// 5. Exemplo de uso no DOM
// ============================================================================
async function renderDay(day: number) {
  const content = await loadDayContent(day)
  if (content) {
    console.log(`Dia ${day} - ${content.pages.length} página(s)`)
    console.log(content.content.slice(0, 200) + '...')
  }
}

async function exampleFlow() {
  // 1. Renderiza texto do dia
  await renderDay(5)

  // 2. Inicia chat
  const chat = new ProfessorChat(5, 'Primeiro anjo da guarda')
  chat.onMessage((msg) => {
    console.log(`[${msg.role}] ${msg.content}`)
    if (msg.pages) console.log(`  Páginas: ${msg.pages.join(', ')}`)
  })

  // 3. Envia pergunta
  await chat.send('Qual o exercício do Dia 5?')
}

// ============================================================================
// Run
// ============================================================================
// exampleFlow()
