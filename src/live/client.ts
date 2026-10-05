import { useEffect, useRef, useState } from 'react'
import { syncClock } from './logic'

export async function apiPost<T = { ok: true }>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch('/api/game', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(res.status, data.error ?? `Request failed (${res.status})`)
  return data
}

export async function apiGet<T extends { now: number }>(params: Record<string, string>): Promise<T> {
  const res = await fetch(`/api/game?${new URLSearchParams(params)}`, { cache: 'no-store' })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(res.status, data.error ?? `Request failed (${res.status})`)
  syncClock(data.now)
  return data
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

/**
 * Poll `load` every `intervalMs` (null = load once, don't repeat). Changing `key` restarts
 * polling immediately; `refresh()` forces an extra load right away.
 */
export function usePolling<T>(load: () => Promise<T>, intervalMs: number | null, key = '') {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<ApiError | Error | null>(null)
  const [tick, setTick] = useState(0)
  const loadRef = useRef(load)
  loadRef.current = load

  useEffect(() => {
    let stopped = false
    let timer: number | undefined
    const run = async () => {
      try {
        const d = await loadRef.current()
        if (!stopped) {
          setData(d)
          setError(null)
        }
      } catch (e) {
        if (!stopped) setError(e as Error)
      } finally {
        if (!stopped && intervalMs !== null) timer = window.setTimeout(run, intervalMs)
      }
    }
    run()
    return () => {
      stopped = true
      window.clearTimeout(timer)
    }
  }, [intervalMs, key, tick])

  return { data, error, refresh: () => setTick((t) => t + 1) }
}

/** Re-render every `ms` while `active`, for countdowns. */
export function useTicker(active: boolean, ms = 200) {
  const [, setN] = useState(0)
  useEffect(() => {
    if (!active) return
    const id = window.setInterval(() => setN((n) => n + 1), ms)
    return () => window.clearInterval(id)
  }, [active, ms])
}

// Host identity survives refreshes and new tabs; player identity is per tab, so one browser can
// test several players.
const HOST_KEY = 'colearn-security-quest:host'
const PLAYER_KEY = 'colearn-security-quest:player'

export interface HostIdentity {
  pin: string
  hostKey: string
}
export interface PlayerIdentity {
  pin: string
  playerId: string
  name: string
  joinedStep: number
}

const read = <T,>(storage: Storage, key: string): T | null => {
  try {
    const raw = storage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export const hostIdentity = {
  get: () => read<HostIdentity>(localStorage, HOST_KEY),
  set: (v: HostIdentity) => localStorage.setItem(HOST_KEY, JSON.stringify(v)),
  clear: () => localStorage.removeItem(HOST_KEY),
}

export const playerIdentity = {
  get: () => read<PlayerIdentity>(sessionStorage, PLAYER_KEY),
  set: (v: PlayerIdentity) => sessionStorage.setItem(PLAYER_KEY, JSON.stringify(v)),
  clear: () => sessionStorage.removeItem(PLAYER_KEY),
}
