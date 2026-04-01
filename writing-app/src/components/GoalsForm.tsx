import { useState, type FormEvent } from 'react'
import type { WritingGoals, WritingTone } from '../lib/types'

const tones: { value: WritingTone; label: string }[] = [
  { value: 'playful', label: 'Playful' },
  { value: 'serious', label: 'Serious' },
  { value: 'experimental', label: 'Experimental' },
]

type Props = {
  initial?: WritingGoals | null
  onSave: (g: WritingGoals) => void
}

export function GoalsForm({ initial, onSave }: Props) {
  const [primaryGoal, setPrimaryGoal] = useState(initial?.primaryGoal ?? '')
  const [context, setContext] = useState(initial?.context ?? '')
  const [tone, setTone] = useState<WritingTone>(initial?.tone ?? 'serious')
  const [minutesPerDay, setMinutesPerDay] = useState(initial?.minutesPerDay ?? 30)

  function submit(e: FormEvent) {
    e.preventDefault()
    const pg = primaryGoal.trim()
    if (!pg) return
    onSave({
      primaryGoal: pg,
      context: context.trim(),
      tone,
      minutesPerDay: Math.max(5, Math.min(180, minutesPerDay || 30)),
    })
  }

  return (
    <form className="card goals-form" onSubmit={submit}>
      <h2 className="card-title">Your writing goals</h2>
      <p className="card-lead">
        This drives your daily prompts and how the app nudges your next exercise. You can
        change this anytime.
      </p>
      <label className="field">
        <span className="field-label">Primary goal</span>
        <textarea
          className="input"
          rows={3}
          required
          value={primaryGoal}
          onChange={(e) => setPrimaryGoal(e.target.value)}
          placeholder="e.g. Finish a draft of my novel’s second act, or publish one essay per month."
        />
      </label>
      <label className="field">
        <span className="field-label">Context (optional)</span>
        <textarea
          className="input"
          rows={2}
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Audience, genre, deadlines, or habits you’re building."
        />
      </label>
      <div className="field-row">
        <label className="field">
          <span className="field-label">Tone for prompts</span>
          <select
            className="input select"
            value={tone}
            onChange={(e) => setTone(e.target.value as WritingTone)}
          >
            {tones.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">Target minutes / day</span>
          <input
            className="input"
            type="number"
            min={5}
            max={180}
            value={minutesPerDay}
            onChange={(e) => setMinutesPerDay(Number(e.target.value))}
          />
        </label>
      </div>
      <button type="submit" className="btn primary">
        Save and continue
      </button>
    </form>
  )
}
