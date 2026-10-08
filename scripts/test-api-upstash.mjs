/**
 * Runs api/game.js with the real @upstash/redis client against a tiny fake Upstash REST server,
 * so Redis-specific behaviour (e.g. HGETALL's flat array reply) is tested without a real database.
 * The local dev server uses an in-memory store instead, which can hide these bugs.
 * Run with `npm run test:api`.
 */
import assert from 'node:assert/strict'

// Fake Upstash REST server: the real @upstash/redis client talks to it through fetch.
const db = new Map()
const enc = (v) => (typeof v === 'string' && v !== 'OK' ? Buffer.from(v).toString('base64') : Array.isArray(v) ? v.map(enc) : v)
const run = ([cmd, key, ...a]) => {
  switch (cmd.toLowerCase()) {
    case 'get': return db.get(key) ?? null
    case 'set': db.set(key, a[0]); return 'OK'
    case 'expire': return 1
    case 'hset': { const h = db.get(key) ?? new Map(); for (let i = 0; i < a.length; i += 2) h.set(a[i], a[i + 1]); db.set(key, h); return a.length / 2 }
    case 'hget': return db.get(key)?.get(a[0]) ?? null
    case 'hlen': return db.get(key)?.size ?? 0
    case 'hgetall': return [...(db.get(key) ?? new Map())].flat()   // Redis replies with a flat [field, value, ...] array
    default: throw new Error('unsupported ' + cmd)
  }
}
globalThis.fetch = async (url, init) => {
  const body = JSON.parse(init.body); const b64 = init.headers['Upstash-Encoding'] === 'base64'
  const wrap = (cmd) => ({ result: b64 ? enc(run(cmd)) : run(cmd) })
  const out = String(url).endsWith('/pipeline') ? body.map(wrap) : wrap(body)
  return new Response(JSON.stringify(out), { status: 200, headers: { 'content-type': 'application/json' } })
}
process.env.UPSTASH_REDIS_REST_URL = 'https://fake.upstash.io'; process.env.UPSTASH_REDIS_REST_TOKEN = 'x'
const mod = await import('../api/game.js')
const post = async (b) => (await mod.POST(new Request('http://x/api/game', { method: 'POST', body: JSON.stringify(b) }))).json()
const get = async (q) => {
  const r = await mod.GET(new Request('http://x/api/game?' + new URLSearchParams(q)))
  return { status: r.status, body: await r.json() }
}

const { pin, hostKey } = await post({ action: 'create' })
assert.equal((await get({ pin, hostKey })).status, 200, 'host poll with no players')

const players = []
for (let i = 0; i < 100; i++) players.push(await post({ action: 'join', pin, name: `Player ${i}` }))
const lobby = await get({ pin, hostKey })
assert.equal(lobby.status, 200, `host poll with 100 players: ${lobby.body.error}`)
assert.equal(lobby.body.players.length, 100)
assert.equal(lobby.body.players.find((p) => p.id === players[0].playerId)?.name, 'Player 0')

await post({ action: 'show', pin, hostKey, step: 0, sceneId: 'ima-welcome', eligible: null })
await post({ action: 'open', pin, hostKey })
await post({ action: 'answer', pin, playerId: players[0].playerId, sceneId: 'ima-welcome', choiceId: 'verify', spotted: ['domain'] })
const host = await get({ pin, hostKey, all: '1' })
assert.equal(host.status, 200, `host poll with answers: ${host.body.error}`)
assert.deepEqual(host.body.answers[players[0].playerId], { c: 'verify', s: ['domain'] })
assert.deepEqual(host.body.allAnswers['ima-welcome'][players[0].playerId], { c: 'verify', s: ['domain'] })

await post({ action: 'finish', pin, hostKey })
const me = await get({ pin, playerId: players[0].playerId, mine: '1' })
assert.equal(me.status, 200)
assert.equal(me.body.me.name, 'Player 0')
assert.deepEqual(me.body.myAnswers, { 'ima-welcome': { c: 'verify', s: ['domain'] } })

console.log('API checks against fake Upstash passed (100 players).')
