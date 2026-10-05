import { useEffect, useMemo, useState } from 'react'
import { AD_AFTER } from './data/ads'
import { SCENES } from './data/scenes'
import { computeEnding, INITIAL_STATS, nextScene, replay, totalScore } from './engine'
import type { ChoiceRecord, Stats } from './types'
import { AdBreak } from './components/AdBreak'
import { EndingScreen } from './components/EndingScreen'
import { IntroScreen } from './components/IntroScreen'
import { formatPoints, OutcomeScreen } from './components/OutcomeScreen'
import { SceneScreen } from './components/SceneScreen'
import { Shell } from './components/Shell'
import { StatsBar } from './components/StatsBar'

type Phase = 'intro' | 'scene' | 'outcome' | 'ad' | 'ending'

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

/** Hand a live player's choices over to solo mode, so they can use the time machine on them. */
export function continueInSolo(records: ChoiceRecord[], endingId: string) {
  const s = load()
  const endingsFound = s.endingsFound.includes(endingId) ? s.endingsFound : [...s.endingsFound, endingId]
  const next: SaveState = { ...s, records, endingsFound, timeline: s.records.length ? s.timeline + 1 : s.timeline }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

export function SoloGame({ onHome }: { onHome: () => void }) {
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
    <Shell
      onBrand={onHome}
      pills={
        <>
          {(phase === 'scene' || phase === 'outcome') && (
            <span className="pill">🎯 Score: {formatPoints(totalScore(game.history).points)}</span>
          )}
          {state.timeline > 1 && <span className="pill timeline-pill">🕰️ Timeline #{state.timeline}</span>}
        </>
      }
    >
      {(phase === 'scene' || phase === 'outcome') && (
        <StatsBar stats={records.length ? game.stats : INITIAL_STATS} delta={lastDelta} />
      )}

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
        <OutcomeScreen
          entry={last}
          isLast={!upcoming}
          // Some scenes are followed by an ad break before the story continues.
          onContinue={() => setState((s) => (AD_AFTER[last.scene.id] ? { ...s, phase: 'ad' } : goToNext(s)))}
        />
      )}
      {phase === 'ad' && last && AD_AFTER[last.scene.id] && (
        <AdBreak
          ad={AD_AFTER[last.scene.id]}
          footer={
            <div className="actions">
              <button className="btn primary" onClick={() => setState((s) => goToNext(s))}>
                Back to the story →
              </button>
            </div>
          }
        />
      )}
      {phase === 'ending' && (
        <EndingScreen
          game={game}
          edition={`Timeline #${state.timeline}`}
          solo={{
            endingsFound: state.endingsFound,
            jumps: state.jumps,
            onRewind: rewind,
            onNewGame: newGame,
          }}
        />
      )}

      {warping && (
        <div className="warp">
          <div className="warp-text">🕰️ Rewriting history…</div>
        </div>
      )}
    </Shell>
  )
}
