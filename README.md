# Fajar's First Month: Colearn Security Quest

A story-driven IT security training minigame. Players follow **Fajar**, a new Customer Care Ops at Colearn, through
their first four weeks: phishing vs. legit emails, social engineering (Slack, phone, Instagram, in person), password
storage and sharing, keeping company information inside Colearn, public WiFi traps (evil twins, fake captive portals,
certificate installs) and laptop hijacking (unattended laptops, tech-support scams with remote-access tools, USB drops).

Every choice moves three meters (Colearn Security, Colearn Business, Fajar's Career) and shapes one of six endings,
from **"Colearn goes bankrupt"** to **"Colearn becomes the world's Education Lab powerhouse"**. After an ending, the
**time machine** lets players jump back to any decision and rewrite the future.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Project layout

| Path | What's in it |
| --- | --- |
| `src/data/scenes.ts` | All story content: scenes, choices, red flags, consequences, lessons |
| `src/data/endings.ts` | The six endings |
| `src/engine.ts` | Game rules: replaying choices, conditional scenes, ending selection, report card |
| `src/components/` | Screens (intro, scene, outcome, ending + time machine) and media mockups (Gmail, Slack, Instagram, phone call, in-person) |
| `src/styles.css` | All styling; brand colors are CSS variables at the top |

### Editing content

- **Add a scene:** append an object to `SCENES` in `src/data/scenes.ts`. Scenes play in array order.
- **Scoring:** every question has 4 choices, each with a `score`: `2` = the best choice (exactly one per question),
  `1` = good but not the best, `-1` = bad but not fatal, `-2` = fatal. Other scores can repeat. Choices are shuffled
  on screen, so their order in the file doesn't matter.
- **Branching:** give a scene a `condition: (flags) => boolean`. Flags come from `choice.flags` on earlier choices
  (see `account-weird`, which only appears if Fajar's account was compromised).
- **Red flags:** wrap text as `{ t: 'text', flag: 'id' }` and add a matching entry to `redFlags`. Use
  `href` on a segment to make a link whose real destination shows on hover. Set `redFlags: []` for legit messages
  (spotting stays on, but there's nothing to find).
- **Ending rules:** `computeEnding()` in `src/engine.ts`. Fatal (`-2`) choices decide the bad endings (1 → in the
  news, 3 → fired, 5 → bankrupt). Without any fatal choice, the total score decides: perfect → powerhouse,
  at least half the maximum → security champion, 0 or more → survived with scars, below 0 → in the news.

Progress is saved in `localStorage`, so no backend is needed.

## Deploy to Vercel

It's a static Vite app, so Vercel auto-detects it (build `npm run build`, output `dist`).

- **Git:** push this folder to a GitHub repo, then "Add New Project" in Vercel and import it.
- **CLI:** `npx vercel` (preview) / `npx vercel --prod` from this folder.
