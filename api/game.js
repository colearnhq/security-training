// @ts-check
/**
 * Live-session API (Kahoot-style). Runs as a Vercel Function in production and
 * inside the Vite dev server locally (see vite.config.ts).
 *
 * Storage: Upstash Redis when UPSTASH_REDIS_REST_URL/TOKEN (or Vercel's KV_REST_API_URL/TOKEN)
 * are set, otherwise an in-memory store that only works for local development.
 *
 * Game logic (which scene comes next, who may answer, scoring) lives in the host's
 * browser; this API only stores rooms, players and answers, and enforces timers.
 *
 * @typedef {import('../src/live/protocol').Room} Room
 * @typedef {import('../src/live/protocol').PlayerInfo} PlayerInfo
 * @typedef {import('../src/live/protocol').Answer} Answer
 */
import { Redis } from '@upstash/redis'

const TTL_SECONDS = 6 * 60 * 60
/** Extra time accepted after the deadline, to absorb network latency. */
const GRACE_MS = 750
const DEFAULT_DURATION = 15
const MIN_DURATION = 5
const MAX_DURATION = 120

class HttpError extends Error {
  /** @param {number} status @param {string} message */
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

// ───────────────────────── Storage ─────────────────────────

/**
 * @typedef {object} Store
 * @property {(key: string) => Promise<string | null>} get
 * @property {(key: string, value: string) => Promise<void>} set
 * @property {(key: string, field: string, value: string) => Promise<void>} hset
 * @property {(key: string, field: string) => Promise<string | null>} hget
 * @property {(key: string) => Promise<Record<string, string>>} hgetall
 * @property {(key: string) => Promise<number>} hlen
 * @property {(keys: string[], field: string) => Promise<(string | null)[]>} hgetMany
 * @property {(keys: string[]) => Promise<Record<string, string>[]>} hgetallMany
 */

/**
 * With automaticDeserialization off, the client returns HGETALL's raw Redis reply: a flat
 * [field, value, field, value, …] array (or null), not an object. Turn it into a plain object.
 * @param {unknown} reply
 * @returns {Record<string, string>}
 */
function hashReply(reply) {
  if (!Array.isArray(reply)) return reply && typeof reply === 'object' ? /** @type {Record<string, string>} */ (reply) : {}
  /** @type {Record<string, string>} */
  const out = {}
  for (let i = 0; i + 1 < reply.length; i += 2) out[String(reply[i])] = String(reply[i + 1])
  return out
}

/** @returns {Store} */
function redisStore(/** @type {string} */ url, /** @type {string} */ token) {
  // Values are stored as JSON strings we parse ourselves, so keep the client from re-parsing them.
  const r = new Redis({ url, token, automaticDeserialization: false })
  return {
    get: (k) => r.get(k),
    set: async (k, v) => {
      await r.set(k, v, { ex: TTL_SECONDS })
    },
    hset: async (k, f, v) => {
      const p = r.pipeline()
      p.hset(k, { [f]: v })
      p.expire(k, TTL_SECONDS)
      await p.exec()
    },
    hget: (k, f) => r.hget(k, f),
    hgetall: async (k) => hashReply(await r.hgetall(k)),
    hlen: (k) => r.hlen(k),
    hgetMany: async (keys, f) => {
      if (!keys.length) return []
      const p = r.pipeline()
      keys.forEach((k) => p.hget(k, f))
      return /** @type {(string | null)[]} */ (await p.exec())
    },
    hgetallMany: async (keys) => {
      if (!keys.length) return []
      const p = r.pipeline()
      keys.forEach((k) => p.hgetall(k))
      return (await p.exec()).map(hashReply)
    },
  }
}

/** In-memory store for local development. Kept on globalThis so it survives module reloads. */
function memoryStore() {
  const g = /** @type {any} */ (globalThis)
  /** @type {Map<string, { v: string | Map<string, string>, exp: number }>} */
  const mem = (g.__securityQuestMem ??= new Map())
  const read = (/** @type {string} */ k) => {
    const e = mem.get(k)
    if (e && e.exp < Date.now()) mem.delete(k)
    return mem.get(k)?.v
  }
  const hash = (/** @type {string} */ k) => {
    const v = read(k)
    return v instanceof Map ? v : new Map()
  }
  const exp = () => Date.now() + TTL_SECONDS * 1000
  /** @type {Store} */
  const store = {
    get: async (k) => {
      const v = read(k)
      return typeof v === 'string' ? v : null
    },
    set: async (k, v) => {
      mem.set(k, { v, exp: exp() })
    },
    hset: async (k, f, v) => {
      const h = hash(k)
      h.set(f, v)
      mem.set(k, { v: h, exp: exp() })
    },
    hget: async (k, f) => hash(k).get(f) ?? null,
    hgetall: async (k) => Object.fromEntries(hash(k)),
    hlen: async (k) => hash(k).size,
    hgetMany: async (keys, f) => keys.map((k) => hash(k).get(f) ?? null),
    hgetallMany: async (keys) => keys.map((k) => Object.fromEntries(hash(k))),
  }
  return store
}

/** @type {Store | undefined} */
let cachedStore

/** @returns {Store} */
function getStore() {
  if (cachedStore) return cachedStore
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN
  if (url && token) cachedStore = redisStore(url, token)
  else if (process.env.VERCEL) throw new HttpError(500, 'Live mode is not configured: connect Upstash Redis to this Vercel project.')
  else cachedStore = memoryStore()
  return cachedStore
}

const keys = {
  room: (/** @type {string} */ pin) => `sq:${pin}:room`,
  players: (/** @type {string} */ pin) => `sq:${pin}:players`,
  answers: (/** @type {string} */ pin, /** @type {string} */ sceneId) => `sq:${pin}:a:${sceneId}`,
}

// ───────────────────────── Helpers ─────────────────────────

const json = (/** @type {unknown} */ body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })

const randomId = () => crypto.randomUUID().replace(/-/g, '')

const clampDuration = (/** @type {unknown} */ d) => {
  const n = Math.round(Number(d))
  return Number.isFinite(n) ? Math.min(MAX_DURATION, Math.max(MIN_DURATION, n)) : DEFAULT_DURATION
}

/** @param {unknown} v @param {number} max */
const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

/** @returns {Promise<Room>} */
async function loadRoom(/** @type {Store} */ store, /** @type {unknown} */ pin) {
  if (typeof pin !== 'string' || !/^\d{6}$/.test(pin)) throw new HttpError(400, 'Enter the 6-digit game PIN.')
  const raw = await store.get(keys.room(pin))
  if (!raw) throw new HttpError(404, 'No live game with that PIN. Check the PIN with your host.')
  return JSON.parse(raw)
}

const saveRoom = (/** @type {Store} */ store, /** @type {Room} */ room) => store.set(keys.room(room.pin), JSON.stringify(room))

function assertHost(/** @type {Room} */ room, /** @type {unknown} */ hostKey) {
  if (hostKey !== room.hostKey) throw new HttpError(403, 'Only the host can do that.')
}

/** Answers are open while phase is "answering" and the deadline hasn't passed. */
const answersOpen = (/** @type {Room} */ room, now = Date.now()) =>
  room.phase === 'answering' && room.deadline !== null && now <= room.deadline

/** @param {Record<string, string>} hash */
const parseHash = (hash) => Object.fromEntries(Object.entries(hash).map(([k, v]) => [k, JSON.parse(v)]))

// ───────────────────────── Actions ─────────────────────────

/** @param {Store} store @param {any} body */
async function post(store, body) {
  const now = Date.now()

  switch (body?.action) {
    case 'create': {
      const required = process.env.ADMIN_PASSCODE
      if (required && body.passcode !== required) {
        await new Promise((r) => setTimeout(r, 1000)) // slow down passcode guessing
        throw new HttpError(401, 'Wrong admin passcode.')
      }
      if (!required && process.env.VERCEL) throw new HttpError(500, 'ADMIN_PASSCODE is not configured.')
      let pin = ''
      for (let i = 0; i < 20 && !pin; i++) {
        const candidate = String(Math.floor(100000 + Math.random() * 900000))
        if (!(await store.get(keys.room(candidate)))) pin = candidate
      }
      if (!pin) throw new HttpError(503, 'Could not allocate a game PIN, please try again.')
      /** @type {Room} */
      const room = {
        pin,
        hostKey: randomId(),
        createdAt: now,
        duration: clampDuration(body.duration),
        phase: 'lobby',
        history: [],
        deadline: null,
      }
      await saveRoom(store, room)
      return { pin, hostKey: room.hostKey }
    }

    case 'join': {
      const room = await loadRoom(store, body.pin)
      if (room.phase === 'results') throw new HttpError(409, 'This game has already finished.')
      const name = str(body.name, 24)
      if (!name) throw new HttpError(400, 'Enter your name.')
      const existing = typeof body.playerId === 'string' && (await store.hget(keys.players(room.pin), body.playerId))
      const playerId = existing ? body.playerId : randomId()
      /** @type {PlayerInfo} */
      const info = existing
        ? { ...JSON.parse(existing), name }
        : { name, joinedAt: now, joinedStep: room.history.length }
      await store.hset(keys.players(room.pin), playerId, JSON.stringify(info))
      return { playerId, ...info }
    }

    case 'answer': {
      const room = await loadRoom(store, body.pin)
      const current = room.history.at(-1)
      if (room.phase !== 'answering' || !current || current.sceneId !== body.sceneId || room.deadline === null)
        throw new HttpError(409, 'Answers are closed for this question.')
      if (now > room.deadline + GRACE_MS) throw new HttpError(409, "Time's up!")
      if (typeof body.playerId !== 'string' || !(await store.hget(keys.players(room.pin), body.playerId)))
        throw new HttpError(403, 'You are not in this game. Please join again.')
      if (current.eligible && !current.eligible.includes(body.playerId))
        throw new HttpError(403, 'This question is not for you.')
      const choiceId = str(body.choiceId, 40)
      if (!choiceId) throw new HttpError(400, 'Pick an answer.')
      const spotted = Array.isArray(body.spotted) ? body.spotted.slice(0, 20).map((/** @type {unknown} */ s) => str(s, 40)) : []
      /** @type {Answer} */
      const answer = { c: choiceId, s: spotted.filter(Boolean) }
      await store.hset(keys.answers(room.pin, current.sceneId), body.playerId, JSON.stringify(answer))
      return { ok: true }
    }

    // ── Host-only actions ──
    case 'show': {
      const room = await loadRoom(store, body.pin)
      assertHost(room, body.hostKey)
      // `step` makes the action idempotent: a double click can't skip a scene.
      if (body.step !== room.history.length) return { ok: true }
      if (room.phase === 'results') throw new HttpError(409, 'The game has finished.')
      if (answersOpen(room, now)) throw new HttpError(409, 'Answers are still open.')
      const sceneId = str(body.sceneId, 40)
      if (!sceneId) throw new HttpError(400, 'Missing scene.')
      const eligible = Array.isArray(body.eligible) ? body.eligible.filter((/** @type {unknown} */ x) => typeof x === 'string') : null
      room.history.push({ sceneId, eligible })
      room.phase = 'reading'
      room.deadline = null
      await saveRoom(store, room)
      return { ok: true }
    }

    case 'open': {
      const room = await loadRoom(store, body.pin)
      assertHost(room, body.hostKey)
      if (room.phase !== 'reading') return { ok: true }
      // The answer time was fixed in the lobby; it can't change mid-game.
      room.phase = 'answering'
      room.deadline = now + room.duration * 1000
      await saveRoom(store, room)
      return { ok: true }
    }

    case 'close': {
      const room = await loadRoom(store, body.pin)
      assertHost(room, body.hostKey)
      if (answersOpen(room, now)) {
        room.deadline = now
        await saveRoom(store, room)
      }
      return { ok: true }
    }

    case 'settings': {
      const room = await loadRoom(store, body.pin)
      assertHost(room, body.hostKey)
      if (room.phase !== 'lobby') throw new HttpError(409, 'The answer time is locked once the story has started.')
      room.duration = clampDuration(body.duration)
      await saveRoom(store, room)
      return { ok: true }
    }

    case 'finish': {
      const room = await loadRoom(store, body.pin)
      assertHost(room, body.hostKey)
      room.phase = 'results'
      room.deadline = null
      await saveRoom(store, room)
      return { ok: true }
    }

    default:
      throw new HttpError(400, 'Unknown action.')
  }
}

/** @param {Store} store @param {URLSearchParams} q */
async function get(store, q) {
  const room = await loadRoom(store, q.get('pin'))
  const { hostKey, ...publicRoom } = room
  const now = Date.now()
  const current = room.history.at(-1)
  const sceneKeys = room.history.map((h) => keys.answers(room.pin, h.sceneId))

  if (q.has('hostKey')) {
    assertHost(room, q.get('hostKey'))
    const [players, answers, all] = await Promise.all([
      store.hgetall(keys.players(room.pin)),
      current ? store.hgetall(keys.answers(room.pin, current.sceneId)) : Promise.resolve({}),
      room.phase === 'results' || q.get('all') === '1' ? store.hgetallMany(sceneKeys) : Promise.resolve(null),
    ])
    return {
      now,
      room: publicRoom,
      players: Object.entries(players).map(([id, v]) => ({ id, ...JSON.parse(v) })),
      answers: parseHash(answers),
      allAnswers: all ? Object.fromEntries(room.history.map((h, i) => [h.sceneId, parseHash(all[i])])) : undefined,
    }
  }

  const playerId = q.get('playerId') ?? ''
  /** @type {Record<string, unknown>} */
  const view = {
    now,
    room: {
      ...publicRoom,
      history: room.history.map((h) => ({ sceneId: h.sceneId, forMe: !h.eligible || h.eligible.includes(playerId) })),
    },
  }
  if (room.phase === 'lobby') view.playerCount = await store.hlen(keys.players(room.pin))
  if (q.get('mine') === '1') {
    const [me, mine] = await Promise.all([
      store.hget(keys.players(room.pin), playerId),
      current ? store.hget(keys.answers(room.pin, current.sceneId), playerId) : Promise.resolve(null),
    ])
    view.me = me ? JSON.parse(me) : null
    view.myAnswer = mine ? JSON.parse(mine) : null
  }
  if (room.phase === 'results') {
    const mine = await store.hgetMany(sceneKeys, playerId)
    view.myAnswers = Object.fromEntries(
      room.history.flatMap((h, i) => (mine[i] ? [[h.sceneId, JSON.parse(/** @type {string} */ (mine[i]))]] : [])),
    )
  }
  void hostKey
  return view
}

/** @param {() => Promise<unknown>} fn */
async function handle(fn) {
  try {
    return json(await fn())
  } catch (e) {
    if (e instanceof HttpError) return json({ error: e.message }, e.status)
    console.error(e)
    return json({ error: 'Something went wrong on the server.' }, 500)
  }
}

export function GET(/** @type {Request} */ request) {
  return handle(() => get(getStore(), new URL(request.url).searchParams))
}

export function POST(/** @type {Request} */ request) {
  return handle(async () => post(getStore(), await request.json().catch(() => ({}))))
}
