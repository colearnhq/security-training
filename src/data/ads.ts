/**
 * "Commercial breaks": info screens shown after a scene, with no question to answer.
 * Keyed by the id of the scene they follow.
 */

export interface AdProduct {
  name: string
  emoji: string
  tagline: string
  url: string
}

export interface Ad {
  id: string
  /** id of the scene this ad plays after */
  after: string
  kicker: string
  title: string
  intro: string
  products: AdProduct[]
  reasons: { icon: string; title: string; text: string }[]
  footnote: string
}

export const ADS: Ad[] = [
  {
    id: 'ad-password-managers',
    after: 'password-setup',
    kicker: '📺 A quick word from our sponsor: your future self',
    title: 'Stop remembering passwords. Start using a password manager.',
    intro:
      'A password manager is an encrypted vault for all your passwords. You remember ONE strong master passphrase; it remembers everything else. Pick one and install it today:',
    products: [
      { name: 'Bitwarden', emoji: '🛡️', tagline: 'Open source, free plan, all devices', url: 'https://bitwarden.com/download/' },
      { name: 'LastPass', emoji: '🔑', tagline: 'Free plan, browser and mobile apps', url: 'https://www.lastpass.com/download' },
      { name: '1Password', emoji: '🔐', tagline: 'Paid, very polished, family and team plans', url: 'https://1password.com/downloads' },
      { name: 'Proton Pass', emoji: '🟣', tagline: 'Free plan, from the makers of Proton Mail', url: 'https://proton.me/pass/download' },
    ],
    reasons: [
      {
        icon: '🎲',
        title: 'A unique, strong password everywhere',
        text: 'It generates long random passwords for every site, so one leaked password can’t unlock all your other accounts.',
      },
      {
        icon: '🎣',
        title: 'Built-in phishing detector',
        text: 'It only autofills on the real website. If it won’t fill in your password, look twice: you might be on a fake login page.',
      },
      {
        icon: '🤝',
        title: 'Share passwords safely',
        text: 'Shared vaults (or Bitwarden Send) let you give a teammate access without pasting the password into Slack, WhatsApp or email, and you can take it back later.',
      },
      {
        icon: '🔄',
        title: 'Rotating passwords becomes painless',
        text: 'Generate a new one, save it, done. Most managers also warn you when a saved password shows up in a data breach.',
      },
      {
        icon: '📱',
        title: 'Works on laptop and phone',
        text: 'Your vault syncs across devices, so no more sticky notes, notebooks or "passwords" spreadsheets.',
      },
    ],
    footnote:
      'Protect the vault itself: use a long master passphrase you don’t use anywhere else, and turn on 2FA. For work accounts, ask IT which password manager Colearn uses.',
  },
]

export const AD_BY_ID: Record<string, Ad> = Object.fromEntries(ADS.map((a) => [a.id, a]))
export const AD_AFTER: Record<string, Ad> = Object.fromEntries(ADS.map((a) => [a.after, a]))
export const isAd = (id: string | undefined) => id !== undefined && id in AD_BY_ID
