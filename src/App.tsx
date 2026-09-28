import { useEffect, useMemo, useState } from 'react'
import { SCENES } from './data/scenes'
import { computeEnding, INITIAL_STATS, nextScene, replay, totalScore } from './engine'
import type { ChoiceRecord, Stats } from './types'
import { EndingScreen } from './components/EndingScreen'
import { IntroScreen } from './components/IntroScreen'
import { formatPoints, OutcomeScreen } from './components/OutcomeScreen'
import { SceneScreen } from './components/SceneScreen'
import { StatsBar } from './components/StatsBar'

type Phase = 'intro' | 'scene' | 'outcome' | 'ending'

interface SaveState {
  phase: Phase
  records: ChoiceRecord[]
  jumps: number
  timeline: number
  endingsFound: string[]
}

const STORAGE_KEY = 'colearn-security-quest:v1'
const EMPTY: SaveState = { phase: 'intro', records: [], jumps: 0, timeline: 1, endingsFound: [] }

function load(): SaveState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    // Always land on the intro screen; it offers "Continue" if there's progress.
    if (raw) return { ...EMPTY, ...JSON.parse(raw), phase: 'intro' }
  } catch {
    /* corrupted save: start fresh */
  }
  return EMPTY
}

export default function App() {
  const [state, setState] = useState<SaveState>(load)
  const [warping, setWarping] = useState(false)
  const { phase, records } = state

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [phase, records.length])

  const game = useMemo(() => replay(records), [records])
  const upcoming = useMemo(() => nextScene(records, game.flags), [records, game.flags])
  const totalScenes = SCENES.filter((s) => !s.condition || s.condition(game.flags)).length

  const goToNext = (s: SaveState): SaveState => {
    const g = replay(s.records)
    if (nextScene(s.records, g.flags)) return { ...s, phase: 'scene' }
    const ending = computeEnding(g)
    return {
      ...s,
      phase: 'ending',
      endingsFound: s.endingsFound.includes(ending.id) ? s.endingsFound : [...s.endingsFound, ending.id],
    }
  }

  const choose = (choiceId: string, spotted: string[]) => {
    if (!upcoming) return
    setState((s) => ({ ...s, phase: 'outcome', records: [...s.records, { sceneId: upcoming.id, choiceId, spotted }] }))
  }

  const newGame = () =>
    setState((s) => ({ ...s, phase: 'scene', records: [], timeline: s.records.length ? s.timeline + 1 : s.timeline }))

  const rewind = (index: number) => {
    setWarping(true)
    window.setTimeout(() => {
      setState((s) => ({ ...s, phase: 'scene', records: s.records.slice(0, index), jumps: s.jumps + 1, timeline: s.timeline + 1 }))
    }, 700)
    window.setTimeout(() => setWarping(false), 1400)
  }

  const last = game.history[game.history.length - 1]
  const lastDelta: Partial<Stats> | undefined =
    phase === 'outcome' && last
      ? {
          security: last.after.security - last.before.security,
          business: last.after.business - last.before.business,
          career: last.after.career - last.before.career,
        }
      : undefined

  return (
    <div className="app">
      <header className="header">
        <button className="brand" onClick={() => setState((s) => ({ ...s, phase: 'intro' }))}>
          <span className="brand-logo">🛡️</span>
          <span>
            Fajar's First Month <span className="muted small">· Colearn Security Quest</span>
          </span>
        </button>
        <span className="header-pills">
          {(phase === 'scene' || phase === 'outcome') && (
            <span className="pill">🎯 Score: {formatPoints(totalScore(game.history).points)}</span>
          )}
          {state.timeline > 1 && <span className="pill timeline-pill">🕰️ Timeline #{state.timeline}</span>}
        </span>
      </header>

      {(phase === 'scene' || phase === 'outcome') && (
        <StatsBar stats={records.length ? game.stats : INITIAL_STATS} delta={lastDelta} />
      )}

      <main>
        {phase === 'intro' && (
          <IntroScreen
            hasSave={records.length > 0}
            endingsFound={state.endingsFound}
            onStart={newGame}
            onContinue={() => setState((s) => goToNext(s))}
          />
        )}
        {phase === 'scene' && upcoming && (
          <SceneScreen
            key={`${state.timeline}-${upcoming.id}`}
            scene={upcoming}
            step={records.length + 1}
            total={totalScenes}
            onChoose={choose}
          />
        )}
        {phase === 'outcome' && last && (
          <OutcomeScreen entry={last} isLast={!upcoming} onContinue={() => setState((s) => goToNext(s))} />
        )}
        {phase === 'ending' && (
          <EndingScreen
            game={game}
            endingsFound={state.endingsFound}
            jumps={state.jumps}
            timeline={state.timeline}
            onRewind={rewind}
            onNewGame={newGame}
          />
        )}
      </main>

      <footer className="footer muted small">Made for Colearn's IT security training · Fictional scenarios</footer>

      {warping && (
        <div className="warp">
          <div className="warp-text">🕰️ Rewriting history…</div>
        </div>
      )}
    </div>
  )
}
