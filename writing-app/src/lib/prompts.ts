import type { Calibration, WritingGoals } from './types'

/** Deterministic daily key YYYY-MM-DD in local time */
export function dateKey(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

type Focus = 'voice' | 'structure' | 'depth'

function pickFocus(cal: Calibration): Focus {
  const rolls = [
    { f: 'voice' as const, w: cal.voice },
    { f: 'structure' as const, w: cal.structure },
    { f: 'depth' as const, w: cal.depth },
  ]
  const minW = Math.min(...rolls.map((r) => r.w))
  const candidates = rolls.filter((r) => r.w <= minW + 0.15)
  return candidates[0]?.f ?? 'depth'
}

const TEMPLATES: Record<Focus, string[]> = {
  voice: [
    'Write one scene or memory where someone says something they almost regret. Let dialogue carry the emotion—no more than three lines of setup.',
    'Pick a single object in the room and describe it as if you secretly blame it for something. Keep it under 300 words.',
    'Write in second person (“you”) for the whole piece: a moment you were unfair to yourself. End with one sentence of kindness.',
  ],
  structure: [
    'Use exactly three sections with titles. In each: one concrete image, one question, one forward-looking line tied to: “{goal}”.',
    'Outline in bullets first (5 bullets), then turn only bullets 2 and 4 into prose. Connect them to your goal in one sentence at the end.',
    'Start with the last sentence of the piece, then write toward it. The topic is a small win related to: “{goal}”.',
  ],
  depth: [
    'What assumption about your writing or your topic are you avoiding? Write 250 words that name it, complicate it, then soften it.',
    'Describe the gap between what you want readers to feel and what you usually deliver. One paragraph honest, one paragraph hopeful.',
    'Interview yourself: ask three hard questions about “{goal}”. Answer in a single flowing letter to future-you.',
  ],
}

const TONE_HINT: Record<WritingGoals['tone'], string> = {
  playful: 'Keep a light, mischievous energy—one absurd detail is welcome.',
  serious: 'Hold a steady, sincere tone. No jokes unless they hurt a little.',
  experimental: 'Break one small rule of form (tense, POV, or format) on purpose.',
}

export function buildDailyPrompt(goals: WritingGoals, cal: Calibration, dk: string): string {
  const focus = pickFocus(cal)
  const list = TEMPLATES[focus]
  const idx = hashString(`${dk}|${goals.primaryGoal}|${focus}`) % list.length
  const body = list[idx].replace(/\{goal\}/g, goals.primaryGoal.trim() || 'your writing')
  const tone = TONE_HINT[goals.tone]
  const ctx = goals.context.trim()
    ? `\n\nContext you gave: ${goals.context.trim()}`
    : ''
  return `${body}\n\n${tone}${ctx}`
}
