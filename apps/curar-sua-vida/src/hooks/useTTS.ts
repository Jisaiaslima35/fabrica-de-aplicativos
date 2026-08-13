import { useEffect, useRef, useState, useCallback } from 'react'

interface TTSOptions {
  rate?: number
  pitch?: number
  volume?: number
}

interface TTSState {
  isSpeaking: boolean
  isPaused: boolean
  isMuted: boolean
  hasVoice: boolean
  voices: SpeechSynthesisVoice[]
}

interface UseTTSReturn extends TTSState {
  speak: (text: string) => void
  cancel: () => void
  pause: () => void
  resume: () => void
  toggleMute: () => void
  setMuted: (muted: boolean) => void
  isSupported: boolean
}

/**
 * Hook para Text-to-Speech usando Web Speech API nativa.
 * - pt-BR automático
 * - rate 0.95, pitch 1.0, volume 1.0
 * - limpa markdown antes de falar
 * - cancel() automático em nova fala
 */
export function useTTS(options: TTSOptions = {}): UseTTSReturn {
  const {
    rate = 0.95,
    pitch = 1.0,
    volume = 1.0,
  } = options

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const isMountedRef = useRef(true)

  // Carrega vozes (Chrome carrega async)
  useEffect(() => {
    if (!isSupported) return
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices()
      if (v.length > 0) {
        setVoices(v)
      }
    }
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
    return () => {
      if (window.speechSynthesis.onvoiceschanged === loadVoices) {
        window.speechSynthesis.onvoiceschanged = null
      }
    }
  }, [isSupported])

  // Cleanup ao desmontar
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      if (isSupported) {
        try {
          window.speechSynthesis.cancel()
        } catch {}
      }
    }
  }, [isSupported])

  const pickPtBrVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (voices.length === 0) return null
    // Prioridade: pt-BR > pt > primeira voz disponível
    const ptBr = voices.find(v => v.lang === 'pt-BR' || v.lang === 'pt_BR')
    if (ptBr) return ptBr
    const pt = voices.find(v => v.lang.startsWith('pt'))
    if (pt) return pt
    return voices[0]
  }, [voices])

  const cleanTextForSpeech = (text: string): string => {
    return text
      // remove markdown
      .replace(/\*\*([^*]+)\*\*/g, '$1')      // **negrito**
      .replace(/\*([^*]+)\*/g, '$1')          // *itálico*
      .replace(/__([^_]+)__/g, '$1')          // __negrito__
      .replace(/_([^_]+)_/g, '$1')            // _itálico_
      .replace(/^#+\s*/gm, '')                // ### headings
      .replace(/`([^`]+)`/g, '$1')            // `código`
      .replace(/```[\s\S]*?```/g, '')         // ```bloco código```
      // emojis mais comuns (mantém a fala natural)
      .replace(/📖/g, 'página')
      .replace(/🪞/g, 'espelho')
      .replace(/🧘/g, '')
      .replace(/💭/g, '')
      .replace(/✨/g, '')
      .replace(/💜/g, '')
      .replace(/🌿/g, '')
      .replace(/💛/g, '')
      .replace(/🌱/g, '')
      .replace(/🕊/g, '')
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '') // remove emojis restantes
      // markdown links
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // bullets
      .replace(/^\s*[-*+]\s+/gm, '')
      // múltiplas quebras
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  }

  const cancel = useCallback(() => {
    if (!isSupported) return
    try {
      window.speechSynthesis.cancel()
    } catch {}
    if (isMountedRef.current) {
      setIsSpeaking(false)
      setIsPaused(false)
    }
  }, [isSupported])

  const speak = useCallback((text: string) => {
    if (!isSupported) return
    const cleaned = cleanTextForSpeech(text)
    if (!cleaned) return

    // SEMPRE cancela antes de começar (interrupção limpa)
    try {
      window.speechSynthesis.cancel()
    } catch {}

    const u = new SpeechSynthesisUtterance(cleaned)
    const voice = pickPtBrVoice()
    if (voice) u.voice = voice
    u.lang = voice?.lang ?? 'pt-BR'
    u.rate = rate
    u.pitch = pitch
    u.volume = isMuted ? 0 : volume

    u.onstart = () => {
      if (isMountedRef.current) {
        setIsSpeaking(true)
        setIsPaused(false)
      }
    }
    u.onend = () => {
      if (isMountedRef.current) {
        setIsSpeaking(false)
        setIsPaused(false)
      }
    }
    u.onerror = () => {
      if (isMountedRef.current) {
        setIsSpeaking(false)
        setIsPaused(false)
      }
    }
    u.onpause = () => {
      if (isMountedRef.current) setIsPaused(true)
    }
    u.onresume = () => {
      if (isMountedRef.current) setIsPaused(false)
    }

    utteranceRef.current = u
    try {
      window.speechSynthesis.speak(u)
    } catch (e) {
      console.warn('TTS speak error:', e)
    }
  }, [isSupported, pickPtBrVoice, rate, pitch, volume, isMuted])

  const pause = useCallback(() => {
    if (!isSupported) return
    try {
      window.speechSynthesis.pause()
    } catch {}
    if (isMountedRef.current) setIsPaused(true)
  }, [isSupported])

  const resume = useCallback(() => {
    if (!isSupported) return
    try {
      window.speechSynthesis.resume()
    } catch {}
    if (isMountedRef.current) setIsPaused(false)
  }, [isSupported])

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev)
  }, [])

  const setMuted = useCallback((muted: boolean) => {
    setIsMuted(muted)
  }, [])

  const hasVoice = pickPtBrVoice() !== null

  return {
    isSpeaking,
    isPaused,
    isMuted,
    hasVoice,
    voices,
    speak,
    cancel,
    pause,
    resume,
    toggleMute,
    setMuted,
    isSupported,
  }
}

/** Limpa markdown de uma string. Útil pra exibir resposta sem TTS. */
export function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/^#+\s*/gm, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
