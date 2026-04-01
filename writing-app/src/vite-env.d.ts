/// <reference types="vite/client" />

/** Web Speech API — not in all TS lib versions */
interface SpeechRecognitionResultLike {
  [index: number]: { transcript: string }
  length: number
}

interface SpeechRecognitionEventLike {
  resultIndex: number
  results: SpeechRecognitionResultLike[]
}

interface SpeechRecognitionAlternative extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  start(): void
  stop(): void
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null
  onerror: ((ev: Event) => void) | null
}

interface Window {
  SpeechRecognition?: new () => SpeechRecognitionAlternative
  webkitSpeechRecognition?: new () => SpeechRecognitionAlternative
}
