import type {
  AppStateV1,
  Calibration,
  InputMode,
  WritingGoals,
  WritingSession,
} from './types'

const KEY = 'scribe-desk-state-v1'
const DRAFT_KEY = 'scribe-desk-draft-v1'

export interface DraftPayload {
  dateKey: string
  promptText: string
  inputMode: InputMode
  body: string
}

export function loadDraft(): DraftPayload | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as DraftPayload
    if (!p.dateKey || typeof p.body !== 'string') return null
    return p
  } catch {
    return null
  }
}

export function saveDraft(d: DraftPayload): void {
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(d))
}

export function clearDraft(): void {
  sessionStorage.removeItem(DRAFT_KEY)
}

const defaultCalibration = (): Calibration => ({
  voice: 0.5,
  structure: 0.5,
  depth: 0.5,
})

export function loadState(): AppStateV1 {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) {
      return {
        version: 1,
        goals: null,
        calibration: defaultCalibration(),
        sessions: [],
      }
    }
    const parsed = JSON.parse(raw) as AppStateV1
    if (parsed.version !== 1 || !parsed.calibration || !Array.isArray(parsed.sessions)) {
      throw new Error('bad shape')
    }
    return {
      version: 1,
      goals: parsed.goals ?? null,
      calibration: { ...defaultCalibration(), ...parsed.calibration },
      sessions: parsed.sessions,
    }
  } catch {
    return {
      version: 1,
      goals: null,
      calibration: defaultCalibration(),
      sessions: [],
    }
  }
}

export function saveState(state: AppStateV1): void {
  localStorage.setItem(KEY, JSON.stringify(state))
}

export function persistGoals(goals: WritingGoals): void {
  const s = loadState()
  saveState({ ...s, goals })
}

export function persistCalibration(c: Calibration): void {
  const s = loadState()
  saveState({ ...s, calibration: c })
}

export function appendSession(session: WritingSession): void {
  const s = loadState()
  saveState({ ...s, sessions: [session, ...s.sessions] })
}

export function updateSession(
  id: string,
  patch: Partial<Pick<WritingSession, 'body' | 'feedback'>>
): void {
  const s = loadState()
  saveState({
    ...s,
    sessions: s.sessions.map((x) => (x.id === id ? { ...x, ...patch } : x)),
  })
}
