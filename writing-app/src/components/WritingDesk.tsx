import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { InputMode, SessionFeedback, WritingGoals } from '../lib/types'
import { quickFeedbackLines } from '../lib/calibrate'
import { newId } from '../lib/id'
import {
  appendSession,
  clearDraft,
  loadDraft,
  loadState,
  persistCalibration,
  saveDraft,
} from '../lib/storage'
import { adjustCalibration } from '../lib/calibrate'
import type { WritingSession } from '../lib/types'
import { FocusTimer } from './FocusTimer'

type Props = {
  goals: WritingGoals
  promptText: string
  dateKey: string
  onCalibrationSaved: () => void
  onEditGoals: () => void
}

function countWords(s: string): number {
  const t = s.trim()
  if (!t) return 0
  return t.split(/\s+/).length
}

export function WritingDesk({
  goals,
  promptText,
  dateKey,
  onCalibrationSaved,
  onEditGoals,
}: Props) {
  const [inputMode, setInputMode] = useState<InputMode>(() => {
    const d = loadDraft()
    if (d && d.dateKey === dateKey && d.promptText === promptText) return d.inputMode
    return 'write'
  })
  const [body, setBody] = useState(() => {
    const d = loadDraft()
    if (d && d.dateKey === dateKey && d.promptText === promptText) return d.body
    return ''
  })
  const [rating, setRating] = useState<SessionFeedback['rating']>(3)
  const [note, setNote] = useState('')
  const [lastSavedId, setLastSavedId] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (draftTimer.current) clearTimeout(draftTimer.current)
    draftTimer.current = setTimeout(() => {
      saveDraft({
        dateKey,
        promptText,
        inputMode,
        body,
      })
    }, 400)
    return () => {
      if (draftTimer.current) clearTimeout(draftTimer.current)
    }
  }, [body, dateKey, promptText, inputMode])

  const wordCount = useMemo(() => countWords(body), [body])
  const feedbackPreview = useMemo(
    () => quickFeedbackLines(wordCount, goals.primaryGoal),
    [wordCount, goals.primaryGoal]
  )

  const startDictation = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      setStatus('Speech recognition is not available in this browser. Try Chrome or Edge, or paste text instead.')
      return
    }
    const rec = new SR()
    rec.lang = navigator.language || 'en-US'
    rec.continuous = true
    rec.interimResults = true
    rec.onresult = (ev) => {
      let chunk = ''
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        chunk += ev.results[i][0].transcript
      }
      setBody((prev) => (prev && !prev.endsWith(' ') ? `${prev} ${chunk}` : `${prev}${chunk}`))
    }
    rec.onerror = () => {
      setStatus('Dictation stopped or hit an error. You can paste or type instead.')
    }
    rec.start()
    setInputMode('dictate')
    setStatus('Listening… speak clearly. Pause the tab’s mic in the browser if you need to stop.')
  }, [])

  async function shareExcerpt() {
    const snippet = body.trim().slice(0, 280)
    if (!snippet) {
      setStatus('Write something first, then share a short excerpt.')
      return
    }
    const text = `${snippet}${body.length > 280 ? '…' : ''}`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Writing excerpt', text })
      } else {
        await navigator.clipboard.writeText(text)
        setStatus('Copied an excerpt to your clipboard.')
      }
    } catch {
      setStatus('Could not share. You can select and copy from the editor.')
    }
  }

  function saveSession() {
    const session: WritingSession = {
      id: newId(),
      dateKey,
      promptText,
      inputMode,
      body,
      wordCount,
      feedback: { rating, note: note.trim() },
      createdAt: new Date().toISOString(),
    }
    appendSession(session)
    const state = loadState()
    const next = adjustCalibration(state.calibration, session.feedback!, wordCount)
    persistCalibration(next)
    clearDraft()
    setLastSavedId(session.id)
    setNote('')
    setStatus('Session saved. Tomorrow’s prompt will use your feedback.')
    onCalibrationSaved()
  }

  function saveWithoutFeedback() {
    const session: WritingSession = {
      id: newId(),
      dateKey,
      promptText,
      inputMode,
      body,
      wordCount,
      feedback: null,
      createdAt: new Date().toISOString(),
    }
    appendSession(session)
    clearDraft()
    setLastSavedId(session.id)
    setStatus('Session saved (no rating). Add a rating next time to tune prompts.')
    onCalibrationSaved()
  }

  return (
    <div className="writing-desk">
      <header className="desk-header">
        <div>
          <h1 className="app-title">Today</h1>
          <p className="muted">{dateKey}</p>
        </div>
        <button type="button" className="btn ghost" onClick={onEditGoals}>
          Edit goals
        </button>
      </header>

      <section className="card prompt-card">
        <h2 className="card-title small">Daily prompt</h2>
        <p className="prompt-body">{promptText}</p>
      </section>

      <div className="layout-split">
        <div className="main-col">
          <div className="mode-tabs" role="tablist" aria-label="Input mode">
            {(
              [
                ['write', 'Write here'],
                ['paste', 'Paste from doc'],
                ['dictate', 'Dictate'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={inputMode === id}
                className={`tab ${inputMode === id ? 'active' : ''}`}
                onClick={() => {
                  setInputMode(id)
                  if (id === 'dictate') startDictation()
                }}
              >
                {label}
              </button>
            ))}
          </div>
          {inputMode === 'paste' && (
            <p className="hint">
              Paste from Google Docs, Notes, or anywhere. Your text stays in this browser.
            </p>
          )}
          {inputMode === 'dictate' && (
            <p className="hint">
              Hand-write first if you like, then dictate here. Use Chrome/Edge for best
              dictation support.
            </p>
          )}
          <label className="sr-only" htmlFor="writing-body">
            Writing area
          </label>
          <textarea
            id="writing-body"
            className="input writing-area"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Start typing, paste, or dictate…"
            spellCheck
          />
          <div className="toolbar">
            <span className="word-count">{wordCount} words</span>
            <div className="btn-row">
              <button type="button" className="btn" onClick={shareExcerpt}>
                Share excerpt
              </button>
            </div>
          </div>

          <section className="card feedback-card">
            <h3 className="card-title small">Quick reflection (for your eyes)</h3>
            <ul className="feedback-list">
              {feedbackPreview.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <h3 className="card-title small">Rate this session</h3>
            <p className="muted small">
              Honest ratings tune the next prompts (voice vs structure vs depth). Optional
              note helps.
            </p>
            <div className="rating-row">
              {([1, 2, 3, 4, 5] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`rating ${rating === n ? 'on' : ''}`}
                  onClick={() => setRating(n)}
                  aria-label={`${n} stars`}
                >
                  {n}
                </button>
              ))}
            </div>
            <label className="field">
              <span className="field-label">Note (optional)</span>
              <input
                className="input"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. dialogue felt stiff, or I avoided the hard part…"
              />
            </label>
            <div className="btn-row wrap">
              <button type="button" className="btn primary" onClick={saveSession}>
                Save session &amp; tune next prompt
              </button>
              <button type="button" className="btn ghost" onClick={saveWithoutFeedback}>
                Save without rating
              </button>
            </div>
            {lastSavedId && (
              <p className="muted small">Last saved session id: {lastSavedId}</p>
            )}
            {status && <p className="status-msg">{status}</p>}
          </section>
        </div>
        <aside className="side-col">
          <FocusTimer defaultMinutes={goals.minutesPerDay} />
          <section className="card">
            <h3 className="card-title small">Goals snapshot</h3>
            <p className="goals-snapshot">{goals.primaryGoal}</p>
            {goals.context && <p className="muted small">{goals.context}</p>}
          </section>
        </aside>
      </div>
    </div>
  )
}
