import { useEffect, useMemo, useState, type FormEvent } from 'react'
import QRCode from 'qrcode'
import { AdBreak } from '../components/AdBreak'
import { formatPoints } from '../components/OutcomeScreen'
import { SceneBody } from '../components/SceneScreen'
import { ScoringRules } from '../components/ScoringRules'
import { Shell } from '../components/Shell'
import { AD_BY_ID } from '../data/ads'
import { SCENE_BY_ID } from '../data/scenes'
import { SAT_OUT_POINTS } from '../engine'
import { apiGet, apiPost, hostIdentity, usePolling, useTicker, type HostIdentity } from './client'
import { isLastScene, livePhase, nextLiveScene, orderedChoices, sceneNumber } from './logic'
import type { HostView } from './protocol'
import { HostResults } from './HostResults'
import { Countdown, Distribution, DurationPicker, LiveChoices, countPlayers } from './ui'

export function HostApp({ onExit }: { onExit: () => void }) {
  const [identity, setIdentity] = useState<HostIdentity | null>(hostIdentity.get)

  if (!identity)
    return (
      <HostCreate
        onBack={onExit}
        onCreated={(id) => {
          hostIdentity.set(id)
          setIdentity(id)
        }}
      />
    )
  return (
    <HostSession
      key={identity.pin}
      identity={identity}
      onExit={onExit}
      onNewSession={() => {
        hostIdentity.clear()
        setIdentity(null)
      }}
    />
  )
}

function HostCreate({ onCreated, onBack }: { onCreated: (id: HostIdentity) => void; onBack: () => void }) {
  const [passcode, setPasscode] = useState('')
  const [duration, setDuration] = useState(15)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      onCreated(await apiPost<HostIdentity>({ action: 'create', passcode, duration }))
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Shell onBrand={onBack}>
      <form className="card host-create" onSubmit={create}>
        <h2>🎤 Host a live session</h2>
        <p className="muted">
          You'll get a game PIN for players to join on their phones. You control the pace: show each scene, open the
          answers, then reveal how the room voted.
        </p>
        <label className="field">
          <span>Admin passcode</span>
          <input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} autoFocus />
        </label>
        <DurationPicker value={duration} onChange={setDuration} />
        {error && <p className="form-error">{error}</p>}
        <div className="actions">
          <button className="btn primary" disabled={busy}>
            {busy ? 'Creating…' : 'Create game ▶'}
          </button>
          <button type="button" className="btn ghost" onClick={onBack}>
            Back
          </button>
        </div>
      </form>
    </Shell>
  )
}

function HostSession({
  identity,
  onExit,
  onNewSession,
}: {
  identity: HostIdentity
  onExit: () => void
  onNewSession: () => void
}) {
  const { pin, hostKey } = identity
  const [finished, setFinished] = useState(false)
  const { data, error, refresh } = usePolling(() => apiGet<HostView>({ pin, hostKey }), finished ? null : 1000)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [duration, setDuration] = useState<number | null>(null)

  const room = data?.room
  const phase = room ? livePhase(room) : null
  useTicker(phase === 'answering', 250)

  useEffect(() => {
    if (room?.phase === 'results' && data?.allAnswers) setFinished(true)
  }, [room?.phase, data?.allAnswers])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [phase, room?.history.length])

  const act = async (body: Record<string, unknown>) => {
    setBusy(true)
    setActionError(null)
    try {
      await apiPost({ pin, hostKey, ...body })
      refresh()
    } catch (e) {
      setActionError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  /** Work out the next scene from everyone's answers so far, then show it (or finish). */
  const next = async () => {
    setBusy(true)
    setActionError(null)
    try {
      const all = await apiGet<HostView>({ pin, hostKey, all: '1' })
      const upcoming = nextLiveScene(all.room.history, all.allAnswers ?? {}, all.players)
      const step = all.room.history.length
      await apiPost(
        !upcoming
          ? { pin, hostKey, action: 'finish' }
          : upcoming.kind === 'ad'
            ? { pin, hostKey, action: 'show', step, sceneId: upcoming.ad.id, eligible: null }
            : { pin, hostKey, action: 'show', step, sceneId: upcoming.scene.id, eligible: upcoming.eligible },
      )
      refresh()
    } catch (e) {
      setActionError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  if (error && !data) {
    const gone = 'status' in error && (error.status === 404 || error.status === 403)
    return (
      <Shell onBrand={onExit}>
        <div className="card">
          <h2>{gone ? '⌛ This game has ended' : '⚠️ Can’t reach the game server'}</h2>
          <p className="muted">{gone ? 'Live games expire after 6 hours.' : error.message}</p>
          <div className="actions">
            <button className="btn primary" onClick={gone ? onNewSession : refresh}>
              {gone ? 'Create a new game' : 'Try again'}
            </button>
            <button className="btn ghost" onClick={onExit}>
              Back to menu
            </button>
          </div>
        </div>
      </Shell>
    )
  }
  if (!data || !room || !phase) return <Shell>{<div className="card">Loading game…</div>}</Shell>

  const current = room.history.at(-1)
  const scene = current ? SCENE_BY_ID[current.sceneId] : undefined
  const ad = current ? AD_BY_ID[current.sceneId] : undefined
  const expected = current?.eligible ? current.eligible.length : data.players.length
  const answered = Object.keys(data.answers).length
  // The answer time can only be changed in the lobby; once the story starts it's fixed.
  const answerTime = phase === 'lobby' ? (duration ?? room.duration) : room.duration

  return (
    <Shell
      wide
      onBrand={phase === 'lobby' || phase === 'results' ? onExit : undefined}
      pills={
        <>
          <span className="pill">PIN {pin}</span>
          <span className="pill">👥 {data.players.length}</span>
          {room.history.length > 0 && phase !== 'results' && (
            <>
              <span className="pill">Scene {sceneNumber(room.history)}</span>
              <span className="pill">⏱ {room.duration}s per question</span>
            </>
          )}
        </>
      }
    >
      {actionError && <div className="banner error">⚠️ {actionError}</div>}
      {error && <div className="banner error">⚠️ Connection problem: {error.message}. Retrying…</div>}

      {phase === 'lobby' && (
        <HostLobby
          pin={pin}
          players={data.players}
          duration={answerTime}
          onDuration={(d) => {
            setDuration(d)
            act({ action: 'settings', duration: d })
          }}
          busy={busy}
          onStart={next}
        />
      )}

      {ad && phase !== 'results' && (
        <AdBreak
          ad={ad}
          footer={
            <div className="host-controls">
              <span className="muted">Players see this ad on their phones too. Continue when the room is ready.</span>
              <button className="btn primary big" disabled={busy} onClick={next}>
                Back to the story ▶
              </button>
            </div>
          }
        />
      )}

      {scene && current && (phase === 'reading' || phase === 'answering' || phase === 'reveal') && (
        <div className="card host-scene">
          <SceneBody
            scene={scene}
            meta={current.eligible ? `🚨 Only for the ${countPlayers(current.eligible.length)} this happened to` : undefined}
            found={new Set()}
            onFound={() => {}}
            spotting={false}
          />

          {current.eligible && (
            <div className="banner info">
              This follow-up only happens to players whose earlier choices got Fajar into trouble ({current.eligible.length}{' '}
              of {data.players.length}). Everyone else sits this one out and gets {formatPoints(SAT_OUT_POINTS)} point for
              staying out of trouble.
            </div>
          )}

          <h3 className="choices-title">What should Fajar do?</h3>
          {phase === 'reveal' ? (
            <Distribution choices={orderedChoices(scene, pin)} answers={data.answers} expected={expected} />
          ) : phase === 'answering' ? (
            <LiveChoices choices={orderedChoices(scene, pin)} disabled />
          ) : (
            <div className="options-hidden">🙈 The answer options appear here (and on everyone's phone) when you open answers.</div>
          )}

          <div className="host-controls">
            {phase === 'reading' && (
              <>
                <span className="muted">Give everyone time to read the scene and spot the red flags.</span>
                <button className="btn primary big" disabled={busy} onClick={() => act({ action: 'open' })}>
                  ▶ Open answers ({answerTime}s)
                </button>
              </>
            )}
            {phase === 'answering' && room.deadline && (
              <>
                <Countdown deadline={room.deadline} duration={room.duration} big />
                <span className="answered-count">
                  <strong>{answered}</strong> / {expected} answered
                </span>
                <button className="btn ghost" disabled={busy} onClick={() => act({ action: 'close' })}>
                  ⏹ Stop timer now
                </button>
              </>
            )}
            {phase === 'reveal' && (
              <button className="btn primary big" disabled={busy} onClick={next}>
                {isLastScene(current.sceneId) ? '🏁 Show final results' : 'Next scene ▶'}
              </button>
            )}
          </div>

          {phase === 'reveal' && <RevealNotes sceneId={current.sceneId} />}
        </div>
      )}

      {phase === 'results' && (
        <HostResults
          pin={pin}
          room={room}
          players={data.players}
          allAnswers={data.allAnswers}
          onNewSession={onNewSession}
          onExit={onExit}
        />
      )}
    </Shell>
  )
}

function HostLobby({
  pin,
  players,
  duration,
  onDuration,
  busy,
  onStart,
}: {
  pin: string
  players: HostView['players']
  duration: number
  onDuration: (d: number) => void
  busy: boolean
  onStart: () => void
}) {
  const joinUrl = `${location.origin}/?join=${pin}`
  const [qr, setQr] = useState<string | null>(null)
  useEffect(() => {
    QRCode.toDataURL(joinUrl, { margin: 1, width: 360 }).then(setQr, () => setQr(null))
  }, [joinUrl])
  const sorted = useMemo(() => [...players].sort((a, b) => a.joinedAt - b.joinedAt), [players])
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    if (await copyText(joinUrl)) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="card host-lobby">
      <div className="lobby-join">
        <div>
          <p className="muted">Join on your phone at</p>
          <button className="join-url" onClick={copy} title="Copy the join link (includes the PIN)">
            {location.host}
            <span className={`copy-chip ${copied ? 'done' : ''}`}>{copied ? '✅ Copied!' : '📋 Copy link'}</span>
          </button>
          <p className="muted">with game PIN</p>
          <p className="big-pin">{pin.replace(/(\d{3})(\d{3})/, '$1 $2')}</p>
        </div>
        {qr && <img className="qr" src={qr} alt={`QR code to join game ${pin}`} />}
      </div>

      <div className="lobby-players">
        <h3>
          👥 {countPlayers(players.length)} joined
        </h3>
        {players.length === 0 ? (
          <p className="muted">Waiting for players…</p>
        ) : (
          <div className="player-chips">
            {sorted.map((p) => (
              <span key={p.id} className="player-chip">
                {p.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <ScoringRules live />

      <div className="host-controls">
        <div>
          <DurationPicker value={duration} onChange={onDuration} />
          <p className="muted small">The answer time is locked once the story starts.</p>
        </div>
        <button className="btn primary big" disabled={busy} onClick={onStart}>
          ▶ Start Fajar's story
        </button>
      </div>
    </div>
  )
}

/** Copy to the clipboard, with a fallback for plain-http pages (e.g. a LAN address) where the Clipboard API is off. */
async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* fall through to the legacy approach */
  }
  const area = document.createElement('textarea')
  area.value = text
  area.style.position = 'fixed'
  area.style.opacity = '0'
  document.body.appendChild(area)
  area.select()
  const ok = document.execCommand('copy')
  area.remove()
  return ok
}

function RevealNotes({ sceneId }: { sceneId: string }) {
  const scene = SCENE_BY_ID[sceneId]
  return (
    <div className="reveal-notes">
      {scene.redFlags && scene.redFlags.length > 0 && (
        <div className="flags-review">
          <h3>🔍 Red flags</h3>
          <ul>
            {scene.redFlags.map((f) => (
              <li key={f.id} className="got">
                <strong>🚩 {f.label}</strong>
                <span>{f.explain}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {scene.redFlags?.length === 0 && (
        <p>
          <strong>🔍 No red flags: this one was legit.</strong> Knowing what "normal" looks like is half the skill.
        </p>
      )}
      <div className="lesson">
        <span className="lesson-label">🎓 Takeaway</span>
        {scene.lesson}
      </div>
    </div>
  )
}
