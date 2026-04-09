import type { Calibration, SessionFeedback } from './types'

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n))
}

/** Map rating + optional reflection into small adjustments */
export function adjustCalibration(
  prev: Calibration,
  feedback: SessionFeedback,
  wordCount: number
): Calibration {
  const r = (feedback.rating - 3) / 2
  const delta = r * 0.06

  const text = `${feedback.note}`.toLowerCase()
  let voice = prev.voice + delta
  let structure = prev.structure + delta
  let depth = prev.depth + delta

  if (/voice|sound|heard|dialogue|talk|say/.test(text)) voice += 0.04
  if (/outline|structure|section|order|shape|arc/.test(text)) structure += 0.04
  if (/deep|honest|truth|avoid|assumption|feel/.test(text)) depth += 0.04

  if (wordCount < 80) {
    structure += 0.02
    depth -= 0.02
  } else if (wordCount > 400) {
    depth += 0.02
  }

  return {
    voice: clamp01(voice),
    structure: clamp01(structure),
    depth: clamp01(depth),
  }
}

export function quickFeedbackLines(wordCount: number, goalSnippet: string): string[] {
  const g = goalSnippet.slice(0, 80)
  const lines: string[] = []
  if (wordCount === 0) {
    lines.push('No words yet—try a single sentence that names what you want from this session.')
    return lines
  }
  if (wordCount < 120) {
    lines.push('Short burst—good for habit. Next time, add one specific image or line of dialogue tied to your goal.')
  } else if (wordCount > 600) {
    lines.push('Solid length. Consider one cut: remove the sentence that explains the most—let the scene breathe.')
  } else {
    lines.push('Nice middle length. Check whether the opening line earns its place; if not, cut it.')
  }
  if (g) {
    lines.push(`Tie-back: glance at “${g}${goalSnippet.length > 80 ? '…' : ''}”—does the last paragraph echo it?`)
  }
  return lines
}
