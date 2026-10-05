import { useState } from 'react'
import { Home } from './Home'
import { SoloGame } from './SoloGame'
import { playerIdentity, type PlayerIdentity } from './live/client'
import { HostApp } from './live/HostApp'
import { PlayerApp } from './live/PlayerApp'

type Mode = { kind: 'home' } | { kind: 'solo' } | { kind: 'host' } | { kind: 'player'; identity: PlayerIdentity }

const joinPin = new URLSearchParams(location.search).get('join') ?? ''

function initialMode(): Mode {
  // A player who refreshes mid-game goes straight back in (unless they followed a new join link).
  const player = playerIdentity.get()
  if (player && (!joinPin || joinPin === player.pin)) return { kind: 'player', identity: player }
  return { kind: 'home' }
}

export default function App() {
  const [mode, setMode] = useState<Mode>(initialMode)
  const home = () => {
    // Drop the ?join= link so a later refresh lands on the menu.
    if (location.search) history.replaceState(null, '', location.pathname)
    setMode({ kind: 'home' })
  }

  switch (mode.kind) {
    case 'solo':
      return <SoloGame onHome={home} />
    case 'host':
      return <HostApp onExit={home} />
    case 'player':
      return (
        <PlayerApp
          identity={mode.identity}
          onLeave={() => {
            playerIdentity.clear()
            home()
          }}
          onSolo={() => {
            playerIdentity.clear()
            setMode({ kind: 'solo' })
          }}
        />
      )
    case 'home':
      return (
        <Home
          initialPin={joinPin}
          onJoined={(identity) => setMode({ kind: 'player', identity })}
          onHost={() => setMode({ kind: 'host' })}
          onSolo={() => setMode({ kind: 'solo' })}
        />
      )
  }
}
