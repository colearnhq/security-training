import { useEffect, useRef, useState } from 'react'
import { AdBreak } from '../components/AdBreak'
import { EndingScreen } from '../components/EndingScreen'
import { formatPoints, OutcomeScreen } from '../components/OutcomeScreen'
import { SceneBody } from '../components/SceneScreen'
import { ScoringRules } from '../components/ScoringRules'
import { Shell } from '../components/Shell'
import { AD_BY_ID } from '../data/ads'
import { SCENE_BY_ID } from '../data/scenes'
import { computeEnding, MISSED_POINTS, replay, SAT_OUT_POINTS } from '../engine'
import { continueInSolo } from '../SoloGame'
import { apiGet, apiPost, usePolling, useTicker, type PlayerIdentity } from './client'
import { livePhase, liveScore, orderedChoices, playerRecords, sceneNumber } from './logic'
import type { Answer, PlayerView } from './protocol'
import { Countdown, LiveChoices } from './ui'

interface Props {
  identity: PlayerIdentity
  onLeave: () => void
  onSolo: () => void
}

export function PlayerApp({ identity, onLeave, onSolo }: Props) {
  const { pin, playerId, name, joinedStep } = identity
  // My answers by scene id. The server is the source of truth; this mirrors it for instant feedback.
  const mineKey = `colearn-security-quest:answers:${pin}:${playerId}`
  const [mine, setMine] = useState<Record<string, Answer>>(() => {
    try {
      return JSON.parse(sessionStorage.getItem(mineKey) ?? '{}')
    } catch {
      return {}
    }
  })
  useEffect(() => sessionStorage.setItem(mineKey, JSON.stringify(mine)), [mineKey, mine])
  const [found, setFound] = useState<Record<string, Set<string>>>({})
  const [saveError, setSaveError] = useState<string | null>(null)
  const lastScene = useRef<string | null>(null)
  const syncedScene = useRef<string | null>(null)
  const queue = useRef<Promise<unknown>>(Promise.resolve())
  const [finished, setFinished] = useState(false)

  const { data, error, refresh } = usePolling(async () => {
    // After a refresh or a new scene, ask once for my saved answer (and whether I'm still in the game).
    const needMine = syncedScene.current === null || syncedScene.current !== lastScene.current
    const view = await apiGet<PlayerView>({ pin, playerId, ...(needMine ? { mine: '1' } : {}) })
    const currentId = view.room.history.at(-1)?.sceneId ?? 'lobby'
    lastScene.current = currentId
    if (needMine) {
      syncedScene.current = currentId
      const saved = view.myAnswer
      if (saved && currentId !== 'lobby') setMine((m) => ({ ...m, [currentId]: saved }))
    }
    return view
  }, finished ? null : 1000)

  const room = data?.room
  const phase = room ? livePhase(room) : null
  useTicker(phase === 'answering', 250)

  useEffect(() => {
    if (room?.phase === 'results' && data?.myAnswers) setFinished(true)
  }, [room?.phase, data?.myAnswers])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [phase, room?.history.length])

  const kicked = data?.me === null
  if ((error && !data && 'status' in error && error.status === 404) || kicked) {
    return (
      <Shell onBrand={onLeave}>
        <div className="card">
          <h2>⌛ This game isn't available anymore</h2>
          <p className="muted">The host may have ended it. Ask them for a new PIN.</p>
          <div className="actions">
            <button className="btn primary" onClick={onLeave}>
              Back to menu
            </button>
          </div>
        </div>
      </Shell>
    )
  }
  if (!data || !room || !phase)
    return (
      <Shell>
        <div className="card">{error ? `⚠️ ${error.message}. Retrying…` : 'Connecting…'}</div>
      </Shell>
    )

  const current = room.history.at(-1)
  const scene = current ? SCENE_BY_ID[current.sceneId] : undefined
  const ad = current ? AD_BY_ID[current.sceneId] : undefined
  const myAnswer = current ? mine[current.sceneId] : undefined
  const sceneFound = (current && found[current.sceneId]) || new Set<string>()

  // Score so far, counting only scenes whose answers have been revealed (no peeking mid-question).
  const revealed = room.history.filter((_, i) => i < room.history.length - 1 || phase === 'reveal' || phase === 'results')
  const score = liveScore(playerRecords(revealed, (id) => mine[id], joinedStep)).points

  const submit = (sceneId: string, answer: Answer) => {
    // Chain requests so a quick A→B change can't arrive at the server as B→A.
    queue.current = queue.current
      .then(() => apiPost({ action: 'answer', pin, playerId, sceneId, choiceId: answer.c, spotted: answer.s }))
      .then(
        () => setSaveError(null),
        (e: Error) => {
          setSaveError(e.message)
          refresh()
        },
      )
  }

  const pick = (choiceId: string) => {
    if (!current || phase !== 'answering') return
    const answer = { c: choiceId, s: [...sceneFound] }
    setMine((m) => ({ ...m, [current.sceneId]: answer }))
    submit(current.sceneId, answer)
  }

  const onFound = (next: Set<string>) => {
    if (!current) return
    setFound((f) => ({ ...f, [current.sceneId]: next }))
    // Red flags spotted after answering still count, as long as answers are open.
    if (myAnswer && phase === 'answering') submit(current.sceneId, { c: myAnswer.c, s: [...next] })
  }

  return (
    <Shell
      pills={
        <>
          <span className="pill">👤 {name}</span>
          {room.history.length > 0 && <span className="pill">🎯 {formatPoints(score)}</span>}
        </>
      }
    >
      {error && <div className="banner error">⚠️ Connection problem: {error.message}. Retrying…</div>}
      {saveError && <div className="banner error">⚠️ Your answer wasn't saved: {saveError}</div>}

      {phase === 'lobby' && (
        <div className="card waiting">
          <div className="waiting-emoji">🧑‍💻</div>
          <h2>You're in, {name}!</h2>
          <p className="muted">
            Waiting for the host to start Fajar's story…
            {data.playerCount !== undefined && (
              <> ({data.playerCount === 1 ? '1 player' : `${data.playerCount} players`} joined)</>
            )}
          </p>
          <div className="dots">
            <span />
            <span />
            <span />
          </div>
          <ScoringRules live />
        </div>
      )}

      {ad && phase !== 'results' && (
        <AdBreak ad={ad} footer={<p className="muted center waiting-note">⏳ The story continues when the host is ready…</p>} />
      )}

      {scene && current && !current.forMe && phase !== 'results' && (
        <div className="card waiting">
          <div className="waiting-emoji">😎</div>
          <h2>Your Fajar dodged this one</h2>
          <p className="muted">
            “{scene.title}” only happens to players whose earlier choices got Fajar into trouble. Watch the host screen
            to see how they handle it.
          </p>
          <div className="quality q-best">
            🎁 Free points for staying out of trouble <span className="points">{formatPoints(SAT_OUT_POINTS)} pt</span>
          </div>
        </div>
      )}

      {scene && current?.forMe && (phase === 'reading' || phase === 'answering') && (
        <div className="card scene">
          <SceneBody
            scene={scene}
            meta={`Scene ${sceneNumber(room.history)}`}
            found={sceneFound}
            onFound={onFound}
          />
          <h3 className="choices-title">What should Fajar do?</h3>
          {/* Options stay hidden while reading, so everyone focuses on the scene first. */}
          {phase === 'reading' ? (
            <div className="banner info">
              ⏳ Read the scene and spot the red flags. The answer options appear when the host starts the timer.
            </div>
          ) : (
            <>
              {room.deadline && (
                <div className="player-timer">
                  <Countdown deadline={room.deadline} duration={room.duration} />
                  <span className="small muted">
                    {myAnswer ? '✅ Answer saved. You can still change it until time runs out.' : 'Tap your answer!'}
                  </span>
                </div>
              )}
              <LiveChoices choices={orderedChoices(scene, pin)} selectedId={myAnswer?.c} onPick={pick} />
            </>
          )}
        </div>
      )}

      {scene && current?.forMe && phase === 'reveal' && (
        <RevealForPlayer sceneId={scene.id} answer={myAnswer} spotted={[...sceneFound]} />
      )}

      {phase === 'results' && (
        <PlayerResults
          view={data}
          joinedStep={joinedStep}
          onSolo={onSolo}
          onLeave={onLeave}
        />
      )}
    </Shell>
  )
}

function RevealForPlayer({ sceneId, answer, spotted }: { sceneId: string; answer?: Answer; spotted: string[] }) {
  const scene = SCENE_BY_ID[sceneId]
  const choice = scene.choices.find((c) => c.id === answer?.c)
  const waiting = <p className="muted center waiting-note">⏳ Waiting for the host to continue the story…</p>
  if (!choice)
    return (
      <div className="card outcome">
        <div className="quality q-critical">
          ⏰ Time's up! <span className="points">{formatPoints(MISSED_POINTS)} pts</span>
        </div>
        <p className="result">
          You didn't answer in time, so Fajar froze. In real life, doing nothing is often the worst option of all. Here's
          what to remember:
        </p>
        <div className="lesson">
          <span className="lesson-label">🎓 Takeaway</span>
          {scene.lesson}
        </div>
        {waiting}
      </div>
    )
  return <OutcomeScreen entry={{ scene, choice, spotted: [...new Set([...(answer?.s ?? []), ...spotted])] }} footer={waiting} />
}

function PlayerResults({
  view,
  joinedStep,
  onSolo,
  onLeave,
}: {
  view: PlayerView
  joinedStep: number
  onSolo: () => void
  onLeave: () => void
}) {
  if (!view.myAnswers) return <div className="card">Loading your results…</div>
  const answers = view.myAnswers
  const { records, missed, satOut } = playerRecords(view.room.history, (id) => answers[id], joinedStep)
  if (!records.length)
    return (
      <div className="card">
        <h2>🏁 The story is over</h2>
        <p className="muted">You didn't answer any questions this time, so Fajar's future is still unwritten.</p>
        <div className="actions">
          <button className="btn primary" onClick={onSolo}>
            Play solo
          </button>
          <button className="btn ghost" onClick={onLeave}>
            Back to menu
          </button>
        </div>
      </div>
    )

  const game = replay(records)
  const adjust = { missed, satOut }
  const ending = computeEnding(game, adjust)
  return (
    <EndingScreen
      game={game}
      adjust={adjust}
      edition={`Live game ${view.room.pin}`}
      extra={
        <div className="card time-machine">
          <h3>🕰️ Not happy with this future?</h3>
          <p>Take your choices into solo mode and use the Colearn Lab time machine to go back and fix them.</p>
          <div className="actions">
            <button
              className="btn primary"
              onClick={() => {
                continueInSolo(records, ending.id)
                onSolo()
              }}
            >
              ⚡ Fix my future in solo mode
            </button>
            <button className="btn ghost" onClick={onLeave}>
              Leave game
            </button>
          </div>
        </div>
      }
    />
  )
}
