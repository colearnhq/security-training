/**
 * Types shared by the live-session API (api/game.js) and the browser.
 * Type-only: nothing here ends up in the server bundle.
 */

export type RoomPhase = 'lobby' | 'reading' | 'answering' | 'results'

/** One scene the host has shown. `eligible` = player ids allowed to answer (null = everyone). */
export interface ShownScene {
  sceneId: string
  eligible: string[] | null
}

export interface Answer {
  /** choice id */
  c: string
  /** red flags the player spotted */
  s: string[]
}

export interface Room {
  pin: string
  hostKey: string
  createdAt: number
  /** answer time in seconds for the next question */
  duration: number
  phase: RoomPhase
  history: ShownScene[]
  /** when answers close (server ms timestamp); only meaningful while phase is "answering" */
  deadline: number | null
}

export interface PlayerInfo {
  name: string
  joinedAt: number
  /** history.length when the player joined, so late joiners aren't penalised for earlier scenes */
  joinedStep: number
}

export type HostRoom = Omit<Room, 'hostKey'>

/** Players only learn whether *they* may answer each scene, never other players' ids. */
export type PlayerRoom = Omit<Room, 'hostKey' | 'history'> & { history: { sceneId: string; forMe: boolean }[] }

export interface HostView {
  now: number
  room: HostRoom
  players: ({ id: string } & PlayerInfo)[]
  /** answers for the current scene, by player id */
  answers: Record<string, Answer>
  /** answers for every shown scene (sceneId → playerId → answer); sent at results or when asked */
  allAnswers?: Record<string, Record<string, Answer>>
}

export interface PlayerView {
  now: number
  room: PlayerRoom
  playerCount?: number
  /** present when requested with mine=1; null if the player isn't in this room */
  me?: PlayerInfo | null
  myAnswer?: Answer | null
  /** every answer this player gave, sent once the game reaches results */
  myAnswers?: Record<string, Answer>
}
