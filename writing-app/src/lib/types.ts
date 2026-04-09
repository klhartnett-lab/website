export type WritingTone = 'playful' | 'serious' | 'experimental'

export interface WritingGoals {
  primaryGoal: string
  /** Optional second line (habit, audience, etc.) */
  context: string
  tone: WritingTone
  /** Target minutes per day (for display / focus timer default) */
  minutesPerDay: number
}

/** Soft scores 0–1 used to bias the next prompt */
export interface Calibration {
  voice: number
  structure: number
  depth: number
}

export type InputMode = 'write' | 'paste' | 'dictate'

export interface SessionFeedback {
  rating: 1 | 2 | 3 | 4 | 5
  note: string
}

export interface WritingSession {
  id: string
  dateKey: string
  promptText: string
  inputMode: InputMode
  body: string
  wordCount: number
  feedback: SessionFeedback | null
  createdAt: string
}

export interface AppStateV1 {
  version: 1
  goals: WritingGoals | null
  calibration: Calibration
  sessions: WritingSession[]
}
