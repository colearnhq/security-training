import { useState } from 'react'
import { formatPoints, SCORE_INFO } from '../components/OutcomeScreen'
import { MISSED_POINTS } from '../engine'
import type { Choice } from '../types'
import { useTicker } from './client'
import { serverNow } from './logic'
import type { Answer } from './protocol'

/** Kahoot-style colour + shape per answer slot, so players can match the host screen at a glance. */
export const SLOTS = [
  { shape: '▲', cls: 'k-red' },
  { shape: '◆', cls: 'k-blue' },
  { shape: '●', cls: 'k-yellow' },
  { shape: '■', cls: 'k-green' },
]

export function Countdown({ deadline, duration, big }: { deadline: number; duration: number; big?: boolean }) {
  const remaining = Math.max(0, deadline - serverNow())
  useTicker(remaining > 0, 100)
  const secs = Math.ceil(remaining / 1000)
  const pct = Math.min(100, (remaining / (duration * 1000)) * 100)
  return (
    <div className={`countdown ${big ? 'big' : ''} ${secs <= 5 ? 'urgent' : ''}`}>
      <span className="countdown-num">{secs}</span>
      <div className="countdown-track">
        <div className="countdown-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

interface ChoicesProps {
  choices: Choice[]
  selectedId?: string | null
  /** Buttons are visible but can't be pressed (reading phase, time's up, host screen). */
  disabled?: boolean
  onPick?: (choiceId: string) => void
}

export function LiveChoices({ choices, selectedId, disabled, onPick }: ChoicesProps) {
  return (
    <div className="live-choices">
      {choices.map((c, i) => (
        <button
          key={c.id}
          className={`live-choice ${SLOTS[i].cls} ${selectedId === c.id ? 'selected' : ''} ${
            selectedId && selectedId !== c.id ? 'dimmed' : ''
          }`}
          disabled={disabled || !onPick}
          onClick={() => onPick?.(c.id)}
        >
          <span className="live-shape">{SLOTS[i].shape}</span>
          <span className="live-text">{c.text}</span>
          {selectedId === c.id && <span className="live-check">✓</span>}
        </button>
      ))}
    </div>
  )
}

/** Host view after the timer: how many picked each option, with its score. */
export function Distribution({
  choices,
  answers,
  expected,
}: {
  choices: Choice[]
  answers: Record<string, Answer>
  /** players who were allowed to answer */
  expected: number
}) {
  const values = Object.values(answers)
  const answered = values.length
  const noAnswer = Math.max(0, expected - answered)
  const max = Math.max(1, ...choices.map((c) => values.filter((a) => a.c === c.id).length), noAnswer)
  // Average over everyone who could answer, counting no-answers at MISSED_POINTS.
  const points =
    values.reduce((sum, a) => sum + (choices.find((c) => c.id === a.c)?.score ?? 0), 0) + noAnswer * MISSED_POINTS
  const counted = answered + noAnswer

  return (
    <div className="distribution">
      {choices.map((c, i) => {
        const n = values.filter((a) => a.c === c.id).length
        const info = SCORE_INFO[c.score]
        return (
          <div key={c.id} className={`dist-row ${c.score === 2 ? 'is-best' : ''}`}>
            <span className={`dist-shape ${SLOTS[i].cls}`}>{SLOTS[i].shape}</span>
            <div className="dist-main">
              <div className="dist-label">
                <span>{c.text}</span>
                <span className={`dist-score ${info.className}`}>
                  {info.label} · {formatPoints(c.score)}
                </span>
              </div>
              <div className="dist-track">
                <div className={`dist-fill ${SLOTS[i].cls}`} style={{ width: `${(n / max) * 100}%` }} />
              </div>
            </div>
            <span className="dist-count">{n}</span>
          </div>
        )
      })}
      {noAnswer > 0 && (
        <div className="dist-row">
          <span className="dist-shape k-none">⏰</span>
          <div className="dist-main">
            <div className="dist-label">
              <span className="muted">No answer</span>
              <span className="dist-score q-critical">No answer · {formatPoints(MISSED_POINTS)}</span>
            </div>
            <div className="dist-track">
              <div className="dist-fill k-none" style={{ width: `${(noAnswer / max) * 100}%` }} />
            </div>
          </div>
          <span className="dist-count">{noAnswer}</span>
        </div>
      )}
      <p className="muted small">
        {answered} of {expected} answered
        {counted > 0 && <> · average {formatPoints(Math.round((points / counted) * 10) / 10)} pts</>}
      </p>
    </div>
  )
}

export const countPlayers = (n: number) => (n === 1 ? '1 player' : `${n} players`)

const PRESETS = [10, 15, 20, 30, 45, 60]

export function DurationPicker({ value, onChange }: { value: number; onChange: (seconds: number) => void }) {
  const [custom, setCustom] = useState(String(value))
  return (
    <div className="duration-picker">
      <span className="small">⏱ Answer time</span>
      {PRESETS.map((s) => (
        <button
          key={s}
          className={`chip-btn ${value === s ? 'active' : ''}`}
          onClick={() => {
            setCustom(String(s))
            onChange(s)
          }}
        >
          {s}s
        </button>
      ))}
      <input
        className="duration-input"
        type="number"
        min={5}
        max={120}
        value={custom}
        onChange={(e) => setCustom(e.target.value)}
        onBlur={() => {
          const n = Math.min(120, Math.max(5, Math.round(Number(custom)) || 15))
          setCustom(String(n))
          onChange(n)
        }}
        aria-label="Custom answer time in seconds"
      />
    </div>
  )
}
