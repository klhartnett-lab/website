import { useCallback, useMemo, useState } from 'react'
import type { AppStateV1 } from './lib/types'
import { GoalsForm } from './components/GoalsForm'
import { WritingDesk } from './components/WritingDesk'
import { buildDailyPrompt, dateKey } from './lib/prompts'
import { loadState, persistGoals } from './lib/storage'
import type { WritingGoals } from './lib/types'
import './App.css'

export default function App() {
  const [state, setState] = useState<AppStateV1>(() => loadState())
  const [editGoalsOpen, setEditGoalsOpen] = useState(false)
  const refreshState = useCallback(() => setState(loadState()), [])
  const dk = useMemo(() => dateKey(), [])
  const goals = state.goals

  const promptText = useMemo(() => {
    if (!goals) return ''
    return buildDailyPrompt(goals, state.calibration, dk)
  }, [goals, state.calibration, dk])

  const onSaveGoals = useCallback((g: WritingGoals) => {
    persistGoals(g)
    refreshState()
    setEditGoalsOpen(false)
  }, [refreshState])

  const onCalibrationSaved = useCallback(() => {
    refreshState()
  }, [refreshState])

  if (!goals) {
    return (
      <div className="app-shell">
        <header className="app-hero">
          <p className="eyebrow">Scribe Desk</p>
          <h1 className="app-title large">A calm space for daily writing</h1>
          <p className="lead">
            Set your goal, get one tailored prompt per day, write here or paste from a doc—or
            dictate after writing by hand. Quick feedback shapes the next prompt.
          </p>
        </header>
        <GoalsForm onSave={onSaveGoals} />
      </div>
    )
  }

  return (
    <div className="app-shell wide">
      <WritingDesk
        key={promptText}
        goals={goals}
        promptText={promptText}
        dateKey={dk}
        onCalibrationSaved={onCalibrationSaved}
        onEditGoals={() => setEditGoalsOpen(true)}
      />
      {editGoalsOpen && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="goals-edit-title"
        >
          <div className="modal card">
            <h2 id="goals-edit-title" className="card-title">
              Edit goals
            </h2>
            <GoalsForm initial={goals} onSave={onSaveGoals} />
            <button
              type="button"
              className="btn ghost modal-close"
              onClick={() => setEditGoalsOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
