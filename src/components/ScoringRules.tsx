import { MISSED_POINTS, SAT_OUT_POINTS } from '../engine'
import { formatPoints, SCORE_INFO } from './OutcomeScreen'
import type { Score } from '../types'

const ROWS: { score: Score; text: string }[] = [
  { score: 2, text: 'The best thing to do: you stay safe and make Colearn safer.' },
  { score: 1, text: 'A good call, but there was a better one.' },
  { score: 0, text: 'You kept yourself safe, but did nothing to protect Colearn.' },
  { score: -1, text: 'A bad move that puts you or Colearn at risk.' },
  { score: -2, text: 'A fatal mistake: real damage to Colearn.' },
]

/** How points work. Live mode adds the no-answer penalty and the sit-out bonus. */
export function ScoringRules({ live }: { live?: boolean }) {
  return (
    <div className="scoring-rules">
      <h3>🎯 How scoring works</h3>
      <ul>
        {ROWS.map((r) => (
          <li key={r.score}>
            <span className={`score-badge ${SCORE_INFO[r.score].className}`}>{formatPoints(r.score)}</span>
            <span>{r.text}</span>
          </li>
        ))}
        {live && (
          <>
            <li>
              <span className="score-badge q-critical">{formatPoints(MISSED_POINTS)}</span>
              <span>
                <strong>No answer before the timer runs out.</strong> Doing nothing is worse than a bad choice, so always
                pick something!
              </span>
            </li>
            <li>
              <span className="score-badge q-best">{formatPoints(SAT_OUT_POINTS)}</span>
              <span>
                Some follow-up incidents only happen to players whose earlier choices caused them. If your Fajar stayed out
                of trouble, you sit it out and get {formatPoints(SAT_OUT_POINTS)} point.
              </span>
            </li>
          </>
        )}
      </ul>
      {live && <p className="muted small">You can change your answer until time runs out; only your final pick counts.</p>}
    </div>
  )
}
