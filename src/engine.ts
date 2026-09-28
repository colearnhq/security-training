import { SCENES, SCENE_BY_ID } from './data/scenes'
import { ENDING_BY_ID } from './data/endings'
import type { Category, Choice, ChoiceRecord, Ending, Scene, Score, Stats } from './types'

export const INITIAL_STATS: Stats = { security: 50, business: 50, career: 50 }

/** Flags that make Fajar fireable when combined with other critical mistakes. */
const FIREABLE = ['student_data_leak', 'strategy_leak', 'coverup', 'ignored_hijack']

export interface HistoryEntry {
  scene: Scene
  choice: Choice
  spotted: string[]
  before: Stats
  after: Stats
}

export interface Replay {
  stats: Stats
  flags: Set<string>
  history: HistoryEntry[]
}

const clamp = (n: number) => Math.max(0, Math.min(100, n))

/** Rebuild the whole game state from the ordered list of choices. */
export function replay(records: ChoiceRecord[]): Replay {
  let stats = { ...INITIAL_STATS }
  const flags = new Set<string>()
  const history: HistoryEntry[] = []

  for (const r of records) {
    const scene = SCENE_BY_ID[r.sceneId]
    const choice = scene?.choices.find((c) => c.id === r.choiceId)
    if (!scene || !choice) continue
    const before = stats
    stats = {
      security: clamp(stats.security + (choice.delta.security ?? 0)),
      business: clamp(stats.business + (choice.delta.business ?? 0)),
      career: clamp(stats.career + (choice.delta.career ?? 0)),
    }
    choice.flags?.forEach((f) => flags.add(f))
    history.push({ scene, choice, spotted: r.spotted, before, after: stats })
  }
  return { stats, flags, history }
}

/** The next unanswered scene whose condition is met, or null when the story is over. */
export function nextScene(records: ChoiceRecord[], flags: Set<string>): Scene | null {
  const answered = new Set(records.map((r) => r.sceneId))
  return SCENES.find((s) => !answered.has(s.id) && (!s.condition || s.condition(flags))) ?? null
}

export function tally(history: HistoryEntry[]): { best: number; good: number; bad: number; fatal: number } {
  const n = (s: Score) => history.filter((h) => h.choice.score === s).length
  return { best: n(2), good: n(1), bad: n(-1), fatal: n(-2) }
}

/** Sum of choice scores, out of a maximum of 2 points per decision. */
export function totalScore(history: HistoryEntry[]): { points: number; max: number } {
  return { points: history.reduce((sum, h) => sum + h.choice.score, 0), max: history.length * 2 }
}

export function computeEnding({ history, flags }: Replay): Ending {
  const t = tally(history)
  const { points, max } = totalScore(history)
  const fireable = FIREABLE.some((f) => flags.has(f))

  if (t.fatal >= 5) return ENDING_BY_ID.bankrupt
  if (t.fatal >= 3 || (fireable && t.fatal >= 2)) return ENDING_BY_ID.fired
  if (t.fatal >= 1) return ENDING_BY_ID.incident
  // No fatal mistakes: the total score decides.
  if (points === max) return ENDING_BY_ID.powerhouse
  if (points >= max / 2) return ENDING_BY_ID.champion
  if (points >= 0) return ENDING_BY_ID.scars
  return ENDING_BY_ID.incident
}

/** Per-category points for the report card; `percent` maps -2…+2 per decision onto 0–100. */
export function reportCard(
  history: HistoryEntry[],
): { category: Category; points: number; max: number; percent: number }[] {
  const acc = new Map<Category, { points: number; count: number }>()
  for (const h of history) {
    const a = acc.get(h.scene.category) ?? { points: 0, count: 0 }
    a.points += h.choice.score
    a.count++
    acc.set(h.scene.category, a)
  }
  return [...acc.entries()].map(([category, a]) => ({
    category,
    points: a.points,
    max: a.count * 2,
    percent: Math.round(((a.points + a.count * 2) / (a.count * 4)) * 100),
  }))
}

/** How many red flags the player spotted before deciding, across all scenes with the mini-game. */
export function sharpEye(history: HistoryEntry[]): { found: number; total: number } {
  let found = 0
  let total = 0
  for (const h of history) {
    const flags = h.scene.redFlags ?? []
    total += flags.length
    found += h.spotted.filter((id) => flags.some((f) => f.id === id)).length
  }
  return { found, total }
}
