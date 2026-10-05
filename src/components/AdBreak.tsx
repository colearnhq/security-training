import type { ReactNode } from 'react'
import type { Ad } from '../data/ads'

/** Full-card "commercial break" between scenes. */
export function AdBreak({ ad, footer }: { ad: Ad; footer?: ReactNode }) {
  return (
    <div className="card ad-break">
      <div className="ad-kicker">{ad.kicker}</div>
      <h2>{ad.title}</h2>
      <p className="lead">{ad.intro}</p>

      <div className="ad-products">
        {ad.products.map((p) => (
          <a key={p.name} className="ad-product" href={p.url} target="_blank" rel="noopener noreferrer">
            <span className="ad-product-emoji">{p.emoji}</span>
            <span className="ad-product-main">
              <strong>{p.name}</strong>
              <span className="muted small">{p.tagline}</span>
            </span>
            <span className="ad-product-cta">Download ↗</span>
          </a>
        ))}
      </div>

      <h3>Why bother?</h3>
      <div className="ad-reasons">
        {ad.reasons.map((r) => (
          <div key={r.title} className="ad-reason">
            <span className="ad-reason-icon">{r.icon}</span>
            <div>
              <strong>{r.title}</strong>
              <p>{r.text}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="ad-footnote">💡 {ad.footnote}</p>
      {footer}
    </div>
  )
}
