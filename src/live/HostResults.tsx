import { useMemo } from 'react'
import { formatPoints } from '../components/OutcomeScreen'
import { CATEGORY_LABEL, SCENE_BY_ID } from '../data/scenes'
import { isAd } from '../data/ads'
import { ENDINGS } from '../data/endings'
import { playerResult, type AnswersByScene, type PlayerResult } from './logic'
import type { HostRoom, HostView } from './protocol'
import { countPlayers } from './ui'

interface Props {
  pin: string
  room: HostRoom
  players: HostView['players']
  allAnswers?: AnswersByScene
  onNewSession: () => void
  onExit: () => void
}

export function HostResults({ pin, room, players, allAnswers, onNewSession, onExit }: Props) {
  const results = useMemo(
    () => (allAnswers ? players.map((p) => playerResult(p, room.history, allAnswers)) : []),
    [players, room.history, allAnswers],
  )
  if (!allAnswers) return <div className="card">Crunching the results…</div>

  // Players who never answered anything don't get an ending.
  const active = results.filter((r) => r.game.history.length > 0)
  const inactive = results.length - active.length
  const ranked = [...active].sort((a, b) => b.points - a.points || a.name.localeCompare(b.name))
  const avg = active.length ? active.reduce((s, r) => s + r.points, 0) / active.length : 0
  const maxEnding = Math.max(1, ...ENDINGS.map((e) => active.filter((r) => r.ending.id === e.id).length))

  return (
    <div className="host-results">
      <div className="card">
        <h2>🏁 How the room's futures turned out</h2>
        <p className="muted">
          {countPlayers(active.length)} · average score{' '}
          <strong>{formatPoints(Math.round(avg * 10) / 10)}</strong>
          {inactive > 0 && <> · {inactive} joined but never answered</>}
        </p>
        <div className="ending-dist">
          {ENDINGS.map((e) => {
            const n = active.filter((r) => r.ending.id === e.id).length
            return (
              <div key={e.id} className={`ending-dist-row tone-${e.tone}`}>
                <span className="ending-dist-emoji">{e.emoji}</span>
                <div className="dist-main">
                  <div className="dist-label">
                    <span>{e.title}</span>
                    <span className="muted small">
                      {active.length ? Math.round((n / active.length) * 100) : 0}%
                    </span>
                  </div>
                  <div className="dist-track">
                    <div className="dist-fill ending-fill" style={{ width: `${(n / maxEnding) * 100}%` }} />
                  </div>
                </div>
                <span className="dist-count">{n}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="results-grid">
        <div className="card">
          <h3>🏆 Leaderboard</h3>
          <ol className="leaderboard">
            {ranked.slice(0, 10).map((r, i) => (
              <li key={r.id}>
                <span className="lb-rank">{['🥇', '🥈', '🥉'][i] ?? i + 1}</span>
                <span className="lb-name">{r.name}</span>
                <span className="lb-ending" title={r.ending.title}>
                  {r.ending.emoji}
                </span>
                <span className="lb-points">
                  {formatPoints(r.points)} / {r.max}
                </span>
              </li>
            ))}
          </ol>
          {ranked.length > 10 && <p className="muted small">…and {ranked.length - 10} more (see the CSV).</p>}
        </div>

        <div className="card">
          <h3>📊 Question by question</h3>
          <p className="muted small">Share of players who picked the best answer. Low bars are topics to revisit.</p>
          <div className="question-review">
            {room.history.filter((h) => !isAd(h.sceneId)).map((h) => {
              const scene = SCENE_BY_ID[h.sceneId]
              const answers = Object.values(allAnswers[h.sceneId] ?? {})
              const best = scene.choices.find((c) => c.score === 2)?.id
              const pct = answers.length ? Math.round((answers.filter((a) => a.c === best).length / answers.length) * 100) : 0
              return (
                <div key={h.sceneId} className="qr-row" title={CATEGORY_LABEL[scene.category]}>
                  <span className="qr-title">
                    {scene.title}
                    {h.eligible && <span className="muted small"> · {countPlayers(h.eligible.length)}</span>}
                  </span>
                  <div className="meter-track">
                    <div className={`meter-fill ${pct >= 70 ? 'hi' : pct >= 40 ? 'mid' : 'lo'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="report-score">{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="actions">
          <button className="btn primary" onClick={() => downloadCsv(pin, results)}>
            ⬇️ Download results (CSV)
          </button>
          <button className="btn ghost" onClick={onNewSession}>
            ↺ Host a new game
          </button>
          <button className="btn ghost" onClick={onExit}>
            Back to menu
          </button>
        </div>
      </div>
    </div>
  )
}

function downloadCsv(pin: string, results: PlayerResult[]) {
  // Player names are user input: prefix anything that looks like a formula so spreadsheets don't run it.
  const cell = (v: string | number) => {
    const s = typeof v === 'string' && /^[=+\-@\t\r]/.test(v) ? `'${v}` : String(v)
    return `"${s.replace(/"/g, '""')}"`
  }
  const header = [
    'Name',
    'Score',
    'Max score',
    'Ending',
    'Best (+2)',
    'Good (+1)',
    'No help (0)',
    'Bad (-1)',
    'Fatal (-2)',
    'No answer (-3)',
    'Sat out (+1)',
  ]
  const rows = results.map((r) => {
    const n = (s: number) => r.game.history.filter((h) => h.choice.score === s).length
    const ending = r.game.history.length ? r.ending.title : '(never answered)'
    return [r.name, r.points, r.max, ending, n(2), n(1), n(0), n(-1), n(-2), r.missed, r.satOut]
  })
  const csv = [header, ...rows].map((row) => row.map(cell).join(',')).join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  a.download = `security-quest-${pin}-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  window.setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}
