import { useState, type FormEvent } from 'react'
import { Shell } from './components/Shell'
import { apiPost, hostIdentity, playerIdentity, type PlayerIdentity } from './live/client'
import type { PlayerInfo } from './live/protocol'

interface Props {
  initialPin: string
  onJoined: (identity: PlayerIdentity) => void
  onHost: () => void
  onSolo: () => void
}

export function Home({ initialPin, onJoined, onHost, onSolo }: Props) {
  const [pin, setPin] = useState(initialPin)
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const savedHost = hostIdentity.get()

  const join = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const cleanPin = pin.replace(/\D/g, '')
      const res = await apiPost<{ playerId: string } & PlayerInfo>({ action: 'join', pin: cleanPin, name })
      const identity = { pin: cleanPin, playerId: res.playerId, name: res.name, joinedStep: res.joinedStep }
      playerIdentity.set(identity)
      onJoined(identity)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Shell>
      <div className="card home">
        <div className="intro-badge">Fajar's First Month</div>
        <h1>Colearn Security Training</h1>
        <p className="lead">A story-driven security adventure… with a time machine.</p>

        <form className="join-form" onSubmit={join}>
          <h3>🎮 Join a live game</h3>
          <div className="join-fields">
            <input
              className="pin-input"
              inputMode="numeric"
              autoComplete="off"
              placeholder="Game PIN"
              maxLength={7}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              aria-label="Game PIN"
            />
            <input
              placeholder="Your name"
              maxLength={24}
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label="Your name"
            />
            <button className="btn primary" disabled={busy || !pin.trim() || !name.trim()}>
              {busy ? 'Joining…' : 'Join ▶'}
            </button>
          </div>
          {error && <p className="form-error">{error}</p>}
        </form>

        <div className="home-options">
          <button className="home-option" onClick={onHost}>
            <span className="home-icon">🎤</span>
            <span>
              <strong>{savedHost ? `Resume hosting game ${savedHost.pin}` : 'Host a live session'}</strong>
              <br />
              <span className="muted small">For trainers: run the story for a whole room, Kahoot-style.</span>
            </span>
          </button>
          <button className="home-option" onClick={onSolo}>
            <span className="home-icon">🧑‍💻</span>
            <span>
              <strong>Play solo</strong>
              <br />
              <span className="muted small">Go at your own pace, with the time machine to fix the future.</span>
            </span>
          </button>
        </div>

        <p className="disclaimer">
          All scenarios are fictional and for internal training only. Real people's names are used with a wink: the
          real Abhay, Marc and Ima will never ask you for gift cards, passwords or OTP codes.
        </p>
      </div>
    </Shell>
  )
}
