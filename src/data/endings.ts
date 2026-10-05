import type { Ending } from '../types'

/** Ordered from best to worst, used for the "endings discovered" gallery. */
export const ENDINGS: Ending[] = [
  {
    id: 'champion',
    emoji: '🛡️',
    title: 'Fajar, Security Champion',
    year: 2028,
    tone: 'good',
    headline: "COLEARN RANKED AMONG INDONESIA'S MOST TRUSTED EDTECHS",
    story:
      'Fajar made the right call when it mattered. Parents trust Colearn, attackers move on to easier targets, and Fajar becomes the go-to person for "is this phishing?" questions. The future looks bright.',
  },
  {
    id: 'scars',
    emoji: '🩹',
    title: 'Survived, with scars',
    year: 2027,
    tone: 'meh',
    headline: "COLEARN GROWS STEADILY DESPITE 'A FEW HICCUPS'",
    story:
      'No disasters, but plenty of near misses: plain-text passwords here, loose talk there. Colearn keeps growing, but IT has a lot more grey hair than they should. Fajar passes probation… just barely.',
  },
  {
    id: 'incident',
    emoji: '📰',
    title: 'In the news (for the wrong reasons)',
    year: 2027,
    tone: 'bad',
    headline: 'COLEARN APOLOGIZES TO PARENTS AFTER SECURITY INCIDENT',
    story:
      "One slip opened the door. Colearn spends the next quarter on damage control instead of building great lessons. The company survives, growth slows, and Fajar is still employed, on a performance improvement plan and on first-name terms with the whole IT team.",
  },
  {
    id: 'fired',
    emoji: '📦',
    title: 'Fajar got fired',
    year: 2027,
    tone: 'terrible',
    headline: "NEW JOINER'S FIRST MONTH BECOMES CASE STUDY IN EVERY ONBOARDING DECK",
    story:
      'Colearn survives, barely, but the damage is too big to ignore. HR (the real Ima, this time) has a very awkward conversation with Fajar. Fajar carries a cardboard box to the lift and wonders: if only there were a way to go back and fix it…',
  },
]

export const ENDING_BY_ID: Record<string, Ending> = Object.fromEntries(ENDINGS.map((e) => [e.id, e]))
