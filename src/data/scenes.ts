import type { Scene } from '../types'

/**
 * Fajar's first month at Colearn, in order. Scenes with a `condition` only
 * appear when earlier choices set the matching flags.
 *
 * All scenarios are fictional and for internal training only.
 */
export const SCENES: Scene[] = [
  // ───────────────────────────── Week 1 ─────────────────────────────
  {
    id: 'ima-welcome',
    when: 'Week 1 · Monday · 08:47',
    category: 'phishing',
    title: 'A warm welcome… or is it?',
    intro:
      "It's Fajar's first day as Customer Care Ops at Colearn. Fresh laptop, hot kopi susu, and the very first email is already waiting.",
    media: {
      kind: 'email',
      fromName: 'Ima (HR Colearn)',
      fromAddress: [{ t: 'ima.hr@colearn-onboarding.com', flag: 'domain' }],
      to: 'fajar@colearn.id',
      subject: [{ t: '[URGENT] ', flag: 'deadline' }, 'Selamat datang Fajar! Complete your payroll onboarding'],
      time: '08:47',
      body: [
        ['Hi Fajar,'],
        [
          'Welcome to the Colearn family! 🎉 To make sure your first salary is paid on time, please complete your payroll onboarding ',
          { t: 'before 12:00 today, or your payroll will be delayed to next month.', flag: 'deadline' },
        ],
        [
          'Just sign in with your Google Workspace account here: ',
          { t: 'https://colearn.id/onboarding', href: 'http://colearn-id.onboard-portal.co/login', flag: 'link' },
        ],
        [
          'For verification you will need to ',
          { t: 're-enter your Google password, your bank account number, and a photo of your KTP', flag: 'ask' },
          '.',
        ],
        ['Terima kasih,'],
        ['Ima', ' · People & Culture'],
      ],
    },
    redFlags: [
      {
        id: 'domain',
        label: 'Lookalike sender domain',
        explain:
          'Colearn emails come from @colearn.id. "colearn-onboarding.com" is a totally different domain that anyone can buy for a few dollars.',
      },
      {
        id: 'deadline',
        label: 'Artificial urgency',
        explain: '"[URGENT]" and "your salary will be delayed" are pressure tactics to make you act before you think.',
      },
      {
        id: 'link',
        label: 'Link text ≠ real destination',
        explain:
          'The link says colearn.id, but hovering reveals it goes to onboard-portal.co. Always hover (or long-press on mobile) before clicking.',
      },
      {
        id: 'ask',
        label: 'Asks for password & sensitive documents',
        explain:
          'HR never needs your Google password. KTP and bank details only go through official HR processes that HR walks you through.',
      },
    ],
    choices: [
      {
        id: 'login',
        text: "Click the link and sign in. It's from HR, and I want my salary!",
        score: -2,
        delta: { security: -25, business: -10, career: -10 },
        flags: ['creds_stolen'],
        result:
          "The page looked exactly like Google's sign-in. Fajar typed the password… and got redirected to a 404. Somewhere far away, someone now has Fajar's Colearn account.",
        ripple: "Attackers now hold the keys to Fajar's inbox, Slack and the CS Dashboard.",
      },
      {
        id: 'reply',
        text: 'Reply to the email: "Hi Ima, is this legit?"',
        score: -1,
        delta: { security: -5, career: -2 },
        result:
          'Within a minute: "Yes Fajar, 100% legit, please hurry 🙏". Of course it says that. You just asked the attacker. And now they know your inbox is active.',
        ripple: 'Fajar lands on a "responsive target" list. Expect more phishing soon.',
      },
      {
        id: 'verify',
        text: "Check with Ima via her official Slack profile, then hit \"Report phishing\" in Gmail",
        score: 2,
        delta: { security: 10, business: 5, career: 8 },
        flags: ['reported_phish'],
        result:
          'Ima replies on Slack: "Nope, not me! Onboarding is in person with me today at 10:00 😅 Thanks for reporting!" IT blocks the domain for the whole company. Three other new joiners got the same email.',
        ripple: 'Fajar protected three other new hires on day one.',
      },
      {
        id: 'delete',
        text: 'Looks weird. Delete it and move on.',
        score: 1,
        delta: { security: 3 },
        result:
          "Fajar is safe, but the email is still sitting in other new joiners' inboxes. A report would have let IT block it for everyone.",
        ripple: 'Another new joiner clicked it. IT spends the afternoon cleaning up.',
      },
    ],
    lesson:
      "Check the sender's domain, hover links before clicking, and be extra suspicious when urgency meets requests for passwords or documents. Verify through a separate official channel, never by replying.",
  },

  {
    id: 'password-setup',
    when: 'Week 1 · Monday · 10:30',
    category: 'password',
    title: 'The key ring',
    intro:
      "IT hands Fajar access to Google Workspace, Slack, the CS Dashboard and Colearn's Meta Business Suite. That's a lot of passwords for one morning.",
    media: {
      kind: 'task',
      app: 'IT Onboarding Checklist',
      icon: '🔐',
      title: 'Welcome, Fajar! Let’s get you set up',
      body: [
        ['✅ Laptop received'],
        ['✅ Google Workspace: fajar@colearn.id'],
        ['⬜ Set passwords for Slack, CS Dashboard & Meta Business Suite'],
        ['⬜ Accept your company Bitwarden invite (check your inbox)'],
        ['💬 Raka (IT): "Set them up however works for you, just don’t get locked out 😄"'],
      ],
    },
    choices: [
      {
        id: 'same',
        text: 'One strong password for everything: Fajar2026! Easy to remember.',
        score: -1,
        delta: { security: -10, career: -2 },
        flags: ['weak_pw'],
        result:
          "It passes every \"strong password\" check. But when a random online shop Fajar uses gets breached, attackers try 'Fajar2026!' everywhere, including Colearn.",
        ripple: 'One leak anywhere means a leak everywhere (credential stuffing).',
      },
      {
        id: 'sticky',
        text: 'Different passwords, written on a sticky note on the monitor',
        score: -1,
        delta: { security: -8 },
        flags: ['weak_pw'],
        result:
          'Unique passwords, nice! But the sticky note is visible to every visitor, cleaner and courier walking past, and to anyone on a video call with Fajar.',
        ripple: 'A visitor snaps a photo of the desk. The CS Dashboard password is in it.',
      },
      {
        id: 'sheet',
        text: "Save them in a Google Sheet called 'passwords' in my Drive",
        score: -1,
        delta: { security: -10 },
        flags: ['weak_pw'],
        result:
          'If anyone gets into your Google account, the first thing they search for is "password". Fajar just gift-wrapped everything.',
        ripple: 'One compromised account would now unlock all the others.',
      },
      {
        id: 'bitwarden',
        text: 'Accept the Bitwarden invite, generate a unique strong password per app, and turn on 2FA everywhere',
        score: 2,
        delta: { security: 12, business: 3, career: 5 },
        flags: ['uses_pm'],
        result:
          "Fajar now remembers just ONE strong master passphrase. Bitwarden handles the rest, and only autofills on the real sites. Bonus: that helps spot fake login pages!",
        ripple: 'Every Colearn account Fajar owns now has its own lock and key.',
      },
    ],
    lesson:
      'Use the company password manager (Bitwarden / LastPass) with one strong master passphrase, a unique password per account, and 2FA on. Never reuse passwords, and never keep them in notes, sheets or sticky notes.',
  },

  {
    id: 'marc-townhall',
    when: 'Week 1 · Tuesday · 09:15',
    category: 'phishing',
    title: 'An email from the COO',
    intro:
      "After Monday, Fajar is suspicious of everything. Now here's an email from Marc Irawan, Colearn's COO.",
    media: {
      kind: 'email',
      fromName: 'Marc Irawan',
      fromAddress: ['marc.irawan@colearn.id'],
      to: 'all-cs@colearn.id',
      subject: ['Town Hall this Friday + CS OKRs for Q4'],
      time: '09:15',
      body: [
        ['Hi team,'],
        ['A warm welcome to our new joiners this week! 👋'],
        [
          'This Friday at 16:00 we have our monthly Town Hall in the main room (Google Meet link in the calendar invite for remote folks). I will walk through the Q4 CS OKRs.',
        ],
        [
          'Please skim the draft beforehand: ',
          { t: 'Q4 CS OKRs (Google Doc)', href: 'https://docs.google.com/document/d/1xQ4-cs-okr/edit' },
        ],
        ['No need to reply, just come with questions.'],
        ['Cheers,'],
        ['Marc'],
      ],
    },
    redFlags: [],
    choices: [
      {
        id: 'report',
        text: "Report it as phishing. I'm not falling for this again!",
        score: -1,
        delta: { business: -6, career: -5 },
        result:
          'IT drops what they\'re doing to investigate a real email from the COO, and the report lands in their weekly false-alarm count. Fajar never opens the OKRs, shows up unprepared and asks questions the doc already answered. Being careful is good; refusing to trust anything stops real work.',
        ripple: 'Healthy skepticism ✅. Paranoia that blocks real work (and wastes IT\'s time) ❌.',
      },
      {
        id: 'check',
        text: 'Check it: sender is @colearn.id, link goes to docs.google.com, no urgency or password request. Open it and join.',
        score: 2,
        delta: { security: 5, business: 4, career: 6 },
        result:
          "Legit. The doc opens in Fajar's already signed-in Google account with no extra login. Fajar shows up prepared and asks a sharp question. Marc remembers the name.",
        ripple: 'Fajar gets a reputation as the new joiner who does the homework.',
      },
      {
        id: 'forward',
        text: 'Forward it to my personal Gmail so I can read the OKRs at home',
        score: -1,
        delta: { security: -8, business: -5, career: -4 },
        flags: ['info_outside'],
        result:
          "Colearn's OKRs now sit in a personal inbox with no company security controls. And Fajar's personal Gmail doesn't have 2FA.",
        ripple: "Internal plans are now outside Colearn's walls.",
      },
      {
        id: 'ai-tool',
        text: 'Download the doc and upload it to a free online "AI PDF summarizer" so I can read it faster',
        score: -1,
        delta: { security: -6, business: -4, career: -3 },
        flags: ['info_outside'],
        result:
          "The summary was nice. The fine print wasn't: the free tool keeps uploads and may use them to train its models. Colearn's Q4 OKRs now live on a stranger's server.",
        ripple: "Colearn's plans are sitting in a random AI tool's database.",
      },
    ],
    lesson:
      "Not every email is phishing! Legit emails come from the real domain, link to real services, and don't pressure you or ask for credentials. Keep company documents in company accounts.",
  },

  {
    id: 'ceo-giftcards',
    when: 'Week 1 · Wednesday · 13:02',
    category: 'social',
    title: 'The CEO needs a favor',
    intro: "Fajar's Slack pings. It's… the CEO? On day three?",
    media: {
      kind: 'chat',
      app: 'slack',
      title: ['Abhay Saboo'],
      subtitle: ['Direct message'],
      messages: [
        {
          who: 'Abhay Saboo',
          avatar: 'AS',
          tag: [{ t: 'EXTERNAL', flag: 'external' }],
          time: '13:02',
          text: ['Hi Fajar, are you at your desk? ', { t: 'I need a quick favor, please keep this confidential.', flag: 'secret' }],
        },
        {
          who: 'Abhay Saboo',
          avatar: 'AS',
          tag: [{ t: 'EXTERNAL', flag: 'external' }],
          time: '13:03',
          text: [
            "I'm in back-to-back investor meetings and can't take calls. ",
            { t: 'Please buy 10 Google Play gift cards (Rp 1.000.000 each)', flag: 'giftcards' },
            ' for a partner appreciation.',
          ],
        },
        {
          who: 'Abhay Saboo',
          avatar: 'AS',
          tag: [{ t: 'EXTERNAL', flag: 'external' }],
          time: '13:03',
          text: [{ t: 'Send me the codes within 30 minutes.', flag: 'urgency' }, " I'll reimburse you today, promise 🙏"],
        },
      ],
    },
    redFlags: [
      {
        id: 'external',
        label: 'Slack "EXTERNAL" tag',
        explain:
          "This account isn't in Colearn's workspace. Anyone can set their display name and photo to \"Abhay Saboo\".",
      },
      {
        id: 'secret',
        label: 'Request for secrecy',
        explain: '"Keep this confidential" is there to stop you from checking with anyone else.',
      },
      {
        id: 'giftcards',
        label: 'Gift cards',
        explain: 'No legitimate executive pays partners with gift cards. They are untraceable cash for scammers.',
      },
      {
        id: 'urgency',
        label: "Time pressure + \"can't call\"",
        explain: 'Classic CEO fraud: create urgency and block you from verifying by voice.',
      },
    ],
    choices: [
      {
        id: 'buy',
        text: "Buy them. It's the CEO, and I don't want to disappoint in week one!",
        score: -2,
        delta: { security: -15, business: -15, career: -15 },
        flags: ['giftcard_scam'],
        result:
          'Rp 10.000.000 in gift cards, drained within 4 minutes of sending the codes. The "CEO" stops replying. The real Abhay, when he hears about it: "I have never once needed gift cards 😅".',
        ripple: 'Rp 10 juta gone, and the scammers now know Colearn staff will pay.',
      },
      {
        id: 'ask',
        text: 'Reply in the same chat: "Is this really you, Pak Abhay?"',
        score: 0,
        delta: { security: -2 },
        result:
          '"Yes of course it\'s me, please hurry." Asking a suspected scammer to verify themselves never works. Fajar smells something off and stops replying, so Fajar is safe. But nobody else is warned: Fajar protected themselves and did nothing to make Colearn safer.',
        ripple: 'The scammer moves on to the next new joiner, who isn\'t as careful.',
      },
      {
        id: 'ignore',
        text: 'Ignore it. Not my business.',
        score: 0,
        delta: { security: 1 },
        result:
          "Fajar is safe, but that's all. Fajar protected themselves and did nothing to make Colearn safer: the scammer just moves on to the next new joiner. A 30-second report to IT would have stopped them.",
        ripple: 'Two days later, someone in Finance gets the same message.',
      },
      {
        id: 'verify',
        text: "Don't reply. Check Abhay's real profile in the Colearn workspace, tell my manager and report it to IT.",
        score: 2,
        delta: { security: 10, business: 6, career: 8 },
        flags: ['reported_ceo'],
        result:
          'The real Abhay\'s profile has no DMs to Fajar. IT removes the fake account and sends a company-wide heads-up. Abhay himself reacts 🔥 to the announcement thanking "Fajar from CS".',
        ripple: 'The whole company learns about the scam before anyone loses a rupiah.',
      },
    ],
    lesson:
      'CEO fraud relies on authority, urgency and secrecy. Verify any request for money, gift cards or data through a different, known channel (official profile, directory phone number, your manager). Real leaders will not mind.',
  },

  {
    id: 'wfc-wifi',
    when: 'Week 1 · Thursday · 13:20',
    category: 'wifi',
    title: 'Work from café',
    intro:
      "Thursday is WFA day. Fajar sets up at Kopi Senja in Kemang with an es kopi susu and a queue of parent tickets. First things first: internet.",
    media: {
      kind: 'wifi',
      location: 'Kopi Senja, Kemang',
      networks: [
        {
          name: [{ t: 'KopiSenja_FREE_5G', flag: 'twin' }],
          security: [{ t: '⚠️ Open', flag: 'open' }],
          signal: 4,
        },
        { name: ['Free_Public_WiFi'], security: [{ t: '⚠️ Open', flag: 'open' }], signal: 3 },
        { name: ['KopiSenja_Guest'], security: ['🔒'], signal: 2, note: ['Password printed on your receipt'] },
        { name: ['iPhone Fajar'], security: ['🔒'], signal: 4, note: ['Personal Hotspot'] },
        { name: ['DIRECT-7F-HP LaserJet'], security: ['🔒'], signal: 1 },
      ],
      portal: {
        caption: 'Fajar taps the strongest network, "KopiSenja_FREE_5G", and this page pops up:',
        url: [{ t: 'http://kopisenja-free.wifi-login.net/portal', flag: 'portal' }],
        lines: [
          ['☕ Welcome to Kopi Senja FREE WiFi!'],
          [
            'Enjoy 3 hours of free high-speed internet. ',
            { t: 'Sign in with your Google account (email + password) to continue.', flag: 'creds' },
          ],
        ],
        button: 'Sign in with Google',
      },
      notes: [['🧾 Receipt: "WiFi: KopiSenja_Guest · Pass: senja2026 · Terima kasih!"']],
    },
    redFlags: [
      {
        id: 'twin',
        label: 'Evil twin network',
        explain:
          'The café\'s real network (on the receipt) is "KopiSenja_Guest". A near-identical name with a stronger signal is a classic evil twin: an attacker\'s hotspot sitting a few tables away.',
      },
      {
        id: 'open',
        label: 'Open network, no password',
        explain:
          'On an open network your traffic isn’t encrypted by the Wi-Fi, and anyone connected can see or tamper with it.',
      },
      {
        id: 'portal',
        label: 'Weird login page address',
        explain: 'Plain http:// on a random "wifi-login.net" domain. It isn’t the café’s site and it certainly isn’t Google.',
      },
      {
        id: 'creds',
        label: 'Wi-Fi asking for your Google password',
        explain:
          'A Wi-Fi portal never needs your Google password. A real "Sign in with Google" always opens accounts.google.com, and you should check the address bar.',
      },
    ],
    choices: [
      {
        id: 'twin',
        text: 'Use KopiSenja_FREE_5G, the strongest signal, and sign in with Google',
        score: -2,
        delta: { security: -25, business: -8, career: -10 },
        flags: ['wifi_creds'],
        result:
          'The "café WiFi" was a pocket router in the backpack of a guy two tables away. Fajar\'s Google email and password went straight to him, and every page Fajar opened afterwards passed through his laptop first.',
        ripple: "The guy with the backpack now has Fajar's Colearn password.",
      },
      {
        id: 'public',
        text: 'Join Free_Public_WiFi. No login page, so it’s probably fine for Slack and the CS Dashboard.',
        score: -1,
        delta: { security: -8, career: -2 },
        result:
          'HTTPS protected most of Fajar\'s traffic, but halfway through the afternoon a fake "Your Slack session expired, sign in again" page appeared. Fajar almost typed the password before noticing the address bar.',
        ripple: 'Unknown open networks are a hunting ground. Fajar got lucky this time.',
      },
      {
        id: 'guest',
        text: "Use the café's real network from the receipt, KopiSenja_Guest",
        score: 1,
        delta: { security: 3 },
        result:
          "Much better than the open ones. But the password is printed on every receipt, so the café's network is shared with every stranger in the room. Fine for browsing, not ideal for the CS Dashboard full of student data.",
        ripple: "A guest network is still a stranger's network.",
      },
      {
        id: 'hotspot',
        text: "Turn on my phone's hotspot and work from that",
        score: 2,
        delta: { security: 10, business: 3, career: 5 },
        result:
          "Fajar's own password-protected hotspot, shared with nobody. A few thousand rupiah of data, and zero strangers in the middle. The guy with the backpack two tables away has to find another victim.",
        ripple: 'For sensitive work, your own hotspot beats any free WiFi.',
      },
    ],
    lesson:
      "Treat public WiFi as hostile. Check the exact network name with staff, never enter your password on a WiFi login page, and for company work prefer your own phone hotspot (or the company VPN if IT provides one).",
  },

  {
    id: 'wfc-laptop',
    when: 'Week 1 · Thursday · 15:10',
    category: 'device',
    title: 'Nature calls',
    intro: 'Two hours and three es kopi susu later, nature calls. Urgently.',
    media: {
      kind: 'irl',
      location: 'Kopi Senja, Kemang',
      art: '💻 ☕ 🚻',
      lines: [
        {
          who: 'narrator',
          text: [
            "Fajar's laptop is open, ",
            { t: 'with Gmail, Slack and the CS Dashboard all logged in.', flag: 'sessions' },
          ],
        },
        {
          who: 'Friendly stranger',
          text: [{ t: "Mas, go ahead, I'll keep an eye on your laptop 😊", flag: 'stranger' }],
        },
        {
          who: 'narrator',
          text: [{ t: 'He has been glancing at your screen for the last twenty minutes.', flag: 'shoulder' }],
        },
        {
          who: 'narrator',
          text: ['The toilet is downstairs. ', { t: '"It’ll only take two minutes," Fajar thinks.', flag: 'quick' }],
        },
      ],
    },
    redFlags: [
      {
        id: 'sessions',
        label: 'Unlocked and logged in to everything',
        explain:
          'An unlocked laptop is a master key: whoever sits down can read email, send Slack messages as you and export data. No password needed.',
      },
      {
        id: 'stranger',
        label: 'A stranger offering to "watch" it',
        explain: 'You have no idea who they are. Friendly offers are exactly how opportunistic thieves get close.',
      },
      {
        id: 'shoulder',
        label: 'Shoulder surfing',
        explain: 'Someone watching your screen may already have seen what you work on, or even what you typed.',
      },
      {
        id: 'quick',
        label: '"Only two minutes"',
        explain: 'Grabbing a laptop takes two seconds. Plugging in a malicious USB takes ten.',
      },
    ],
    choices: [
      {
        id: 'stranger',
        text: 'Accept the kind offer and leave the laptop open. Two minutes!',
        score: -2,
        delta: { security: -25, business: -12, career: -12 },
        flags: ['laptop_stolen'],
        result:
          'Fajar comes back to an empty table. No laptop, no friendly stranger. It was unlocked with every session live, and by the time IT remote-locked it 25 minutes later, the CS Dashboard\'s parent contact list had been exported.',
        ripple: "Thousands of parents' phone numbers are now in a stranger's hands.",
      },
      {
        id: 'lid',
        text: 'Close the lid and leave it on the table',
        score: -1,
        delta: { security: -8, career: -3 },
        result:
          "The laptop is still there when Fajar returns. Phew! But closing the lid doesn't always lock it straight away, and a laptop alone on a café table can disappear in seconds.",
        ripple: 'Nothing happened this time, but it was pure luck.',
      },
      {
        id: 'lock',
        text: 'Lock the screen (Win+L / Ctrl+Cmd+Q) and leave it with my bag',
        score: -1,
        delta: { security: -6, career: -2 },
        result:
          "Locking is a good habit, but the laptop is still sitting alone in a café, now with the bag right next to it. One grab and the thief has the laptop, Fajar's wallet, ID card and office access card. IT has to wipe the laptop remotely and Fajar loses days of work.",
        ripple: 'A locked laptop is still a laptop someone can carry away, bag included.',
      },
      {
        id: 'take',
        text: 'Lock the screen, pack the laptop and take it with me',
        score: 2,
        delta: { security: 10, business: 2, career: 5 },
        result:
          "It's a bit awkward carrying a laptop to the toilet, but nothing goes missing. When Fajar comes back, the \"friendly stranger\" has quietly left.",
        ripple: 'Laptop, data and parent contacts all stay safe.',
      },
    ],
    lesson:
      'Never leave your laptop unlocked, even for a moment: Win+L on Windows, Ctrl+Cmd+Q on Mac. In public places, take it with you. If a work device is lost or stolen, report it to IT immediately so they can lock and wipe it.',
  },

  {
    id: 'google-call',
    when: 'Week 1 · Friday · 11:20',
    category: 'social',
    title: 'Google is calling',
    intro: "An unknown number is calling Fajar's phone.",
    media: {
      kind: 'call',
      callerName: ['"Rizky, Google Workspace Security"'],
      callerNumber: [{ t: '+62 XXX-XXXX-XXXX (mobile)', flag: 'number' }],
      lines: [
        {
          who: 'them',
          text: [
            'Selamat siang, Pak Fajar. This is Rizky from Google Workspace Security. ',
            { t: 'We detected a suspicious login to fajar@colearn.id from Russia 10 minutes ago.', flag: 'scare' },
          ],
        },
        {
          who: 'them',
          text: [
            "To secure your account I'm sending a 6-digit verification code to your phone. ",
            { t: 'Please read it back to me so I can confirm you are the owner.', flag: 'otp' },
          ],
        },
        { who: 'sms', text: [{ t: 'G-482913 is your Google verification code. Don’t share it with anyone.', flag: 'sms' }] },
        { who: 'them', text: [{ t: 'Quickly please, Pak, or the account will be locked in 5 minutes.', flag: 'urgency' }] },
      ],
    },
    redFlags: [
      {
        id: 'number',
        label: 'Unsolicited call from a mobile number',
        explain: "Google does not phone users out of the blue about their account, let alone from a personal mobile number.",
      },
      { id: 'scare', label: 'Fear trigger', explain: 'A scary "login from Russia" story is designed to make you panic and comply.' },
      {
        id: 'otp',
        label: 'Asks for your verification code',
        explain: 'A 2FA/OTP code is the final key to your account. Anyone asking for it is trying to log in as you.',
      },
      { id: 'sms', label: 'The SMS itself says "don’t share"', explain: 'Even the code message warns you. Believe it.' },
      { id: 'urgency', label: 'Countdown pressure', explain: 'A fake deadline leaves no time to think or verify.' },
    ],
    choices: [
      {
        id: 'callback',
        text: '"I\'ll contact Google myself." Hang up, check myaccount.google.com, and report the call to IT.',
        score: 2,
        delta: { security: 10, business: 3, career: 6 },
        flags: ['reported_vishing'],
        result:
          "Fajar hangs up and checks Google's security page directly: no suspicious logins. IT confirms it's a known vishing (voice phishing) campaign targeting Indonesian companies this week.",
        ripple: 'IT warns everyone; the campaign gets zero Colearn victims.',
      },
      {
        id: 'read',
        text: "Read the code to Rizky. He's trying to help!",
        score: -2,
        delta: { security: -25, business: -10, career: -10 },
        flags: ['account_takeover'],
        result:
          '"Thank you Pak, your account is now secure." It isn\'t. Rizky already had Fajar\'s password from a leak; the code was the last piece. He\'s now inside Fajar\'s Google account.',
        ripple: "The attacker is reading Fajar's email and Drive in real time.",
      },
      {
        id: 'email',
        text: 'Ask him to send the request by email instead',
        score: 1,
        delta: { security: 2 },
        result:
          'Rizky happily agrees. Ten minutes later, a "Google Security" phishing email arrives. Fajar didn\'t give up the code, but didn\'t report it either.',
        ripple: 'The attacker tries again next week with a better story.',
      },
      {
        id: 'callback-same',
        text: 'Hang up, then call the same number back to check it’s really Google',
        score: -1,
        delta: { security: -4, career: -2 },
        result:
          '"Google Workspace Security, Rizky speaking!" Of course it\'s him again: calling back the number a scammer gave you just reaches the scammer. Fajar gets suspicious and hangs up, but wastes 20 minutes being pressured.',
        ripple: 'The scammer now knows Fajar will pick up and call back.',
      },
    ],
    lesson:
      'Never share OTP / 2FA codes with anyone, whether they say they are Google, IT or the bank. Hang up and contact the service yourself using an official website or number.',
  },

  // ─────────────── Conditional: only if Fajar's account got compromised ───────────────
  {
    id: 'account-weird',
    when: 'Week 2 · Monday · 08:05',
    category: 'incident',
    title: "Something's not right…",
    intro: "Monday morning. Fajar's Slack is on fire.",
    condition: (f) => ['creds_stolen', 'account_takeover', 'wifi_creds', 'laptop_stolen'].some((x) => f.has(x)),
    media: {
      kind: 'chat',
      app: 'slack',
      title: ['#cs-ops'],
      subtitle: ['12 members'],
      messages: [
        {
          who: 'Dimas (CS)',
          avatar: 'DS',
          time: '07:58',
          text: ['Fajar, why did you message 40 parents a link to a "payment update form"?? 😳'],
        },
        {
          who: 'Raka (IT)',
          avatar: 'RK',
          time: '08:04',
          text: [
            'Hi Fajar, we see activity on your account from an unknown device. Did you enter your password anywhere unusual, share a code with anyone, or lose your laptop? Please DM me ASAP.',
          ],
        },
      ],
    },
    choices: [
      {
        id: 'admit',
        text: 'Tell IT everything right now (what I clicked, typed, shared or left behind) and reset everything together',
        score: 2,
        delta: { security: 15, business: 10, career: 10 },
        flags: ['reported_incident'],
        result:
          'IT kills all sessions, resets passwords and warns the 40 parents within 30 minutes. Raka: "Thanks for being honest. Speed matters more than pride." Damage contained.',
        ripple: 'A bad week, but only a small incident report instead of a crisis.',
      },
      {
        id: 'hide',
        text: 'Panic. Say "no idea, maybe a bug" and quietly change my password myself',
        score: -2,
        delta: { security: -20, business: -15, career: -25 },
        flags: ['coverup'],
        result:
          "Changing the password didn't kick out the attacker's active session. By Wednesday, 12 parents had paid a fake \"invoice\". The logs show exactly what happened, and that Fajar knew.",
        ripple: 'A mistake became a cover-up, and a cover-up is much harder to forgive.',
      },
      {
        id: 'lead',
        text: 'Tell my team lead first and let them decide whether to involve IT',
        score: 1,
        delta: { security: 6, business: 4, career: 4 },
        flags: ['reported_incident'],
        result:
          "The team lead immediately loops in IT, and the incident is contained. But the detour cost 40 minutes, and 15 more parents got the fake link in the meantime. IT should hear directly, and first.",
        ripple: 'Contained, but more parents were hit than necessary.',
      },
      {
        id: 'announce',
        text: 'Post in #cs-ops "ignore any weird messages from me!" and deal with IT later',
        score: -1,
        delta: { security: -8, business: -6, career: -6 },
        result:
          "Colleagues are warned, but the parents aren't, and the attacker is still logged in. By the time Fajar gets to IT in the afternoon, the account has sent another 200 messages.",
        ripple: 'Warning colleagues is not the same as stopping the attacker.',
      },
    ],
    lesson:
      'Everyone can make mistakes. Report immediately: the first hour matters most. Hiding an incident turns a mistake into a disaster (and a career problem).',
  },

  // ───────────────────────────── Week 2 ─────────────────────────────
  {
    id: 'share-password',
    when: 'Week 2 · Tuesday · 14:40',
    category: 'password',
    title: 'Just paste it here, bro',
    intro: 'Dimas, a teammate on the CS squad, sends Fajar a frantic DM.',
    media: {
      kind: 'chat',
      app: 'slack',
      title: ['Dimas (CS)'],
      subtitle: ['Direct message'],
      messages: [
        {
          who: 'Dimas (CS)',
          avatar: 'DS',
          time: '14:40',
          text: ["Fajar!! A parent is waiting on the line and I'm locked out of the CS Dashboard shared account 😭"],
        },
        {
          who: 'Dimas (CS)',
          avatar: 'DS',
          time: '14:40',
          text: [
            'Can you ',
            { t: 'just paste the password here in the chat', flag: 'plaintext' },
            '? ',
            { t: 'Quick quick 🙏', flag: 'rush' },
          ],
        },
      ],
    },
    redFlags: [
      {
        id: 'plaintext',
        label: 'Password in plain text',
        explain:
          'Chat messages stay forever: Slack history, search, exports, phone notifications and screenshots. A password posted in chat is a password leaked later.',
      },
      {
        id: 'rush',
        label: 'Pressure, even from a real teammate',
        explain: "Dimas isn't a scammer, but urgency makes all of us skip safe habits.",
      },
    ],
    choices: [
      {
        id: 'paste',
        text: "Paste the password in Slack. He's a teammate, it's fine.",
        score: -1,
        delta: { security: -10, business: -3 },
        flags: ['plaintext_pw'],
        result:
          "Dimas is in. So is the password, forever: in Slack history, on Dimas's lock-screen notification, and in every future Slack export.",
        ripple: 'Months later a leaked Slack token exposes years of messages… including this one.',
      },
      {
        id: 'photo',
        text: 'Snap a photo of my password notes and send it',
        score: -1,
        delta: { security: -12 },
        flags: ['plaintext_pw'],
        result:
          "Now the password lives in Dimas's camera roll, synced to his personal cloud. And the photo accidentally shows two other passwords.",
        ripple: 'Three passwords leaked for the price of one.',
      },
      {
        id: 'bitwarden',
        text: 'Share it through a Bitwarden shared collection (or Bitwarden Send), and ask IT to give Dimas his own login',
        score: 2,
        delta: { security: 8, business: 3, career: 5 },
        result:
          'It takes 20 seconds. Dimas gets access, the password never touches the chat, and IT sets him up with his own account so access can be tracked and revoked.',
        ripple: 'The CS team moves off shared logins. Audits get way easier.',
      },
      {
        id: 'shout',
        text: 'Walk over and read it out loud across the office',
        score: -1,
        delta: { security: -5 },
        result: 'Dimas is in. So is everyone within earshot, including the courier dropping off lunch.',
        ripple: 'The whole row of desks now knows the CS Dashboard password.',
      },
    ],
    lesson:
      'Never share passwords in plain text: not in chat, email, photos, or out loud. Use the password manager’s secure sharing, and prefer individual accounts over shared ones.',
  },

  {
    id: 'parent-call',
    when: 'Week 2 · Thursday · 10:10',
    category: 'social',
    title: 'A worried parent',
    intro: "Fajar is on duty at Kakak Siaga, Colearn's CS hotline. The caller sounds stressed.",
    media: {
      kind: 'call',
      callerName: ['Kakak Siaga hotline · Unknown caller (says: "Ibu Sari")'],
      callerNumber: ['+62 XXX-XXXX-XXXX'],
      lines: [
        {
          who: 'them',
          text: [
            "Halo Kak, I'm Nadia's mother. Nadia Putri, grade 8. ",
            { t: "I lost my phone, so she can't log in.", flag: 'story' },
          ],
        },
        {
          who: 'them',
          text: [{ t: 'Can you tell me which email and phone number are registered on her account?', flag: 'data' }],
        },
        {
          who: 'them',
          text: [
            'And please ',
            { t: 'change the phone number to my new one: 0XXX-XXXX-XXXX', flag: 'change' },
            '. ',
            { t: "Her live class starts in 10 minutes, she can't miss it! Please be quick!", flag: 'emotion' },
          ],
        },
      ],
    },
    redFlags: [
      {
        id: 'story',
        label: 'Unverifiable story',
        explain: '"I lost my phone" is the most common excuse for skipping verification.',
      },
      {
        id: 'data',
        label: 'Asks you to reveal personal data',
        explain: 'A real account owner already knows their own email. They need access, not a readout of personal data.',
      },
      {
        id: 'change',
        label: 'Wants contact details changed',
        explain: 'Swapping the phone number hands over the whole account, because OTPs and resets go to the new number.',
      },
      {
        id: 'emotion',
        label: 'Emotional pressure',
        explain: 'Sympathy plus a 10-minute deadline is designed to make you bend the SOP.',
      },
    ],
    choices: [
      {
        id: 'help',
        text: 'Poor mom. Read out the details and update the number. Customer happiness first!',
        score: -2,
        delta: { security: -20, business: -15, career: -20 },
        flags: ['student_data_leak'],
        result:
          'The "mother" was a scammer harvesting student data. With the new number they took over the account, then messaged the real parents demanding payment for "exam unlocks". Under Indonesia\'s Personal Data Protection Law (UU PDP), this is a reportable breach.',
        ripple: "Colearn has to notify affected families, and a parents' WhatsApp group screenshot goes viral.",
      },
      {
        id: 'wa',
        text: "Say I'll sort it out later and give her my personal WhatsApp",
        score: -1,
        delta: { security: -8, business: -3, career: -5 },
        result:
          "Now customer conversations (and data) live on a personal phone, outside Colearn's CS tools. And the scammer has a direct line to keep working on Fajar.",
        ripple: 'The "mom" messages Fajar every day with new sob stories.',
      },
      {
        id: 'quiz',
        text: "Ask her to confirm more of Nadia's details first (full name, school, date of birth), then update the number if everything matches",
        score: -1,
        delta: { security: -10, business: -6, career: -6 },
        flags: ['student_data_leak'],
        result:
          "The caller answers every question instantly and correctly. Those details were already leaked: a school group chat, an Instagram bio and an older data breach. Fajar updates the number, and the account is taken over five minutes before Nadia's class. Questions only prove someone knows the answers, not that they're the parent.",
        ripple: "Nadia is locked out of her own class, and the attacker now controls her account.",
      },
      {
        id: 'sop',
        text: 'Stay kind but follow the verification SOP: verify through the registered contact and disclose nothing until verified',
        score: 2,
        delta: { security: 10, business: 8, career: 10 },
        result:
          'Fajar calmly explains the process and sends a verification to the registered contact. The caller suddenly has to go. Nadia joins her live class on time from her own device, and the real mom confirms she never called. Nadia\'s data stays safe.',
        ripple: "Nadia's family never even knows how close it was.",
      },
    ],
    lesson:
      'Social engineers love helpful people and tight deadlines. Always follow the verification SOP and verify through the registered contact, not with quiz questions (personal details are often already leaked). Never disclose personal data to unverified callers, and keep customer conversations in official Colearn channels.',
  },

  {
    id: 'airport-wifi',
    when: 'Week 2 · Friday · 17:10',
    category: 'wifi',
    title: 'Kuota habis at the airport',
    intro:
      "Fajar is at the airport, flying home to Yogyakarta for the weekend. Boarding in 40 minutes. Then Dimas pings: a furious parent needs an order checked in the CS Dashboard. And of course, Fajar's phone data just ran out.",
    media: {
      kind: 'wifi',
      location: 'Airport, Terminal 3, Gate 12',
      networks: [
        { name: ['Airport_Free_WiFi'], security: [{ t: '⚠️ Open', flag: 'open' }], signal: 2 },
        {
          name: [{ t: 'Airport_Free_WiFi_FAST', flag: 'twin' }],
          security: [{ t: '⚠️ Open', flag: 'open' }],
          signal: 4,
        },
        { name: ['iPhone Fajar'], security: ['🔒'], signal: 4, note: [{ t: 'No data: kuota habis', flag: 'nodata' }] },
      ],
      portal: {
        caption: 'Fajar connects to Airport_Free_WiFi_FAST and gets this page:',
        url: [{ t: 'http://airport-wifi-secure.net/setup', flag: 'portal' }],
        lines: [
          ['✈️ One more step to connect!'],
          [
            'For your security, ',
            { t: 'download and install the "Airport Secure Certificate" profile', flag: 'cert' },
            ' to continue browsing.',
          ],
          [{ t: 'Required by aviation security regulations.', flag: 'authority' }],
        ],
        button: 'Install certificate',
      },
      notes: [
        ['💬 Dimas (Slack, 16:58): "Faj, parent is FURIOUS about order #4471, can you check it in the dashboard? Pleaseee 🙏"'],
      ],
    },
    redFlags: [
      {
        id: 'twin',
        label: 'Duplicate network with "_FAST"',
        explain: 'Two networks with nearly the same name, and the "better" one has a stronger signal? That’s a classic evil twin.',
      },
      {
        id: 'open',
        label: 'Open networks',
        explain: 'Airport WiFi is shared with thousands of strangers, and open networks don’t encrypt what you send.',
      },
      {
        id: 'portal',
        label: 'Unofficial portal address',
        explain: 'Plain http:// on a random domain. Real airport portals don’t live on "airport-wifi-secure.net".',
      },
      {
        id: 'cert',
        label: 'Asks you to install a certificate or profile',
        explain:
          'This is the big one. Installing a certificate or profile lets whoever runs the network decrypt your HTTPS traffic: passwords, cookies, everything. No legit WiFi asks for this.',
      },
      {
        id: 'authority',
        label: 'Fake authority',
        explain: '"Required by regulations" is there to make you stop asking questions.',
      },
      {
        id: 'nodata',
        label: 'Pressure: no other option?',
        explain: 'No data and a deadline is exactly when people take risks. There’s always another option, even if it’s slower.',
      },
    ],
    choices: [
      {
        id: 'cert',
        text: 'Install the certificate. It says it’s for security, and the parent is waiting!',
        score: -2,
        delta: { security: -25, business: -10, career: -10 },
        flags: ['mitm'],
        result:
          "With that certificate installed, every \"secure\" page Fajar opened was decrypted and read by whoever ran the network: Google, Slack, Bitwarden and the CS Dashboard. The padlock icon stayed on the whole time.",
        ripple: "Fajar's laptop now trusts the attacker completely, even after leaving the airport.",
      },
      {
        id: 'proceed',
        text: 'Skip the certificate, join Airport_Free_WiFi, and click "Proceed anyway" on the "Your connection is not private" warning',
        score: -1,
        delta: { security: -10, career: -3 },
        result:
          'That browser warning was the only thing standing between Fajar and a fake CS Dashboard login page. "Proceed anyway" meant logging in on the attacker\'s copy.',
        ripple: 'Browser security warnings exist for moments exactly like this.',
      },
      {
        id: 'wait',
        text: 'Tell Dimas I can’t safely help until I land, and ask him to loop in the team lead',
        score: 1,
        delta: { security: 5, business: -2 },
        result:
          'Safe! The parent waits a bit longer, but the team lead picks it up within 15 minutes. Not heroic, but nobody got hacked.',
        ripple: 'A slightly slower answer is better than a leaked dashboard.',
      },
      {
        id: 'topup',
        text: 'Buy a data package at the phone counter, hotspot from my phone, and tell Dimas I’m on it in 10 minutes',
        score: 2,
        delta: { security: 10, business: 5, career: 6 },
        result:
          "Rp 50.000 of data later, Fajar is on a private connection, checks order #4471 and resolves the complaint before boarding. The parent even leaves a 5-star review.",
        ripple: 'Safe and fast. Worth every rupiah.',
      },
    ],
    lesson:
      "Never install a certificate or \"profile\" to use WiFi, and never click past a browser security warning on public networks. When there's no safe connection, use your own data or hand the task to someone who can do it safely.",
  },

  // ───────────────────────────── Week 3 ─────────────────────────────
  {
    id: 'meta-dm',
    when: 'Week 3 · Monday · 16:45',
    category: 'phishing',
    title: 'Instagram says we are in trouble',
    intro: "Fajar helps out with Colearn's Instagram inbox. A new message request arrives.",
    media: {
      kind: 'chat',
      app: 'instagram',
      title: [{ t: 'meta.business.support.team01', flag: 'handle' }],
      subtitle: ['Message request'],
      messages: [
        {
          who: 'Meta Business Support',
          avatar: 'M',
          text: [
            '⚠️ ',
            { t: 'FINAL WARNING', flag: 'urgency' },
            ': Your page "colearn.id" has been reported for copyright violation and ',
            { t: 'will be permanently disabled in 24 hours.', flag: 'urgency' },
          ],
        },
        {
          who: 'Meta Business Support',
          avatar: 'M',
          text: [
            'If you believe this is a mistake, submit an appeal: ',
            { t: 'meta-business-appeal-center.com/colearn', href: 'https://meta-business-appeal-center.com/colearn', flag: 'link' },
          ],
        },
        {
          who: 'Meta Business Support',
          avatar: 'M',
          text: ['You will be asked to ', { t: 'log in and confirm your 2FA code', flag: 'creds' }, ' to verify page ownership.'],
        },
      ],
    },
    redFlags: [
      {
        id: 'handle',
        label: 'Random handle in message requests',
        explain: "Meta doesn't send official notices through Instagram DMs. They appear in Meta Business Suite → Account Status.",
      },
      { id: 'urgency', label: '"FINAL WARNING" + 24h countdown', explain: 'Fear of losing the page is meant to make you click without checking.' },
      {
        id: 'link',
        label: 'Not a Meta domain',
        explain: 'Meta uses facebook.com, meta.com and instagram.com. "meta-business-appeal-center.com" is none of them.',
      },
      { id: 'creds', label: 'Asks for login + 2FA code', explain: 'That combination is everything needed to hijack the account.' },
    ],
    choices: [
      {
        id: 'check',
        text: 'Check Account Status directly in the official Meta Business Suite, then report and block the sender',
        score: 2,
        delta: { security: 10, business: 6, career: 6 },
        result:
          'Account Status: all green, no violations. Fajar reports the account and posts a heads-up in #social-team. The same scam hits three other edtechs that week, but Colearn\'s page stays safe.',
        ripple: "Colearn's 600K followers never notice a thing, which is exactly the point.",
      },
      {
        id: 'appeal',
        text: "Click the appeal link and log in. We can't lose the page!",
        score: -2,
        delta: { security: -20, business: -20, career: -10 },
        flags: ['brand_hijack'],
        result:
          'The attackers take over Colearn\'s Instagram, change the recovery email and post a fake "90% discount, transfer here" promo. Parents lose money; the brand loses trust.',
        ripple: 'It takes 11 days and a lot of apologies to get the account back.',
      },
      {
        id: 'forward',
        text: 'Forward the link to the #social-team group: "is this real??"',
        score: -1,
        delta: { security: -2 },
        result:
          'Good instinct to ask! But now the live link is in front of 12 more people, and one of them almost clicks it. Better to report it and share a screenshot, not a clickable link.',
        ripple: 'Close call. The team agrees to share screenshots from now on.',
      },
      {
        id: 'delete',
        text: 'Ignore it and delete the message request',
        score: 1,
        delta: { security: 4 },
        result:
          "Fajar didn't bite. But the account isn't reported, and the rest of the social team gets the same DM the next day without any warning.",
        ripple: 'Fajar is safe; the scammer keeps trying the rest of the team.',
      },
    ],
    lesson:
      "Platforms like Meta, Google and Slack never ask you to 'verify' through DM links. Go to the official app or website yourself. Share suspicious stuff as a screenshot, not a live link.",
  },

  {
    id: 'scareware',
    when: 'Week 3 · Tuesday · 11:05',
    category: 'device',
    title: 'Your computer is infected!',
    intro:
      'Fajar searches for "free Colearn logo png" for a parent FAQ slide and clicks the third result. Suddenly the screen goes full-screen red and the laptop starts beeping loudly.',
    media: {
      kind: 'popup',
      url: [{ t: 'http://secure-alert-support7.xyz/warning?id=88213', flag: 'url' }],
      title: [{ t: '⚠️ SECURITY ALERT: Your computer is infected with 5 viruses!', flag: 'scare' }],
      lines: [
        [{ t: 'Your Google, Bitwarden and banking passwords are being stolen RIGHT NOW.', flag: 'fear' }],
        [{ t: 'DO NOT close this window or restart your computer, or all your files will be deleted.', flag: 'dontclose' }],
        ['Call Certified Support immediately: ', { t: '+1 (XXX) XXX-XXXX (toll free)', flag: 'phone' }],
        [
          'Our technician will guide you to ',
          { t: 'install a secure remote tool (AnyDesk) to remove the virus.', flag: 'remote' },
        ],
      ],
      buttons: ['Scan now', 'Call support'],
    },
    redFlags: [
      {
        id: 'url',
        label: 'Random website, not your antivirus',
        explain:
          'Real security alerts come from your operating system or IT’s security tools, not from a web page on "secure-alert-support7.xyz".',
      },
      { id: 'scare', label: 'Scary claims inside a browser', explain: 'A website cannot scan your computer. It just shows scary text.' },
      { id: 'fear', label: 'Panic trigger', explain: '"Being stolen RIGHT NOW" is designed to make you act before thinking.' },
      {
        id: 'dontclose',
        label: '"Don’t close this window"',
        explain: 'Closing it is exactly what you should do. The threat of deleted files is fake.',
      },
      {
        id: 'phone',
        label: 'A phone number to call',
        explain: 'Microsoft, Apple and Google never put phone numbers in pop-up warnings. This is a tech-support scam.',
      },
      {
        id: 'remote',
        label: 'Install a remote-access tool',
        explain:
          'AnyDesk, TeamViewer and similar tools give a stranger full control of your laptop. Only install software that Colearn IT asks for through official channels.',
      },
    ],
    choices: [
      {
        id: 'call',
        text: 'Call the number and install AnyDesk as the technician explains',
        score: -2,
        delta: { security: -25, business: -12, career: -12 },
        flags: ['remote_access'],
        result:
          '"Kevin from Certified Support" is very friendly. While he "removes the viruses", he opens Bitwarden, copies the CS Dashboard session and quietly installs a second tool that stays after the call. Then he asks for a Rp 3.000.000 "cleaning fee".',
        ripple: "A stranger can now control Fajar's laptop whenever it's switched on.",
      },
      {
        id: 'scan',
        text: 'Click "Scan now" to see how bad it is',
        score: -1,
        delta: { security: -10, career: -2 },
        result:
          'The "scan" is an animation, and at the end it downloads "CleanerPro_Setup.exe". Luckily Fajar didn\'t open it. Clicking anything inside a scam page does exactly what the scammer wants.',
        ripple: 'A suspicious file is sitting in the Downloads folder.',
      },
      {
        id: 'restart',
        text: 'Hold the power button to restart and forget about it',
        score: 1,
        delta: { security: 3 },
        result:
          "The pop-up is gone and nothing bad happened. But IT never hears about the malicious site, and two colleagues land on the same page that week.",
        ripple: 'Fajar is safe. The site keeps catching others.',
      },
      {
        id: 'close',
        text: 'Don’t call, don’t click. Force-quit the browser, then send IT a photo of the screen.',
        score: 2,
        delta: { security: 10, business: 3, career: 6 },
        result:
          'Force-quit (Cmd+Option+Esc / Ctrl+Shift+Esc) and it’s gone. IT confirms it\'s a tech-support scam, blocks the domain on company devices and runs a quick check on Fajar\'s laptop: all clean.',
        ripple: 'The scam site is blocked for everyone at Colearn.',
      },
    ],
    lesson:
      'Pop-ups that scream "virus!" and show a phone number are scams. Don’t call, don’t click inside them: force-quit the browser. Never install remote-access tools like AnyDesk or TeamViewer unless Colearn IT asks you to through an official channel.',
  },

  {
    id: 'tailgate',
    when: 'Week 3 · Wednesday · 15:30',
    category: 'social',
    title: 'The friendly technician',
    intro: 'Fajar is heading back from lunch. At the office door, a man in a polo shirt with a lanyard waves.',
    media: {
      kind: 'irl',
      location: 'Colearn office entrance',
      art: '🚪 🧑‍🔧 📦',
      lines: [
        {
          who: 'Technician',
          text: [
            "Mas, permisi! I'm from the internet provider. ",
            { t: 'Pak Marc asked me', flag: 'name' },
            ' to check your network rack. ',
            { t: "It's urgent, the internet will go down this afternoon!", flag: 'urgency' },
          ],
        },
        {
          who: 'Technician',
          text: [
            { t: "My access card isn't working", flag: 'card' },
            ', can you tap me in? ',
            { t: 'And can I borrow your laptop for 5 minutes to run a speed test?', flag: 'laptop' },
          ],
        },
        { who: 'narrator', text: ['He carries a box of cables. ', { t: 'The badge on his lanyard is flipped face-down.', flag: 'badge' }] },
      ],
    },
    redFlags: [
      { id: 'name', label: 'Name-dropping', explain: "Using a leader's name (Marc) is meant to make you comply without checking." },
      { id: 'urgency', label: 'Urgency', explain: '"The internet will go down" rushes you past normal visitor checks.' },
      { id: 'card', label: 'No working access', explain: 'Real vendors are registered in advance and escorted by GA/IT.' },
      {
        id: 'laptop',
        label: 'Asks to use your laptop',
        explain: 'A few minutes with your laptop is enough to install malware or copy your logged-in sessions.',
      },
      { id: 'badge', label: 'Hidden ID', explain: "A badge you can't read is not a badge." },
    ],
    choices: [
      {
        id: 'help',
        text: 'Tap him in and lend him my laptop. Pak Marc asked!',
        score: -2,
        delta: { security: -25, business: -15, career: -12 },
        flags: ['physical_breach'],
        result:
          "Five minutes with Fajar's unlocked laptop was enough to plug in a tiny USB device and copy browser sessions. The \"technician\" also left a small box behind the network rack. IT finds it… three weeks later.",
        ripple: "For three weeks, someone was quietly listening on Colearn's network.",
      },
      {
        id: 'verify',
        text: "Politely ask him to wait at reception while I check with GA/IT (and Marc) through official channels",
        score: 2,
        delta: { security: 10, business: 5, career: 8 },
        result:
          'GA has no vendor visit scheduled. Marc: "Didn\'t ask anyone." When Fajar returns to reception, the "technician" has vanished. Building security pulls his photo from CCTV.',
        ripple: 'The building adds a visitor check at the lift lobby. Fajar gets a shout-out.',
      },
      {
        id: 'door',
        text: "Hold the door for him (it's rude not to), but keep my laptop",
        score: -1,
        delta: { security: -10, business: -3, career: -3 },
        result:
          "He's in. He wanders around, photographs the whiteboard with the Q1 plans, and leaves before anyone asks questions.",
        ripple: 'A photo of the Q1 whiteboard is now on a stranger’s phone.',
      },
      {
        id: 'refuse',
        text: 'Say "Sorry, I can’t let you in", go inside and don’t tell anyone',
        score: 1,
        delta: { security: 4, career: 1 },
        result:
          'Fajar keeps the door shut, well done! But nobody else is warned, and ten minutes later the "technician" walks in right behind a courier.',
        ripple: 'Fajar kept him out, but someone else let him in.',
      },
    ],
    lesson:
      'Politeness is the #1 tool of in-person social engineering. Don’t let people tailgate, verify visitors with GA/IT, never lend your laptop, and lock your screen (Win+L / Ctrl+Cmd+Q) whenever you step away.',
  },

  {
    id: 'usb-drop',
    when: 'Week 3 · Thursday · 08:50',
    category: 'device',
    title: 'Finders keepers?',
    intro: 'Fajar and Dimas are waiting for the lift. Something shiny is lying on the floor next to the door.',
    media: {
      kind: 'irl',
      location: 'Office building, lift lobby',
      art: '🛗 🔌 👀',
      lines: [
        { who: 'narrator', text: ['It’s a USB drive. The label says: ', { t: '"Foto & Video Outing Bali 2026 🏝️ PRIVATE"', flag: 'bait' }] },
        { who: 'narrator', text: [{ t: 'Someone even stuck a Colearn logo sticker on it.', flag: 'logo' }] },
        {
          who: 'Dimas',
          text: [{ t: "Ooh, plug it in! Let's see who got sunburnt 😂", flag: 'peer' }, ' We can find the owner that way too.'],
        },
      ],
    },
    redFlags: [
      {
        id: 'bait',
        label: 'Curiosity bait',
        explain: '"PRIVATE" photos from a company trip: almost impossible not to look. That’s exactly why attackers write labels like this.',
      },
      {
        id: 'logo',
        label: 'A logo proves nothing',
        explain: 'Anyone can print a Colearn sticker. It’s there to make you trust the drive.',
      },
      {
        id: 'peer',
        label: 'Peer pressure and a "good reason"',
        explain: '"Let’s find the owner" sounds helpful. It’s also the most common excuse for plugging in a stranger’s USB.',
      },
    ],
    choices: [
      {
        id: 'plug',
        text: 'Plug it into my laptop. We need to find the owner!',
        score: -2,
        delta: { security: -25, business: -10, career: -10 },
        flags: ['usb_malware'],
        result:
          'A black window flashes for half a second, then: an empty folder. It wasn\'t a storage drive at all. It was a keystroke-injection device that "typed" commands faster than any human, and installed a backdoor in three seconds.',
        ripple: "Fajar's laptop now quietly phones home to an attacker's server.",
      },
      {
        id: 'printer',
        text: 'Plug it into the shared meeting-room PC instead, not my own laptop',
        score: -1,
        delta: { security: -12, business: -4, career: -4 },
        result:
          "Fajar's laptop is fine, but the meeting-room PC is on the same office network and logged in to the shared Google account. The attacker now has a foothold inside Colearn.",
        ripple: 'Every meeting in that room now has an uninvited listener.',
      },
      {
        id: 'bin',
        text: 'Throw it in the bin',
        score: 1,
        delta: { security: 3 },
        result:
          "Safe for Fajar. But IT never learns about it, and at 10:00 someone from Finance finds the second drive on the stairs.",
        ripple: 'There were more drives. Someone else found one.',
      },
      {
        id: 'it',
        text: 'Don’t plug it in anywhere. Hand it to IT and tell them where I found it.',
        score: 2,
        delta: { security: 10, business: 4, career: 7 },
        result:
          'Raka analyzes it on an isolated machine: a keystroke-injection device. Building CCTV shows the same "technician" from yesterday dropping five of them around the lobby. IT collects them all and sends a company-wide warning before 10:00.',
        ripple: 'All five drives end up in an evidence bag instead of a Colearn laptop.',
      },
    ],
    lesson:
      'Never plug in USB drives, cables or devices you found or were given by strangers, not even to "find the owner". Hand them to IT. The same goes for free chargers and USB gadgets from unknown sources.',
  },

  {
    id: 'cafe',
    when: 'Week 3 · Friday · 20:15',
    category: 'info',
    title: 'Martabak with an old friend',
    intro:
      "Friday night at a café in Senayan. Fajar meets Bayu, a college friend who now works at a competing edtech, \"BelajarPlus\".",
    media: {
      kind: 'irl',
      location: 'A busy café in Senayan',
      art: '☕ 🥞 🗣️',
      lines: [
        {
          who: 'Bayu',
          text: ["So how's Colearn? ", { t: 'I heard you guys had a big outage last week. Parents complaining?', flag: 'probe' }],
        },
        {
          who: 'Bayu',
          text: [
            { t: "Rumor says you're launching something big in Q1. New pricing? AI tutor?", flag: 'strategy' },
            ' Come on, between friends 😄',
          ],
        },
        { who: 'narrator', text: [{ t: 'The next table has gone suspiciously quiet.', flag: 'overheard' }] },
        {
          who: 'Bayu',
          text: ['Also, is it true tutors are leaving? ', { t: 'How many students do you have now, roughly?', flag: 'numbers' }],
        },
      ],
    },
    redFlags: [
      {
        id: 'probe',
        label: 'Fishing for internal issues',
        explain: 'Competitors (and journalists) love hearing about incidents; it helps them target unhappy customers.',
      },
      {
        id: 'strategy',
        label: 'Asking about unreleased plans',
        explain: "Unreleased products and pricing are some of Colearn's most valuable secrets.",
      },
      { id: 'overheard', label: 'Public place', explain: 'Cafés, ojol rides and co-working spaces have ears.' },
      {
        id: 'numbers',
        label: 'Asking for internal metrics',
        explain: 'User counts, churn and revenue are confidential, even if they seem harmless to share.',
      },
    ],
    choices: [
      {
        id: 'spill',
        text: "Tell him everything: the outage, the Q1 launch, the pricing. He's a friend!",
        score: -2,
        delta: { security: -10, business: -25, career: -25 },
        flags: ['strategy_leak'],
        result:
          'Six weeks later, BelajarPlus launches an almost identical product, two weeks before Colearn and at a lower price. Their sales team calls parents mentioning "the recent outage". The leak is traced back to one very specific conversation over martabak.',
        ripple: "Colearn's big Q1 launch lands second. Nobody remembers who came second.",
      },
      {
        id: 'deflect',
        text: 'Smile: "Can\'t talk about work stuff, bro. More martabak?"',
        score: 2,
        delta: { security: 5, business: 8, career: 8 },
        result:
          'Bayu laughs: "Fair, fair. Same rules at my place." The rest of the night is about football and old campus stories. Colearn\'s Q1 launch lands as a surprise.',
        ripple: "Colearn's Q1 launch catches the whole market off guard.",
      },
      {
        id: 'vent',
        text: 'Just vent a bit about the outage and the chaos. No numbers, no plans.',
        score: -1,
        delta: { security: -3, business: -8, career: -6 },
        flags: ['vent'],
        result:
          'It felt harmless. But "Colearn is in chaos" becomes a talking point in BelajarPlus sales calls, and a tweet from the next table goes semi-viral.',
        ripple: '"Heard Colearn is a mess inside" starts showing up in parent WhatsApp groups.',
      },
      {
        id: 'wink',
        text: 'Say "I can’t tell you… but you’re not wrong 😉" when he guesses',
        score: -1,
        delta: { security: -3, business: -10, career: -6 },
        flags: ['vent'],
        result:
          'Fajar never actually said anything. But a wink is a confirmation, and Bayu now knows the AI tutor rumor is true. BelajarPlus moves its own launch forward.',
        ripple: 'A wink told the competitor everything they needed.',
      },
    ],
    lesson:
      "Internal issues, plans, pricing and numbers stay inside Colearn, even with friends, family, or on social media. When in doubt, deflect with a smile. And watch what you say in public places.",
  },

  // ───────────────────────────── Week 4 ─────────────────────────────
  {
    id: 'rotation',
    when: 'Week 4 · Monday · 09:00',
    category: 'password',
    title: 'Password expiry reminder',
    intro: 'A notification from IT pops up on Fajar’s screen.',
    media: {
      kind: 'task',
      app: 'Colearn IT',
      icon: '⏰',
      title: 'Your Google Workspace password expires in 3 days',
      body: [
        [
          'Per Colearn IT policy, passwords must be rotated regularly (every 90 days), and immediately if you suspect any compromise.',
        ],
        ['💬 Raka (IT): "Pro tip: let your password manager generate it 😉"'],
      ],
    },
    choices: [
      {
        id: 'generate',
        text: 'Generate a new unique passphrase in Bitwarden, update it, keep 2FA on',
        score: 2,
        delta: { security: 10, business: 2, career: 4 },
        result:
          'A new, unique, long passphrase, saved in Bitwarden in 30 seconds. Any old leaked passwords are now useless.',
        ripple: 'Any credentials leaked in past breaches just expired.',
      },
      {
        id: 'increment',
        text: "Change 'Fajar2026!' to 'Fajar2026!!'. Technically new.",
        score: -1,
        delta: { security: -8 },
        flags: ['weak_pw'],
        result: 'Attackers know this trick. Password-cracking tools try "+1", "!!" and the next month or year first.',
        ripple: 'The "new" password is cracked in seconds from the old one.',
      },
      {
        id: 'postpone',
        text: 'Snooze it until it forces me',
        score: -1,
        delta: { security: -5, career: -2 },
        result:
          'It forces Fajar at 08:59, right before a parent escalation meeting. Locked out and panicking, Fajar picks "Colearn123".',
        ripple: '"Colearn123" is in the top 1,000 guessed passwords for Colearn staff.',
      },
      {
        id: 'own',
        text: 'Make up a brand-new long passphrase myself and save it in Bitwarden',
        score: 1,
        delta: { security: 6, career: 2 },
        result:
          "Unique, long and stored safely: solid! A generated one would be even stronger, because humans tend to pick patterns (song lyrics, names, dates) that cracking tools know about.",
        ripple: 'A strong new password, just not quite as random as it could be.',
      },
    ],
    lesson:
      'Rotate passwords regularly, and immediately after any suspicion. The new one should be genuinely new (not a variation) and unique. Let the password manager do the hard work.',
  },

  // ─────────────── Conditional: only if Fajar's laptop or connection got hijacked ───────────────
  {
    id: 'laptop-weird',
    when: 'Week 4 · Tuesday · 21:30',
    category: 'incident',
    title: 'The laptop has a mind of its own',
    intro: 'Tuesday night. Fajar is at home, watching a drama on the work laptop.',
    condition: (f) => ['remote_access', 'usb_malware', 'mitm'].some((x) => f.has(x)),
    media: {
      kind: 'irl',
      location: "Fajar's kos",
      art: '💻 👻 🖱️',
      lines: [
        { who: 'narrator', text: ["A window Fajar didn't open flickers on the screen, then disappears. The fan is roaring."] },
        {
          who: '💬 Slack · Raka (IT)',
          text: [
            "Fajar, sorry for the late ping. Our security tools flagged your laptop: an unknown remote session started at 21:28, and your accounts are logging in from a device in another country. Did you install anything, plug anything in or accept any certificate recently? Is this you?",
          ],
        },
      ],
    },
    choices: [
      {
        id: 'report',
        text: 'Turn off WiFi right now (don’t shut down), reply to Raka honestly, and follow IT’s instructions',
        score: 2,
        delta: { security: 15, business: 8, career: 10 },
        flags: ['reported_incident'],
        result:
          'Cut off from the internet, the attacker loses control instantly. IT collects the evidence, revokes every session, rotates Fajar\'s passwords from a clean device and reimages the laptop. Raka: "You did exactly the right thing. Honesty made this a 2-hour fix instead of a 2-month one."',
        ripple: 'The attacker is locked out, and IT uses the evidence to protect everyone else.',
      },
      {
        id: 'reset',
        text: 'Shut it down and factory-reset it myself tomorrow. Problem solved.',
        score: -1,
        delta: { security: -10, business: -5, career: -6 },
        result:
          "The reset wiped the evidence, so IT can't tell what was taken. And it didn't help: the attacker had already copied Fajar's passwords and sessions, and keeps using them for another week.",
        ripple: 'Wiping the laptop did nothing about the stolen passwords.',
      },
      {
        id: 'ignore',
        text: 'Reply "not me, probably a glitch" and keep watching',
        score: -2,
        delta: { security: -20, business: -15, career: -25 },
        flags: ['ignored_hijack'],
        result:
          "While Fajar finishes the episode, the attacker uses the laptop's access to export student records and plant ransomware on the shared drive. On Wednesday morning, half of Colearn's files are encrypted with a ransom note. The logs show Raka asked, and Fajar said \"not me\".",
        ripple: 'An ignored alert became a company-wide ransomware incident.',
      },
      {
        id: 'shutdown',
        text: 'Shut the laptop down immediately and call Raka',
        score: 1,
        delta: { security: 8, business: 4, career: 5 },
        flags: ['reported_incident'],
        result:
          "The attacker is cut off and IT is on it within minutes. Great instinct! One catch: shutting down wiped evidence that only lived in memory, so IT can't tell exactly what was taken. Disconnecting from the internet would have kept it.",
        ripple: 'Attacker stopped fast; the investigation has a few blind spots.',
      },
    ],
    lesson:
      'If your device acts strangely or IT flags it: disconnect from the internet (but don’t wipe or shut it down), report to IT immediately and be honest about what happened. Speed and honesty are what keep a small incident small.',
  },

  {
    id: 'drive-salary',
    when: 'Week 4 · Thursday · 17:30',
    category: 'phishing',
    title: 'The confidential salary file',
    intro: "End of Fajar's first month. One last email before going home, and it's a juicy one.",
    media: {
      kind: 'email',
      fromName: 'Google Drive',
      fromAddress: [{ t: 'drive-shares-noreply@g00gle-docs.net', flag: 'domain' }],
      to: 'fajar@colearn.id',
      subject: ['Rismaulina Aruan shared "', { t: 'Salary Adjustment 2026 – CONFIDENTIAL.xlsx', flag: 'bait' }, '" with you'],
      time: '17:30',
      body: [
        ['Rismaulina Aruan (rismaulina.aruan@colearn.id) has invited you to view the following spreadsheet:'],
        ['📊 ', { t: 'Salary Adjustment 2026 – CONFIDENTIAL.xlsx', flag: 'bait' }],
        [{ t: 'Open in Sheets', href: 'https://g00gle-docs.net/sheets/auth?user=fajar@colearn.id', flag: 'link' }],
        [
          { t: 'This link expires in 2 hours.', flag: 'expiry' },
          ' ',
          { t: 'You may be asked to sign in again for security reasons.', flag: 'relogin' },
        ],
        ['Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043'],
      ],
    },
    redFlags: [
      {
        id: 'domain',
        label: '"g00gle" with zeros',
        explain: 'Real Drive notifications come from a google.com address. "g00gle-docs.net" swaps the o\'s for zeros.',
      },
      {
        id: 'bait',
        label: 'Curiosity bait',
        explain:
          "Salaries, layoffs, bonuses: attackers pick topics you can't resist. Why would HR share everyone's salaries with a CS new joiner?",
      },
      { id: 'link', label: 'Link goes to g00gle-docs.net', explain: 'A real Sheets link starts with https://docs.google.com.' },
      { id: 'expiry', label: 'Expiry pressure', explain: 'A 2-hour countdown to stop you from checking first.' },
      {
        id: 'relogin',
        label: '"Sign in again"',
        explain: "You're already signed in to Google. A genuine Drive link doesn't need your password again.",
      },
    ],
    choices: [
      {
        id: 'open',
        text: 'Open it and sign in. I NEED to see this.',
        score: -2,
        delta: { security: -25, business: -10, career: -10 },
        flags: ['creds_stolen_late'],
        result:
          'There is no spreadsheet. There is only a fake Google login, and now Fajar\'s account (plus every Colearn doc Fajar can see) belongs to someone else.',
        ripple: 'Customer exports in Fajar\'s Drive end up for sale on a forum.',
      },
      {
        id: 'forward',
        text: 'Forward it to the CS group: "Guys, look what I got 👀"',
        score: -1,
        delta: { security: -10, business: -3, career: -6 },
        result: "Now 15 curious colleagues have the phishing link. Two of them click it. IT's Friday plans are cancelled.",
        ripple: 'Two colleagues’ accounts get compromised because of one forward.',
      },
      {
        id: 'delete',
        text: 'Delete it without clicking anything',
        score: 1,
        delta: { security: 4 },
        result:
          "Fajar is safe. But it was sent to 60 colleagues, and without reports IT only finds out when the first account gets compromised.",
        ripple: 'Fajar dodged it; the campaign ran for hours longer than it needed to.',
      },
      {
        id: 'report',
        text: 'Hover the link: it\'s g00gle-docs.net. Report phishing in Gmail and ping IT.',
        score: 2,
        delta: { security: 10, business: 4, career: 8 },
        result:
          'IT confirms it\'s a campaign using Rismaulina\'s real name (scraped from LinkedIn), sent to 60 Colearn employees. Thanks to 5 quick reports it\'s blocked within 15 minutes. Ima posts: "For the record, salary files are never shared like this 😂".',
        ripple: 'The campaign dies in 15 minutes with zero victims.',
      },
    ],
    lesson:
      'Attackers use real names (even official ones from LinkedIn) and irresistible topics. Check the real sender address and the real link. When something feels too juicy, that is a red flag in itself.',
  },
]

export const SCENE_BY_ID: Record<string, Scene> = Object.fromEntries(SCENES.map((s) => [s.id, s]))

export const CATEGORY_LABEL: Record<string, string> = {
  phishing: '📧 Phishing vs. legit emails',
  social: '🎭 Social engineering',
  password: '🔑 Passwords',
  info: '🤐 Company information',
  wifi: '📶 Public WiFi',
  device: '💻 Laptop security',
  incident: '🚨 Incident response',
}
