/**
 * Sanity checks for the story content. Run with `npm run check`.
 * - every question has 4 choices with valid, unique ids and exactly one +2 ("best") answer
 * - every red flag in the text has an explanation, and every explanation is clickable somewhere
 * - ad breaks follow a real scene
 * - no real-looking phone numbers (use +62 XXX-XXXX-XXXX)
 */
import { SCENES } from '../src/data/scenes.ts'
import { ADS } from '../src/data/ads.ts'

const VALID_SCORES = [2, 1, 0, -1, -2]
const problems: string[] = []

const flagsIn = (o: unknown, out = new Set<string>()): Set<string> => {
  if (Array.isArray(o)) o.forEach((x) => flagsIn(x, out))
  else if (o && typeof o === 'object') {
    const seg = o as { t?: unknown; flag?: string }
    if (typeof seg.t === 'string' && seg.flag) out.add(seg.flag)
    Object.values(o).forEach((v) => flagsIn(v, out))
  }
  return out
}

for (const s of SCENES) {
  const scores = s.choices.map((c) => c.score)
  if (s.choices.length !== 4) problems.push(`${s.id}: has ${s.choices.length} choices, expected 4`)
  if (scores.filter((x) => x === 2).length !== 1) problems.push(`${s.id}: needs exactly one +2 choice`)
  if (scores.some((x) => !VALID_SCORES.includes(x))) problems.push(`${s.id}: invalid score in ${scores}`)
  if (new Set(s.choices.map((c) => c.id)).size !== s.choices.length) problems.push(`${s.id}: duplicate choice ids`)

  const used = flagsIn(s.media)
  const defined = new Set((s.redFlags ?? []).map((f) => f.id))
  for (const f of used) if (!defined.has(f)) problems.push(`${s.id}: red flag "${f}" has no explanation`)
  for (const f of defined) if (!used.has(f)) problems.push(`${s.id}: red flag "${f}" isn't marked in the text`)

  const phone = JSON.stringify(s).match(/\d{3,4}[- ]\d{4}/)
  if (phone) problems.push(`${s.id}: looks like a real phone number ("${phone[0]}"), mask it as XXX-XXXX`)
}

const sceneIds = new Set(SCENES.map((s) => s.id))
for (const a of ADS) if (!sceneIds.has(a.after)) problems.push(`ad ${a.id}: follows unknown scene "${a.after}"`)

const table = SCENES.map((s) => `${s.id.padEnd(16)} ${s.choices.map((c) => String(c.score > 0 ? `+${c.score}` : c.score).padStart(3)).join(' ')}`)
console.log(table.join('\n'))
console.log(`\n${SCENES.length} scenes, ${ADS.length} ad break(s)`)
if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n- ${problems.join('\n- ')}`)
  process.exit(1)
}
console.log('All content checks passed.')
