/**
 * A piece of rich text. Plain strings are normal text; objects can be
 * red flags (clickable in "spot the red flag" mode) and/or links whose
 * real destination is revealed on hover.
 */
export type Seg = string | { t: string; flag?: string; href?: string }
export type Rich = Seg[]

export type Category = 'phishing' | 'social' | 'password' | 'info' | 'wifi' | 'device' | 'incident'
/**
 * 2 = the best choice, 1 = good but not the best, 0 = kept yourself safe but did nothing to make
 * Colearn safer, -1 = bad but not fatal, -2 = fatal.
 */
export type Score = 2 | 1 | 0 | -1 | -2

export interface Stats {
  security: number
  business: number
  career: number
}

export interface RedFlag {
  id: string
  label: string
  explain: string
}

export interface EmailMedia {
  kind: 'email'
  fromName: string
  fromAddress: Rich
  to: string
  subject: Rich
  time: string
  body: Rich[]
}

export interface ChatMessage {
  who: string
  avatar: string
  tag?: Rich
  text: Rich
  time?: string
}

export interface ChatMedia {
  kind: 'chat'
  app: 'slack' | 'instagram'
  title: Rich
  subtitle?: Rich
  messages: ChatMessage[]
}

export interface CallMedia {
  kind: 'call'
  callerName: Rich
  callerNumber: Rich
  lines: { who: 'them' | 'you' | 'sms'; text: Rich }[]
}

export interface IrlMedia {
  kind: 'irl'
  location: string
  art: string
  lines: { who: string; text: Rich }[]
}

export interface TaskMedia {
  kind: 'task'
  app: string
  icon: string
  title: string
  body: Rich[]
}

export interface WifiNetwork {
  name: Rich
  /** e.g. ['🔒'] or [{ t: 'Open', flag: 'open' }] */
  security: Rich
  signal: 1 | 2 | 3 | 4
  note?: Rich
}

export interface WifiMedia {
  kind: 'wifi'
  location: string
  networks: WifiNetwork[]
  /** Captive portal page shown after connecting to one of the networks. */
  portal?: { caption: string; url: Rich; lines: Rich[]; button: string }
  notes?: Rich[]
}

export interface PopupMedia {
  kind: 'popup'
  url: Rich
  title: Rich
  lines: Rich[]
  buttons: string[]
}

export type Media = EmailMedia | ChatMedia | CallMedia | IrlMedia | TaskMedia | WifiMedia | PopupMedia

export interface Choice {
  id: string
  text: string
  score: Score
  delta: Partial<Stats>
  flags?: string[]
  result: string
  ripple: string
}

export interface Scene {
  id: string
  when: string
  category: Category
  title: string
  intro: string
  media: Media
  /** undefined = no spotting mini-game for this scene; [] = spotting on, but nothing to find */
  redFlags?: RedFlag[]
  choices: Choice[]
  lesson: string
  /** Only show this scene if the condition holds for flags set by earlier choices. */
  condition?: (flags: Set<string>) => boolean
}

export interface ChoiceRecord {
  sceneId: string
  choiceId: string
  spotted: string[]
}

export interface Ending {
  id: string
  emoji: string
  title: string
  year: number
  headline: string
  story: string
  tone: 'great' | 'good' | 'meh' | 'bad' | 'terrible'
}
