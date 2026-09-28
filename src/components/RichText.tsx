import { createContext, useContext, type MouseEvent } from 'react'
import type { Rich } from '../types'

export interface SpotApi {
  enabled: boolean
  found: Set<string>
  onFlag: (id: string) => void
  onMiss: () => void
  onHoverLink: (href: string | null) => void
}

export const SpotContext = createContext<SpotApi>({
  enabled: false,
  found: new Set(),
  onFlag: () => {},
  onMiss: () => {},
  onHoverLink: () => {},
})

/**
 * Renders a Rich text. In spotting mode every piece of text is clickable, so
 * the player can't tell red flags apart just by the cursor.
 */
export function RichText({ value }: { value: Rich }) {
  const spot = useContext(SpotContext)

  return (
    <>
      {value.map((seg, i) => {
        if (typeof seg === 'string') {
          return (
            <span key={i} className={spot.enabled ? 'seg' : undefined} onClick={spot.enabled ? spot.onMiss : undefined}>
              {seg}
            </span>
          )
        }

        const found = seg.flag ? spot.found.has(seg.flag) : false
        const handleClick = (e: MouseEvent) => {
          e.preventDefault()
          if (!spot.enabled) return
          if (seg.flag) spot.onFlag(seg.flag)
          else spot.onMiss()
        }
        const className = [seg.href ? 'link' : '', spot.enabled ? 'seg' : '', found ? 'seg-found' : '']
          .filter(Boolean)
          .join(' ')

        if (seg.href) {
          return (
            <a
              key={i}
              href={seg.href}
              className={className}
              onClick={(e) => {
                handleClick(e)
                spot.onHoverLink(seg.href!)
              }}
              onMouseEnter={() => spot.onHoverLink(seg.href!)}
              onMouseLeave={() => spot.onHoverLink(null)}
            >
              {seg.t}
            </a>
          )
        }
        return (
          <span key={i} className={className || undefined} onClick={handleClick}>
            {seg.t}
          </span>
        )
      })}
    </>
  )
}
