import type { Stats } from '../types'

const METERS: { key: keyof Stats; label: string; icon: string }[] = [
  { key: 'security', label: 'Colearn Security', icon: '🛡️' },
  { key: 'business', label: 'Colearn Business', icon: '📈' },
  { key: 'career', label: "Fajar's Career", icon: '👤' },
]

export function StatsBar({ stats, delta }: { stats: Stats; delta?: Partial<Stats> }) {
  return (
    <div className="stats">
      {METERS.map((m) => {
        const v = stats[m.key]
        const d = delta?.[m.key]
        const level = v >= 65 ? 'hi' : v >= 35 ? 'mid' : 'lo'
        return (
          <div key={m.key} className="meter">
            <div className="meter-label">
              <span>
                {m.icon} {m.label}
              </span>
              <span className="meter-value">
                {v}
                {d ? <span className={`delta ${d > 0 ? 'up' : 'down'}`}>{d > 0 ? `+${d}` : d}</span> : null}
              </span>
            </div>
            <div className="meter-track">
              <div className={`meter-fill ${level}`} style={{ width: `${v}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
