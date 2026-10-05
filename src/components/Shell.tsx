import type { ReactNode } from 'react'

interface Props {
  /** Brand click handler; omit to make the brand non-clickable (e.g. mid-game in live mode). */
  onBrand?: () => void
  pills?: ReactNode
  /** Wider layout for the host's projector screen. */
  wide?: boolean
  children: ReactNode
}

export function Shell({ onBrand, pills, wide, children }: Props) {
  return (
    <div className={`app ${wide ? 'wide' : ''}`}>
      <header className="header">
        <button className="brand" onClick={onBrand} disabled={!onBrand}>
          <img className="brand-logo" src="/colearn-logo.svg" alt="Colearn" />
          <span className="brand-name">Security Training</span>
        </button>
        {pills && <span className="header-pills">{pills}</span>}
      </header>
      <main>{children}</main>
      <footer className="footer muted small">Made for Colearn's IT security training · Fictional scenarios</footer>
    </div>
  )
}
