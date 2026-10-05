import { SCENES, SCENE_BY_ID } from '../data/scenes'
import { AD_AFTER, AD_BY_ID, isAd, type Ad } from '../data/ads'
import { computeEnding, replay, totalScore, type Replay, type ScoreAdjust } from '../engine'
import type { Choice, ChoiceRecord, Ending, Scene } from '../types'
import type { Answer, RoomPhase } from './protocol'

export type AnswersByScene = Record<string, Record<string, Answer>>

/** Phase as players experience it: "reveal" is answering after the deadline. */
export type LivePhase = RoomPhase | 'reveal'

let clockOffset = 0
/** Call with the server's `now` from every response, so countdowns match the server. */
export const syncClock = (serverNow: number) => {
  clockOffset = serverNow - Date.now()
}
export const serverNow = () => Date.now() + clockOffset

export function livePhase(room: { phase: RoomPhase; deadline: number | null }): LivePhase {
  if (room.phase === 'answering' && room.deadline !== null && serverNow() > room.deadline) return 'reveal'
  return room.phase
}

/** Same order for every player in a room, so "A" on the host screen is "A" on every phone. */
export function orderedChoices(scene: Scene, pin: string): Choice[] {
  let seed = 0
  for (const ch of `${pin}:${scene.id}`) seed = (Math.imul(seed ^ ch.charCodeAt(0), 2654435761) >>> 0) + 1
  const rand = () => {
    seed = (seed + 0x6d2b79f5) >>> 0
    let t = seed
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const out = [...scene.choices]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export interface SceneForPlayer {
  sceneId: string
  forMe: boolean
}

/**
 * Turn one player's answers into the ordered records the solo engine understands, plus the
 * live-only adjustments: `missed` = scenes they could have answered (after joining) but didn't,
 * `satOut` = follow-up incident scenes that didn't happen to their Fajar. Ad breaks are skipped.
 */
export function playerRecords(
  history: SceneForPlayer[],
  answerFor: (sceneId: string) => Answer | undefined,
  joinedStep = 0,
): { records: ChoiceRecord[] } & Required<ScoreAdjust> {
  const records: ChoiceRecord[] = []
  let missed = 0
  let satOut = 0
  history.forEach((h, i) => {
    if (isAd(h.sceneId) || i < joinedStep - 1) return
    if (!h.forMe) {
      satOut++
      return
    }
    const a = answerFor(h.sceneId)
    const valid = a && SCENE_BY_ID[h.sceneId]?.choices.some((c) => c.id === a.c)
    if (valid) records.push({ sceneId: h.sceneId, choiceId: a.c, spotted: a.s })
    else missed++
  })
  return { records, missed, satOut }
}

/** Live score from a player's records and adjustments (what the player and host both see). */
export function liveScore(r: { records: ChoiceRecord[] } & ScoreAdjust) {
  return totalScore(replay(r.records).history, r)
}

export interface PlayerResult {
  id: string
  name: string
  game: Replay
  missed: number
  satOut: number
  ending: Ending
  points: number
  max: number
}

export function playerResult(
  player: { id: string; name: string; joinedStep: number },
  history: { sceneId: string; eligible: string[] | null }[],
  answers: AnswersByScene,
): PlayerResult {
  const { records, missed, satOut } = playerRecords(
    history.map((h) => ({ sceneId: h.sceneId, forMe: !h.eligible || h.eligible.includes(player.id) })),
    (sceneId) => answers[sceneId]?.[player.id],
    player.joinedStep,
  )
  const game = replay(records)
  const adjust = { missed, satOut }
  const { points, max } = totalScore(game.history, adjust)
  return { id: player.id, name: player.name, game, missed, satOut, ending: computeEnding(game, adjust), points, max }
}

export type NextStep = { kind: 'scene'; scene: Scene; eligible: string[] | null } | { kind: 'ad'; ad: Ad }

/**
 * What to show the room next: an ad break that follows the current scene, the next unconditional
 * scene, or a conditional one if at least one player's choices so far trigger it (only those
 * players get to answer it).
 */
export function nextLiveScene(
  history: { sceneId: string; eligible: string[] | null }[],
  answers: AnswersByScene,
  players: { id: string; name: string; joinedStep: number }[],
): NextStep | null {
  const last = history.at(-1)
  if (last && AD_AFTER[last.sceneId]) return { kind: 'ad', ad: AD_AFTER[last.sceneId] }
  // After an ad, continue from the scene it followed.
  const lastSceneId = last && isAd(last.sceneId) ? AD_BY_ID[last.sceneId].after : last?.sceneId
  const start = lastSceneId ? SCENES.findIndex((s) => s.id === lastSceneId) + 1 : 0
  for (const scene of SCENES.slice(start)) {
    if (!scene.condition) return { kind: 'scene', scene, eligible: null }
    const eligible = players
      .filter((p) => scene.condition!(playerResult(p, history, answers).game.flags))
      .map((p) => p.id)
    if (eligible.length) return { kind: 'scene', scene, eligible }
  }
  return null
}

/** True if no scenes at all remain after the current one (so "Next" means "Results"). */
export const isLastScene = (sceneId: string | undefined) =>
  sceneId !== undefined && !AD_AFTER[sceneId] && SCENES.findIndex((s) => s.id === sceneId) === SCENES.length - 1

/** 1-based number of real scenes shown so far (ad breaks don't count). */
export const sceneNumber = (history: { sceneId: string }[]) => history.filter((h) => !isAd(h.sceneId)).length
