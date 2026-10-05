import { ENDINGS } from '../data/endings'
import { ScoringRules } from './ScoringRules'

interface Props {
  hasSave: boolean
  endingsFound: string[]
  onStart: () => void
  onContinue: () => void
}

export function IntroScreen({ hasSave, endingsFound, onStart, onContinue }: Props) {
  return (
    <div className="card intro">
      <div className="intro-badge">Colearn Security Training</div>
      <h1>Fajar's First Month</h1>
      <p className="lead">A security adventure… with a time machine.</p>

      <div className="intro-hero">🧑‍💻</div>

      <p>
        Meet <strong>Fajar</strong>, the newest <strong>Customer Care Ops</strong> at Colearn. Over the next four weeks,
        Fajar will face phishing emails, suspicious calls, "urgent" favors from the CEO, sketchy public WiFi, laptop
        hijackers, password dilemmas and very curious friends.
      </p>
      <p>
        Every decision ripples into the future. Fajar could become Colearn's security champion… or end up in the
        news, or even get fired.
      </p>

      <div className="intro-rules">
        <div>
          <span>🔍</span>
          <div>
            <strong>Spot the red flags</strong>
            <br />
            Tap anything suspicious in emails, chats and calls before deciding. Hover links to see where they really go.
          </div>
        </div>
        <div>
          <span>🧭</span>
          <div>
            <strong>Make the call</strong>
            <br />
            Choose what Fajar does. Watch the Security, Business and Career meters.
          </div>
        </div>
        <div>
          <span>🕰️</span>
          <div>
            <strong>Fix the future</strong>
            <br />
            Don't like the ending? Use the time machine to go back and change history.
          </div>
        </div>
      </div>

      <ScoringRules />

      <div className="actions">
        {hasSave && (
          <button className="btn primary" onClick={onContinue}>
            Continue Fajar's story
          </button>
        )}
        <button className={`btn ${hasSave ? 'ghost' : 'primary'}`} onClick={onStart}>
          {hasSave ? 'Start a new timeline' : "Start Fajar's first day →"}
        </button>
      </div>

      {endingsFound.length > 0 && (
        <p className="muted small center">
          Endings discovered: {ENDINGS.filter((e) => endingsFound.includes(e.id)).length} / {ENDINGS.length}
        </p>
      )}
      <p className="disclaimer">
        All scenarios are fictional and for internal training only. Real people's names are used with a wink: the real
        Abhay, Marc and Ima will never ask you for gift cards, passwords or OTP codes.
      </p>
    </div>
  )
}
