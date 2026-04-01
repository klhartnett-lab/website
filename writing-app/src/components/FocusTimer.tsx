import { useEffect, useRef, useState } from 'react'

type Props = {
  defaultMinutes: number
}

export function FocusTimer({ defaultMinutes }: Props) {
  const [running, setRunning] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(defaultMinutes * 60)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!running) return
    tickRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setRunning(false)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => {
      if (tickRef.current) clearInterval(tickRef.current)
    }
  }, [running])

  useEffect(() => {
    setSecondsLeft(defaultMinutes * 60)
  }, [defaultMinutes])

  const m = Math.floor(secondsLeft / 60)
  const sec = secondsLeft % 60
  const label = `${m}:${String(sec).padStart(2, '0')}`

  return (
    <div className="focus-timer card">
      <h3 className="card-title small">Focus block</h3>
      <p className="muted small">
        A gentle on-device timer. For real blocking of sites, use your OS focus mode or a
        browser extension—this app stays local and does not filter your network.
      </p>
      <div className="focus-timer-display">{label}</div>
      <div className="btn-row">
        {!running ? (
          <button
            type="button"
            className="btn"
            onClick={() => {
              if (secondsLeft === 0) setSecondsLeft(defaultMinutes * 60)
              setRunning(true)
            }}
          >
            Start {defaultMinutes} min
          </button>
        ) : (
          <button type="button" className="btn ghost" onClick={() => setRunning(false)}>
            Pause
          </button>
        )}
        <button
          type="button"
          className="btn ghost"
          onClick={() => {
            setRunning(false)
            setSecondsLeft(defaultMinutes * 60)
          }}
        >
          Reset
        </button>
      </div>
    </div>
  )
}
