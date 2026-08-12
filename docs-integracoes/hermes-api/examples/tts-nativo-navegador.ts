// =============================================================================
// TTS NATIVO - Web Speech API (speechSynthesis)
// =============================================================================
// Quando o Professor IA responde, o texto é falado automaticamente em PT-BR.
// Funciona em Chrome, Edge, Safari, Firefox (parcial). Sem API key, sem custo.
// =============================================================================

class ProfessorTTS {
  private synth = window.speechSynthesis
  private voice: SpeechSynthesisVoice | null = null
  private enabled = true
  private currentUtterance: SpeechSynthesisUtterance | null = null

  constructor() {
    // Carrega vozes quando disponíveis (alguns browsers demoram)
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => this.loadVoice()
    }
    this.loadVoice()
  }

  // Seleciona a melhor voz em português do Brasil
  private loadVoice(): void {
    const voices = this.synth.getVoices()
    if (voices.length === 0) return

    // Prioridade: pt-BR nativa > pt-BR qualquer > pt qualquer > primeira
    this.voice =
      voices.find(v => v.lang === 'pt-BR' && v.localService) ||
      voices.find(v => v.lang === 'pt-BR') ||
      voices.find(v => v.lang.startsWith('pt')) ||
      voices[0]

    console.log('🔊 TTS voz carregada:', this.voice?.name, this.voice?.lang)
  }

  // Liga/desliga (botão de mute)
  toggle(): boolean {
    this.enabled = !this.enabled
    if (!this.enabled) this.stop()
    return this.enabled
  }

  isEnabled(): boolean {
    return this.enabled
  }

  // Para qualquer fala em andamento
  stop(): void {
    if (this.synth.speaking) {
      this.synth.cancel()
    }
    this.currentUtterance = null
  }

  // Fala um texto em PT-BR
  speak(text: string): void {
    if (!this.enabled || !text) return

    // Para fala anterior (evita sobreposição)
    this.stop()

    // Limpa markdown/emoji antes de falar (sintaxe não deve ser falada)
    const cleanText = this.cleanForSpeech(text)
    if (!cleanText) return

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.voice = this.voice
    utterance.lang = 'pt-BR'
    utterance.rate = 0.95   // Levemente mais lento (didático)
    utterance.pitch = 1.0   // Tom neutro
    utterance.volume = 1.0

    utterance.onend = () => {
      this.currentUtterance = null
    }

    utterance.onerror = (e) => {
      console.warn('TTS erro:', e.error)
      this.currentUtterance = null
    }

    this.currentUtterance = utterance
    this.synth.speak(utterance)
  }

  // Remove markdown e emojis antes de falar
  private cleanForSpeech(text: string): string {
    return text
      // Remove markdown básico
      .replace(/\*\*([^*]+)\*\*/g, '$1')     // **bold**
      .replace(/\*([^*]+)\*/g, '$1')         // *italic*
      .replace(/~~([^~]+)~~/g, '$1')         // ~~strike~~
      .replace(/`([^`]+)`/g, '$1')           // `code`
      .replace(/^#{1,6}\s+/gm, '')           // ## headers
      // Remove emojis comuns
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')  // símbolos/emoji
      .replace(/[\u{2600}-\u{26FF}]/gu, '')    // misc symbols
      .replace(/[\u{2700}-\u{27BF}]/gu, '')    // dingbats
      .replace(/[\u{1F000}-\u{1F02F}]/gu, '')  // mahjong
      .replace(/[\u{1F0A0}-\u{1F0FF}]/gu, '')  // playing cards
      // Remove múltiplas quebras de linha
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  }

  // Pausa/retoma (nem todos browsers suportam)
  pause(): void {
    if (this.synth.speaking) this.synth.pause()
  }

  resume(): void {
    if (this.synth.paused) this.synth.resume()
  }

  isSpeaking(): boolean {
    return this.synth.speaking
  }
}

// =============================================================================
// INTEGRAÇÃO COM O CHAT
// =============================================================================

const tts = new ProfessorTTS()

// Após receber resposta da API:
async function onProfessorResponse(answer: string) {
  renderMessage(answer)              // mostra na UI
  tts.speak(answer)                  // fala automaticamente
}

// Botão de mute (UI):
function toggleMuteButton() {
  const enabled = tts.toggle()
  muteBtn.textContent = enabled ? '🔊 Som' : '🔇 Mudo'
}

// Cleanup ao sair da página:
window.addEventListener('beforeunload', () => {
  tts.stop()
})

// =============================================================================
// NOTAS IMPORTANTES
// =============================================================================
// 1. PRIMEIRO CLIQUE: o navegador exige interação do usuário antes de falar
//    (política de autoplay). Após o primeiro click no botão "Enviar", funciona.
// 2. iOS Safari: limitado a ~15s de fala contínua. Funciona, mas pode cortar.
// 3. Algumas vozes pt-BR soam robotizadas. Edge/Chrome têm "Microsoft Maria"
//    ou "Google português do Brasil" (melhores).
// 4. Sem internet? Funciona igual - Web Speech API é 100% client-side.
//
// =============================================================================