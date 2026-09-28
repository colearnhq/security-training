import type { HistoryEntry } from '../engine'
import type { Score } from '../types'

export const SCORE_INFO: Record<Score, { label: string; className: string }> = {
  2: { label: '✅ Best choice', className: 'q-best' },
  1: { label: '👍 Good, but not the best', className: 'q-ok' },
  [-1]: { label: '⚠️ Bad move', className: 'q-bad' },
  [-2]: { label: '💥 Fatal mistake', className: 'q-critical' },
}

export const formatPoints = (n: number) => (n > 0 ? `+${n}` : `${n}`)

interface Props {
  entry: HistoryEntry
  isLast: boolean
  onContinue: () => void
}

export function OutcomeScreen({ entry, isLast, onContinue }: Props) {
  const { scene, choice, spotted } = entry
  const q = SCORE_INFO[choice.score]
  const flags = scene.redFlags

  return (
    <div className="card outcome">
      <div className={`quality ${q.className}`}>
        {q.label}
        <span className="points">{formatPoints(choice.score)} pts</span>
      </div>
      <p className="muted small">Fajar chose: “{choice.text}”</p>
      <p className="result">{choice.result}</p>

      <div className="ripple">
        <span className="ripple-label">🔮 Future ripple</span>
        {choice.ripple}
      </div>

      {flags && (
        <div className="flags-review">
          <h3>
            🔍 Red flags{' '}
            {flags.length > 0 && (
              <span className="muted small">
                (you spotted {spotted.length} of {flags.length})
              </span>
            )}
          </h3>
          {flags.length === 0 ? (
            <p>
              <strong>None! This one was legit.</strong> Real sender domain, real link, no pressure, no requests for
              passwords. Knowing what "normal" looks like is half the skill.
            </p>
          ) : (
            <ul>
              {flags.map((f) => (
                <li key={f.id} className={spotted.includes(f.id) ? 'got' : 'missed'}>
                  <strong>
                    {spotted.includes(f.id) ? '🚩' : '⬜'} {f.label}
                  </strong>
                  <span>{f.explain}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="lesson">
        <span className="lesson-label">🎓 Takeaway</span>
        {scene.lesson}
      </div>

      <div className="actions">
        <button className="btn primary" onClick={onContinue}>
          {isLast ? "See how Fajar's future turned out →" : 'Continue →'}
        </button>
      </div>
    </div>
  )
}
