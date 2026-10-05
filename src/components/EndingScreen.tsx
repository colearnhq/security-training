import { useState, type ReactNode } from 'react'
import { CATEGORY_LABEL } from '../data/scenes'
import { ENDINGS } from '../data/endings'
import { computeEnding, MISSED_POINTS, reportCard, SAT_OUT_POINTS, sharpEye, tally, totalScore, type Replay, type ScoreAdjust } from '../engine'
import { formatPoints, SCORE_INFO } from './OutcomeScreen'
import { StatsBar } from './StatsBar'

export interface SoloControls {
  endingsFound: string[]
  jumps: number
  onRewind: (index: number) => void
  onNewGame: () => void
}

interface Props {
  game: Replay
  /** Live mode: missed questions and sat-out follow-ups. */
  adjust?: ScoreAdjust
  /** Right-hand side of the newspaper masthead. */
  edition: string
  /** Solo mode: time machine and endings gallery. */
  solo?: SoloControls
  /** Live mode: extra content at the bottom. */
  extra?: ReactNode
}

export function EndingScreen({ game, adjust = {}, edition, solo, extra }: Props) {
  const [selected, setSelected] = useState<number | null>(null)
  const ending = computeEnding(game, adjust)
  const t = tally(game.history)
  const total = totalScore(game.history, adjust)
  const { missed = 0, satOut = 0 } = adjust
  const eye = sharpEye(game.history)
  const card = reportCard(game.history)
  const mistakes = game.history.filter((h) => h.choice.score !== 2)
  const highlights = mistakes.length > 0 ? mistakes : game.history

  return (
    <div className="ending">
      <div className={`card newspaper tone-${ending.tone}`}>
        <div className="paper-masthead">
          <span>THE JAKARTA FUTURE TIMES</span>
          <span>
            {ending.year} · {edition}
          </span>
        </div>
        <div className="paper-emoji">{ending.emoji}</div>
        <h1 className="paper-headline">{ending.headline}</h1>
        <h2 className="paper-title">Ending: {ending.title}</h2>
        <div className="paper-score">
          Final score: <strong>{formatPoints(total.points)}</strong> / {total.max}
        </div>
        <p className="paper-story">{ending.story}</p>
      </div>

      <div className="card">
        <h3>{mistakes.length > 0 ? '🧵 How this future happened' : '🌟 Every decision that built this future'}</h3>
        <ul className="ripples">
          {highlights.map((h, i) => (
            <li key={i} className={SCORE_INFO[h.choice.score].className}>
              <span className="muted small">
                {h.scene.when} · {formatPoints(h.choice.score)} pts
              </span>
              <span>{h.choice.ripple}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h3>📋 Fajar's report card</h3>
        <StatsBar stats={game.stats} />
        <div className="summary-chips">
          <span className="chip">
            🎯 Score: {formatPoints(total.points)} / {total.max}
          </span>
          <span className="chip q-best">✅ {t.best} best (+2)</span>
          <span className="chip q-ok">👍 {t.good} good (+1)</span>
          {t.neutral > 0 && <span className="chip q-neutral">😐 {t.neutral} no help (0)</span>}
          <span className="chip q-bad">⚠️ {t.bad} bad (−1)</span>
          <span className="chip q-critical">💥 {t.fatal} fatal (−2)</span>
          {missed > 0 && (
            <span className="chip q-critical">
              ⏰ {missed} no answer ({formatPoints(MISSED_POINTS)})
            </span>
          )}
          {satOut > 0 && (
            <span className="chip q-best">
              😎 {satOut} sat out ({formatPoints(SAT_OUT_POINTS)})
            </span>
          )}
          <span className="chip">
            🔍 Sharp eye: {eye.found}/{eye.total} red flags
          </span>
        </div>
        <div className="report">
          {card.map((c) => (
            <div key={c.category} className="report-row">
              <span>{CATEGORY_LABEL[c.category]}</span>
              <div className="meter-track">
                <div
                  className={`meter-fill ${c.percent >= 70 ? 'hi' : c.percent >= 40 ? 'mid' : 'lo'}`}
                  style={{ width: `${c.percent}%` }}
                />
              </div>
              <span className="report-score">
                {formatPoints(c.points)} / {c.max}
              </span>
            </div>
          ))}
        </div>
      </div>

      {solo && <SoloCards game={game} endingId={ending.id} solo={solo} selected={selected} onSelect={setSelected} />}
      {extra}
    </div>
  )
}

function SoloCards({
  game,
  endingId,
  solo: { endingsFound, jumps, onRewind, onNewGame },
  selected,
  onSelect: setSelected,
}: {
  game: Replay
  endingId: string
  solo: SoloControls
  selected: number | null
  onSelect: (i: number | null) => void
}) {
  return (
    <>
      <div className="card time-machine">
        <h3>🕰️ The Colearn Lab Time Machine</h3>
        <p>
          Colearn Lab's R&amp;D team has a prototype time machine. Pick a moment in Fajar's month to go back to. Every
          decision from that point on will be rewritten.
          {jumps > 0 && <span className="muted"> (Time jumps used so far: {jumps})</span>}
        </p>
        <div className="timeline">
          {game.history.map((h, i) => (
            <button
              key={h.scene.id}
              className={`tl-node ${SCORE_INFO[h.choice.score].className} ${selected === i ? 'selected' : ''}`}
              onClick={() => setSelected(i)}
              title={`${h.scene.when}: ${h.scene.title}`}
            >
              <span className="tl-dot" />
              <span className="tl-label">{h.scene.title}</span>
              <span className="tl-when">{h.scene.when.replace(/ · \d\d:\d\d$/, '')}</span>
            </button>
          ))}
        </div>
        {selected !== null && (
          <div className="tm-confirm">
            <p>
              Travel back to <strong>{game.history[selected].scene.when}</strong>, “{game.history[selected].scene.title}”?
              <br />
              <span className="muted">Last time, Fajar chose: “{game.history[selected].choice.text}”</span>
            </p>
            <div className="actions">
              <button className="btn primary" onClick={() => onRewind(selected)}>
                ⚡ Engage time machine
              </button>
              <button className="btn ghost" onClick={() => setSelected(null)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h3>
          🏆 Endings discovered: {ENDINGS.filter((e) => endingsFound.includes(e.id)).length} / {ENDINGS.length}
        </h3>
        <div className="endings-grid">
          {ENDINGS.map((e) => {
            const got = endingsFound.includes(e.id)
            return (
              <div key={e.id} className={`ending-tile ${got ? 'got' : 'locked'} ${e.id === endingId ? 'current' : ''}`}>
                <span className="ending-emoji">{got ? e.emoji : '🔒'}</span>
                <span>{got ? e.title : '???'}</span>
              </div>
            )
          })}
        </div>
        <div className="actions">
          <button className="btn ghost" onClick={onNewGame}>
            ↺ Start over from day one
          </button>
        </div>
      </div>
    </>
  )
}
