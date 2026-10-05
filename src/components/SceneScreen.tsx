import { useRef, useState, type ReactNode } from 'react'
import type { Scene } from '../types'
import { MediaView } from './MediaView'
import { SpotContext, type SpotApi } from './RichText'

interface BodyProps {
  scene: Scene
  /** Right-hand side of the top row, e.g. "Decision 3 of 17". */
  meta?: ReactNode
  /** Red flags spotted so far (controlled by the parent). */
  found: Set<string>
  onFound: (next: Set<string>) => void
  /** Turn off the spotting mini-game (e.g. on the host's projector screen). */
  spotting?: boolean
}

/** Scene header, story intro, and the email/chat/call mockup with the spot-the-red-flag game. */
export function SceneBody({ scene, meta, found, onFound, spotting = true }: BodyProps) {
  const [hoverHref, setHoverHref] = useState<string | null>(null)
  const [toast, setToast] = useState<{ text: string; good: boolean } | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)
  const enabled = spotting && scene.redFlags !== undefined

  const showToast = (text: string, good: boolean) => {
    setToast({ text, good })
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 1800)
  }

  const spot: SpotApi = {
    enabled,
    found,
    onHoverLink: setHoverHref,
    onFlag: (id) => {
      const flag = scene.redFlags?.find((f) => f.id === id)
      if (!flag) return
      if (found.has(id)) return showToast(`Already spotted: ${flag.label}`, true)
      onFound(new Set(found).add(id))
      showToast(`🚩 Red flag spotted: ${flag.label}`, true)
    },
    onMiss: () => showToast('Nothing suspicious there 🤔', false),
  }

  return (
    <>
      <div className="scene-top">
        <span className="pill">{scene.when}</span>
        {meta && <span className="muted small">{meta}</span>}
      </div>
      <h2>{scene.title}</h2>
      <p className="scene-intro">{scene.intro}</p>

      {enabled && (
        <div className="spot-hint">
          🔍 <strong>Spot the red flags:</strong> tap anything that looks suspicious before you decide.
          <span className="spot-count">Spotted: {found.size}</span>
        </div>
      )}

      <SpotContext.Provider value={spot}>
        <MediaView media={scene.media} hoverHref={hoverHref} />
      </SpotContext.Provider>

      {toast && <div className={`toast ${toast.good ? 'good' : 'miss'}`}>{toast.text}</div>}
    </>
  )
}

interface Props {
  scene: Scene
  step: number
  total: number
  onChoose: (choiceId: string, spotted: string[]) => void
}

export function SceneScreen({ scene, step, total, onChoose }: Props) {
  // Shuffle once per mount so players can't learn "the right answer is always D".
  const [choices] = useState(() => [...scene.choices].sort(() => Math.random() - 0.5))
  const [found, setFound] = useState<Set<string>>(new Set())

  return (
    <div className="card scene">
      <SceneBody scene={scene} meta={`Decision ${step} of ${total}`} found={found} onFound={setFound} />

      <h3 className="choices-title">What should Fajar do?</h3>
      <div className="choices">
        {choices.map((c, i) => (
          <button key={c.id} className="choice" onClick={() => onChoose(c.id, [...found])}>
            <span className="choice-key">{String.fromCharCode(65 + i)}</span>
            <span>{c.text}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
