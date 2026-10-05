# Colearn Security Training

*Fajar's First Month: a security adventure with a time machine.*

A story-driven IT security training minigame. Players follow **Fajar**, a new Customer Care Ops at Colearn, through
their first four weeks: phishing vs. legit emails, social engineering (Slack, phone, Instagram, in person), password
storage and sharing, keeping company information inside Colearn, public WiFi traps (evil twins, fake captive portals,
certificate installs) and laptop hijacking (unattended laptops, tech-support scams with remote-access tools, USB drops).

Every choice moves three meters (Colearn Security, Colearn Business, Fajar's Career) and shapes one of four endings:
**Fajar, Security Champion**, **Survived, with scars**, **In the news (for the wrong reasons)** or **Fajar got fired**. After an ending, the
**time machine** lets players jump back to any decision and rewrite the future.

There are two ways to play:

- **Live session (Kahoot-style):** a trainer hosts, everyone joins on their phone with a game PIN. The host moves
  the story forward, opens answers for a set time (15 seconds by default), and sees how the room voted after each
  question and how everyone's futures turned out at the end.
- **Solo:** self-paced, with the time machine. Live players can also carry their choices into solo mode afterwards.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build in dist/
```

Live mode works locally with no setup: `npm run dev` serves the API from memory (no admin passcode needed
locally). To try it, open the app in one window and pick **Host a live session**, then join from other windows or
phones on the same network (`npm run dev -- --host`) with the PIN.

## How a live session works

1. **Host** picks *Host a live session*, enters the admin passcode and an answer time (15s by default), and gets a
   PIN, a QR code and a click-to-copy join link. The answer time can be changed in the lobby only; it's locked once
   the story starts. The lobby (and every player's waiting screen) explains the scoring.
2. **Players** open the site, enter the PIN and their name.
3. For each scene the host clicks **Start / Next scene**. Everyone can read it and spot red flags, but the answer
   options stay hidden (on the host screen and on phones) until the host clicks **Open answers**. Players can change
   their answer until the timer runs out (the host can also stop the timer early).
4. When time's up, the host screen shows the answer distribution with each option's score, and each player sees
   what their choice led to. A player who doesn't answer gets **−3** for that question.
5. Every player has their own Fajar. Follow-up incident scenes ("Something's not right…", "The laptop has a mind of
   its own") only go to the players whose earlier choices triggered them; everyone else sits it out and gets **+1**,
   so scores stay comparable.
6. Ad breaks (see `src/data/ads.ts`) play between scenes on every screen; the host continues when ready.
7. At the end the host sees the ending distribution, a leaderboard, the share of best answers per question, and can
   download a CSV. Players get their own ending and report card.

## Project layout

| Path | What's in it |
| --- | --- |
| `src/data/scenes.ts` | All story content: scenes, choices, red flags, consequences, lessons |
| `src/data/endings.ts` | The four endings |
| `src/data/ads.ts` | "Ad breaks" between scenes (e.g. password managers after "The key ring") |
| `src/engine.ts` | Game rules: replaying choices, conditional scenes, ending selection, report card |
| `src/live/` | Live mode: host app, player app, next-scene/eligibility logic, API client |
| `api/game.js` | Live-session API (Vercel Function): rooms, players, answers, timers. Stores data in Redis |
| `src/components/` | Screens (intro, scene, outcome, ending + time machine) and media mockups (Gmail, Slack, Instagram, phone call, in-person) |
| `src/styles.css` | All styling; brand colors are CSS variables at the top |

### Editing content

- **Add a scene:** append an object to `SCENES` in `src/data/scenes.ts`. Scenes play in array order.
- **Scoring:** every question has 4 choices, each with a `score`: `2` = the best choice (exactly one per question),
  `1` = good but not the best, `0` = kept yourself safe but did nothing to make Colearn safer, `-1` = bad but not
  fatal, `-2` = fatal. Other scores can repeat. Choices are shuffled on screen, so their order in the file doesn't
  matter. Live mode adds `-3` for no answer and `+1` for sitting out a follow-up (`MISSED_POINTS` /
  `SAT_OUT_POINTS` in `src/engine.ts`).
- **Ad breaks:** add an entry to `ADS` in `src/data/ads.ts` with the id of the scene it should follow.
- **Check your edits:** `npm run check` verifies scores, red flags, ad breaks and that no real-looking phone numbers
  slipped in (use `+62 XXX-XXXX-XXXX`).
- **Branching:** give a scene a `condition: (flags) => boolean`. Flags come from `choice.flags` on earlier choices
  (see `account-weird`, which only appears if Fajar's account was compromised).
- **Red flags:** wrap text as `{ t: 'text', flag: 'id' }` and add a matching entry to `redFlags`. Use
  `href` on a segment to make a link whose real destination shows on hover. Set `redFlags: []` for legit messages
  (spotting stays on, but there's nothing to find).
- **Ending rules:** `computeEnding()` in `src/engine.ts`. Fatal (`-2`) choices decide the bad endings (1 → in the
  news, 3 → fired). Without any fatal choice, the total score decides: at least half the maximum → security
  champion, 0 or more → survived with scars, below 0 → in the news.

Solo progress is saved in `localStorage`. Live sessions are stored in Redis and expire after 6 hours.

## Deploy to Vercel

Vercel auto-detects the Vite app (build `npm run build`, output `dist`) and turns `api/game.js` into a Function.

1. **Import the project:** push this folder to a GitHub repo and "Add New Project" in Vercel, or run `npx vercel`.
2. **Add Redis:** in the Vercel project, go to *Storage* (or *Marketplace*) → **Upstash for Redis** → connect it to
   the project. This sets `KV_REST_API_URL` / `KV_REST_API_TOKEN` (or `UPSTASH_REDIS_REST_URL` / `_TOKEN`)
   automatically.
3. **Set the admin passcode:** add an environment variable `ADMIN_PASSCODE`. Only people who know it can host.
   Without it, hosting is disabled in production.
4. Redeploy. Players only need the site URL and the game PIN.

Usage: each player polls the API about once a second, so a 45-player, 20-minute session costs roughly 55,000 Redis
commands. Upstash's free tier covers a few sessions a month; beyond that it's pay-as-you-go.
