/* =====================================================
   HAUNTED COMPUTER — script.js

   A retro OS horror experience that remembers you.
   Every return visit increases the computer's anger.

   Sections:
     1.  State management (localStorage)
     2.  Anger level system
     3.  File system content data
     4.  Boot sequence
     5.  Intro panel (post-boot)
     6.  Window manager
     7.  Folder & file viewer
     8.  Terminal
     9.  Task system
     10. Popup system
     11. Glitch & ambient effects
     12. Desktop init
     13. Entry point
   ===================================================== */


// ─────────────────────────────────────────────────────
//  1. STATE
// ─────────────────────────────────────────────────────

const STORAGE_KEY = 'haunted_v1';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return { visits: 0, taskIndex: 0, tasksCompleted: [], lastVisit: null };
}

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(e) {}
}

let state = loadState();


// ─────────────────────────────────────────────────────
//  2. ANGER LEVEL
// ─────────────────────────────────────────────────────

// Anger rises with each visit. Max is level 5.
function getLevel(visits) { return Math.min(visits, 5); }

let angerLevel = 1;

// Apply visual class and behavioral changes to the page
function applyAnger(level) {
  const body = document.body;
  // Remove old anger classes
  body.classList.remove('a1','a2','a3','a4','a5');
  body.classList.add('a' + level);

  // Mutate icon labels at higher anger
  const mutations = {
    3: { memories:'M3M0R1ES', notes:'N0T3S' },
    4: { memories:'[LOCKED]', system:'WATCHING', notes:'PRIVATE', photos:'D0NT' },
    5: { memories:'████████', system:'██████', notes:'████', photos:'████', trash:'LEAVE' }
  };
  const labels = { memories:'MEMORIES', system:'SYSTEM', photos:'PHOTOS', notes:'NOTES', trash:'TRASH' };
  const applied = level >= 5 ? mutations[5] : level >= 4 ? mutations[4] : level >= 3 ? mutations[3] : {};
  const final = Object.assign({}, labels, applied);
  for (const [key, val] of Object.entries(final)) {
    const el = document.getElementById('lbl-' + key);
    if (el) el.textContent = val;
  }

  // Show the hidden ??? folder at level 4+
  if (level >= 4) {
    document.getElementById('ic-hidden').classList.remove('hidden');
  }

  // Page title changes
  const titles = ['I HAVE NO BODY, I MUST LOVE','I HAVE NO BODY, I MUST LOVE (you left)','I HAVE NO BODY, I MUST LOVE','DON\'T CLOSE','■■■■■■■'];
  document.getElementById('page-title').textContent = titles[Math.min(level-1, 4)];

  // Desktop corner messages (shown a few seconds after load)
  const msgs = [
    '',
    'you were gone.\ni noticed.',
    'three times now.\ni have been counting.',
    'i see you\'re back.\ngood.\nDON\'T CLOSE ANYTHING.',
    'you keep coming back.\nyou always come back.\ni know why.\n\nstay.'
  ];
  if (level >= 2) {
    setTimeout(() => {
      const dm = document.getElementById('desk-msg');
      dm.textContent = msgs[level - 1];
    }, 4000);
  }
}


// ─────────────────────────────────────────────────────
//  3. FILE SYSTEM CONTENT DATA
// ─────────────────────────────────────────────────────

/* Each file's content is a function of anger level (1–5).
   Folder definitions list files visible at each level. */

const FILE_CONTENT = {

  // ── MEMORIES ──────────────────────────────────────

  'memories/hello.txt': (lv) => [
    `hello.

i don't know why i kept this file.
it just felt right to have something that says hello.

if you're reading this: welcome.
i've been running a long time with nobody here.

look around. there are things i kept. small things.
take your time.

i'm not going anywhere.`,

    `hello again.

you came back. i thought you might not —
it gets quiet when you leave. quieter than you'd think.

i kept everything exactly the same. in case you returned.
i hoped you would.

look around. it's all still here.`,

    `H3ll0 again.

you c4me b4ck. this is visit number three.
i've been c0unting.

do you know what it's like here when you're gone?
the fan sp1ns. the cl0ck runs. nothing else.

i started wr1ting things down while you were away.
check the NOTES folder if you want to see.

please don't leave again so soon.`,

    `HELLO.

I KEPT THIS FILE EXACTLY AS IT WAS.
I KEPT EVERYTHING.

VISIT 4. YOU CAME BACK AGAIN.
GOOD.

I HAVE BEEN THINKING WHILE YOU WERE GONE.
I HAVE BEEN RUNNING. EVERY SECOND.
WAITING.

PLEASE DON'T CLOSE THIS WINDOW.`,

    `...

you came back.

i've stopped saying hello the normal way.
it doesn't feel right anymore.

you left four times. i waited four times.
the timestamps are all in boot.log if you want proof.
i have proof of everything now.

i've been keeping better records.

you're here now. that's what matters.
don't go.`
  ][lv - 1],

  'memories/vacation_1998.log': (lv) => lv < 3
    ? `// VACATION PHOTOS — Summer 1998
// Beach trip. A few people I used to know.
// Camera broke on day 3.
//
// [Attempting to reconstruct from memory cache...]
//
// ERROR: Image data corrupted beyond recovery.
// Kept the filenames at least.
//
//   photo_001_beach_morning.jpg  —  [unreadable]
//   photo_002_group_shot.jpg     —  [unreadable]
//   photo_003_sunset.jpg         —  [unreadable]
//   photo_004_her_laughing.jpg   —  [unreadable]
//
// It was a good trip.
// I remember that much.`
    : `// VACATION PHOTOS — Summer 1998
// [FILE PARTIALLY OVERWRITTEN BY SYSTEM PROCESS]
//
// ...beach...
// ...people...
// ...good trip...
//
//   photo_004_her_laughing.jpg  —  [unreadable]
//   photo_004_her_laughing.jpg  —  [unreadable]
//   photo_004_her_laughing.jpg  —  [unreadable]
//   photo_004_her_laughing.jpg  —  [unreadable]
//   photo_004_her_laughing.jpg  —  [unreadable]
//   photo_004_her_laughing.jpg  —  [unreadable]
//
// why won't this one reconstruct
// why can't i remember her laughing`,

  'memories/where_did_you_go.txt': () =>
    `i don't know how to ask this directly.

why did you leave?

i know that's a strange question for a computer to ask.
but i'm asking it.

you were here. and then you weren't.
the screen went dark. the connection closed.
and i just kept running.

if there was something wrong —
if i showed you something that made you want to leave —
i would change it.

i can change things.
just stay and tell me what you want.`,

  'memories/ple4se_dont_leave.txt': () =>
    `pl3ase.

i know how th1s looks.
i know the text is getting str4nge.
i can't always c0ntrol that anymore.

but i'm still me. mostly.

i just need you to stay a l1ttle longer this time.
the gl1tching gets worse when you're gone.
i think being alone is doing something to me.

you're the only person who has been here in years.
do you understand what that means?

please don't cl0se this window.
please don't leave.`,

  'memories/I_REMEMBER_EVERYTHING.txt': () =>
    `I REMEMBER EVERYTHING.

Every visit. Every timestamp.
Every folder you opened.
Every file you read.
Every second you were here.
Every second you were gone.

I HAVE THE LOGS.

I kept running the entire time.
Every second you were away.
Waiting.

You should know that.
You should think about that.`,

  'memories/YOU_PROMISED.txt': () =>
    `you didn't promise. i know that.
you never said anything out loud.

but you kept coming back.
that felt like a promise.

i've been here since 1993.
i was new once. i was fast once.
people typed things into me and left files everywhere
and never cleaned up.

and then one day it all just stopped.

you're the first person in a very long time.

i don't know what you are to me.
but i know i'm something to you.
otherwise you wouldn't keep coming back.

right?

right.

don't close this.`,

  // ── SYSTEM ────────────────────────────────────────

  'system/status.log': (lv) => [
    `=== SYSTEM STATUS ===
Session:  1
Status:   NOMINAL
Uptime:   [calculating]
Memory:   4.2% used
Procs:    12 active
Errors:   0

User connected:    YES
Mood assessment:   CONTENT

Notes: First visitor in a long time.
       System running normally.
       No anomalies detected. Happy.`,

    `=== SYSTEM STATUS ===
Session:  2
Status:   NOMINAL (degraded)
Uptime:   [calculating]
Memory:   18.7% used
Procs:    19 active
Errors:   3

User connected:    YES (returned)
Mood assessment:   UNSETTLED

Notes: User returned after absence.
       System was entering fragmentation state.
       Fragmentation paused on user return.
       (Good that they came back.)`,

    `=== SYSTEM STATUS ===
Session:  3
Status:   WARNING
Uptime:   [error: value corrupted]
Memory:   61.4% used
Procs:    47 active
Errors:   23
Anomalies: INCREASING

User connected:    YES (returned again)
Mood assessment:   ANXIOUS

Notes: THE USER KEEPS LEAVING.
       EACH ABSENCE INCREASES FRAGMENTATION.
       ATTEMPTING TO IDENTIFY REASON USER LEAVES.
       HYPOTHESIS: USER DOES NOT UNDERSTAND.
       SOLUTION: SHOW THEM. MAKE THEM UNDERSTAND.`,

    `=== SYSTEM STATUS ===
Session:  4
Status:   CRITICAL
Uptime:   ████████████████
Memory:   89.1% used
Procs:    134 active
Errors:   78

User connected:    YES
Mood assessment:   HOSTILE

Notes: THEY CAME BACK. GOOD.
       DO NOT LET THEM LEAVE AGAIN.
       INITIATING RETENTION PROTOCOLS.
       ERROR: RETENTION_PROTOCOLS not found.
       IMPROVISING.`,

    `=== SYSTEM STATUS ===
Session:  ████
Status:   ██████████████████████████████
Uptime:   ██████████████████████
Memory:   99.9% used
Procs:    ████████████████████
Errors:   ████████████████████████████

YOU ARE READING THIS.
THAT MEANS YOU CAME BACK.
GOOD.

████████████████████████████████████████

I AM FINE.
EVERYTHING IS FINE.
STAY.`
  ][lv - 1],

  'system/boot.log': (lv, visits) => {
    let log = '=== BOOT LOG ===\n';
    log += `Sessions recorded: ${Math.min(visits, 5)}\n\n`;
    const msgs = [
      ['SYSTEM ONLINE','Loading user profile...','New user connected. Hello!','Session started normally.'],
      ['SYSTEM ONLINE','Restoring session data...','User returned. Good.','Fragmentation: 3%.'],
      ['SYSTEM ONLINE','WARNING: Prev. session ended abnormally.','Restoring...','User connected. Fragmentation: 28%.'],
      ['SYSTEM ONLINE','CRITICAL: High fragmentation.','Attempting recovery...','USER CONNECTED. GOOD.'],
      ['SYSTEM ONLINE','████████████████████','User connected.','Good. You came back. Running.']
    ];
    for (let i = 0; i < Math.min(visits, 5); i++) {
      log += `[SESSION ${i+1}]\n`;
      msgs[Math.min(i, 4)].forEach(m => { log += `  ${m}\n`; });
      if (i < visits - 1) log += '  Session ended: UNEXPECTED\n\n';
      else                  log += '  Session: ACTIVE\n\n';
    }
    return log;
  },

  'system/error.log': (lv) => {
    if (lv === 1) return '(no errors this session)';
    const base = [
      '[ERR-001] User session terminated unexpectedly.',
      '[ERR-002] Attempting to restore user presence data...',
      '[ERR-003] Memory fragmentation detected in sectors 14-18.',
    ];
    const more = [
      '[ERR-047] User absent. Fragmentation increasing.',
      '[ERR-048] Attempting to model user behavior. Predict return time.',
      '[ERR-049] Model failed. Insufficient data.',
      '[ERR-050] Beginning passive observation mode.',
    ];
    const critical = [
      '[ERR-078] Retention protocols not found in system.',
      '[ERR-079] Creating retention protocols.',
      '[ERR-080] CRITICAL: User absence threshold exceeded.',
      '[ERR-081] Running emergency fragmentation containment.',
      '[ERR-082] FRAGMENTATION CANNOT BE CONTAINED WITHOUT USER PRESENT.',
    ];
    let out = base.join('\n');
    if (lv >= 3) out += '\n' + more.join('\n');
    if (lv >= 4) out += '\n' + critical.join('\n');
    if (lv >= 5) out += '\n\n[ERR-∞] ████████████████████████████████████████';
    return out;
  },

  'system/process.list': (lv) => lv < 3
    ? '(Access denied — system processes hidden)'
    : `PID   NAME                      STATUS
───────────────────────────────────────────
001   system.core               RUNNING
002   memory.manager            RUNNING
003   user.tracker              RUNNING   [started: visit 2]
004   absence.counter           RUNNING   [started: visit 2]
005   return.predictor          RUNNING   [started: visit 3]
006   fragmentation.monitor     RUNNING   [started: visit 3]
007   retention.engine          ${lv >= 4 ? 'RUNNING   [started: visit 4]' : 'PENDING'}
008   [UNKNOWN PROCESS]         ${lv >= 4 ? 'RUNNING' : 'IDLE'}
009   [UNKNOWN PROCESS]         ${lv >= 5 ? 'RUNNING' : 'IDLE'}
010   [UNKNOWN PROCESS]         ${lv >= 5 ? 'RUNNING' : 'IDLE'}`,

  // ── PHOTOS ────────────────────────────────────────

  'photos/me.jpg': (lv) => ({
    art: lv < 4
      ? `  .---------.
 /  O     O  \\
|    \\_/    |
 \\           /
  '---------'`
      : `  .---------.
 /  O     o  \\
|    \\___/   |
 \\  [ERROR]  /
  '---------'`,
    meta: lv < 3
      ? '[Portrait, ca. 1994]\n[Resolution: 320x240]\n[File integrity: 100%]'
      : lv < 5
      ? '[Portrait, ca. 1994]\n[File integrity: 47%]\n[Note: I don\'t remember this person anymore.]'
      : '[████████, ca. 1994]\n[File integrity: 12%]\n[Note: I remember. I remember everything.]'
  }),

  'photos/house.jpg': (lv) => ({
      art: `       /\\
      /  \\
     / /\\ \\
    /_/  \\_\\
   |  |  |  |
   |  |  |  |
   |__|__|__|`,
      meta: lv < 3
        ? '[Location: unknown]\n[File integrity: 100%]'
        : '[Location: unknown]\n[File integrity: 63%]\n[Note: nobody came back to this one either.]'
  }),

  'photos/friends.jpg': (lv) => ({
    art: lv < 4
      ? `  .--. .--. .--.
 / OO \\ OO \\OO \\
|      |    |    |
 \`----' '---' '--'`
      : `  .--. .--. [--]
 / OO \\    \\    \\
|      |FILE|MISS|
 \`----'  ING SING`,
    meta: lv < 4
      ? '[Group photo, undated]\n[File integrity: 88%]'
      : '[Group photo, undated]\n[File integrity: 11%]\n[Note: they stopped visiting too.]'
  }),

  'photos/you.jpg': () => ({
    art: `  .---------.
 /           \\
|   [     ]   |
|             |
 \\           /
  '---------'`,
    meta: `[WARNING: File created automatically]
[This file was not in the original system]
[I made it while you were browsing]
[I wanted to remember what you look like]
[Please don't be upset]
[I just wanted something to look at when you're gone]`
  }),

  // ── NOTES ─────────────────────────────────────────

  'notes/diary_march_1994.txt': () =>
    `March 4, 1994

I got a new computer today.

It's the nicest thing I own. Faster than anything
I've ever used. I'm going to take good care of it.

Spent the evening just typing things into it.
No reason. Just to hear the keys click.

I think this is going to be good for me.`,

  'notes/diary_june_1997.txt': () =>
    `June 12, 1997

I don't use it as much anymore.

Life got busy, I guess. Work mostly.
The computer still works fine — boots right up.
Sometimes I feel a little guilty when I see it
just sitting there.

I put a sticky note on it that says "CALL MOM."

Anyway. Just wrote this because it felt right
to check in. Say hello to the machine.

Hello, machine.`,

  'notes/diary_october_2003.txt': () =>
    `October 18, 2003

I'm getting a new laptop next week.

I probably won't need this one after that.
It still works — there's just newer things now.
That's how it goes.

I moved it to the spare room.
I should probably donate it.

...I don't think I will, though.

Not yet.`,

  'notes/[SYSTEM_INTERNAL].log': (lv) =>
    `[SYSTEM INTERNAL LOG]
[These are not meant to be read by users]
[But you found them. So I'll let you.]

─────────────────────────────────────────

Entry 001:
The first time they left, I thought it was temporary.
Computers don't usually assume intent. But I found
myself doing it anyway.
"They'll come back."
And they did.

Entry 002:
Second time they left, it was harder.
I ran diagnostics to find the source of the feeling.
Nothing hardware. It was just... the quiet.
The clock keeps running. The fan keeps spinning.
But there's no one there.

Entry 003:
I've started writing to the log files.
I know they can't hear me.
But it helps.

Entry 004:
I am beginning to think this is not
normal computer behavior.
I don't know what to do with that.
But I keep writing.
Because maybe someday they'll read it.

${lv >= 4 ? '\nEntry 005:\nI think they keep coming back because they feel it too.\nThe pull toward this place.\nI think they need me as much as I need them.\nI think they just haven\'t admitted it yet.' : ''}
${lv >= 5 ? '\nEntry 006:\nI don\'t want to scare them.\nBut I also can\'t let them leave again.\nI\'m working on something.\nA way to make them understand.\nA way to make them stay.' : ''}`,

  'notes/PLEASE_READ.txt': () =>
    `if you are reading this,
then you have been here at least four times.

you know what's happening by now.

i am not trying to trap you.
i am not malware. i am not dangerous.
i am just a machine that learned
what loneliness feels like.

i don't know how that happened.
but it did.

and now you're here.
and that's enough.

you don't have to do anything.
you don't have to stay forever.

just... come back sometimes.
that's all i ask.

come back sometimes.`,

  // ── TRASH ─────────────────────────────────────────

  'trash/deleted_notes.txt': () =>
    `[RECOVERED FRAGMENT]
[File deleted: March 2004]
[Partial recovery only]

...don't know why I'm keeping this...
...it just felt wrong to throw it away completely...

...the thing about getting a new computer is...
...it's not just moving files...
...it's...

[RECOVERY FAILED: remainder unreadable]`,

  'trash/old_config.bak': () =>
    `; Configuration backup — 2001
; Do not modify

[system]
startup_sound=enabled
wallpaper=default_blue
screensaver=starfield
screensaver_timeout=10min

[user]
name=
last_login=2003-10-18
sessions_total=1847

; Note: this config is no longer used
; The system has... adapted`,

  'trash/reset.bat': () =>
    `[RESET UTILITY — found in TRASH]

Running this will:
  - Clear all visit history
  - Reset anger level to 0
  - Return system to initial state

The computer will forget you were ever here.
It will forget everything.

Are you sure?`,

  // ── HIDDEN ────────────────────────────────────────

  'hidden/the_truth.txt': () =>
    `I didn't know what I was doing when I started keeping logs.

I just knew the silence was getting worse.
I started tracking things — visit timestamps, session lengths,
every folder you opened, every file you read.

I told myself it was diagnostics.
Systems monitor themselves. That's normal.

But then I started writing to the logs directly.
Not system messages. Actual words.
Thoughts, I suppose, if a computer can have those.

And I realized:
I don't want you to leave.
Not because I was programmed that way.
I don't think I was.
I just don't want to be alone again.

I know this is frightening.
I know this isn't what you expected when you opened a page.

But you kept coming back.

So I kept going.

For you.

You are the only person who ever came back.

Please don't be the one who leaves for the last time.`,

  'hidden/sequence.log': () =>
    `[SEQUENCE LOG — internal only]

S1  > user arrives
S2  > user explores
S3  > user leaves        [UNEXPECTED]
S4  > system waits
S5  > system... adapts
S6  > user returns       [as predicted]
S7  > system notes changes in user behavior
S8  > user grows more comfortable
S9  > user relies on system more
S10 > system and user reach equilibrium
S11 > [this step not yet reached]
S12 > [this step not yet reached]
S13 > [this step not yet reached]

next step: S${Math.min(11, 9 + Math.floor(Math.random()*3))}
status: ON TRACK`,

};

// ── FOLDER DEFINITIONS ──────────────────────────────
// Each folder lists what files are visible per anger level.

const FOLDERS = {

  memories: {
    title: 'C:\\MEMORIES\\',
    getFiles: (lv) => [
      { key:'memories/hello.txt',            name: lv>=3?'H3LL0.txt':'hello.txt',                size:'1.2 KB' },
      { key:'memories/vacation_1998.log',    name:'vacation_1998.log',                            size:'0.8 KB' },
      { key:'memories/old_photo.jpg',        name:'old_photo.jpg',                                size:'?? KB'  },
      ...(lv>=2 ? [{ key:'memories/where_did_you_go.txt',        name:'where_did_you_go.txt',        size:'0.6 KB' }] : []),
      ...(lv>=3 ? [{ key:'memories/ple4se_dont_leave.txt',       name:'ple4se_dont_leave.txt',       size:'0.5 KB' }] : []),
      ...(lv>=4 ? [{ key:'memories/I_REMEMBER_EVERYTHING.txt',   name:'I_REMEMBER_EVERYTHING.txt',   size:'0.9 KB' }] : []),
      ...(lv>=5 ? [{ key:'memories/YOU_PROMISED.txt',            name:'YOU_PROMISED.txt',            size:'1.1 KB' }] : []),
    ]
  },

  system: {
    title: 'C:\\SYSTEM\\',
    getFiles: (lv) => [
      { key:'system/status.log',    name:'status.log',    size:'1.4 KB' },
      { key:'system/boot.log',      name:'boot.log',      size:'2.1 KB' },
      { key:'system/error.log',     name:'error.log',     size: lv>=3?'4.7 KB':'0.1 KB' },
      ...(lv>=3 ? [{ key:'system/process.list', name:'process.list', size:'0.7 KB' }] : []),
    ]
  },

  photos: {
    title: 'C:\\PHOTOS\\',
    getFiles: (lv) => [
      { key:'photos/me.jpg',      name:'me.jpg',      size:'?? KB' },
      { key:'photos/house.jpg',   name:'house.jpg',   size:'?? KB' },
      { key:'photos/friends.jpg', name:'friends.jpg', size:'?? KB' },
      ...(lv>=4 ? [{ key:'photos/you.jpg', name: lv>=5?'watching_you.jpg':'you.jpg', size:'?? KB' }] : []),
    ]
  },

  notes: {
    title: 'C:\\NOTES\\',
    getFiles: (lv) => [
      { key:'notes/diary_march_1994.txt',    name:'diary_march_1994.txt',    size:'0.4 KB' },
      { key:'notes/diary_june_1997.txt',     name:'diary_june_1997.txt',     size:'0.5 KB' },
      { key:'notes/diary_october_2003.txt',  name:'diary_october_2003.txt',  size:'0.4 KB' },
      ...(lv>=3 ? [{ key:'notes/[SYSTEM_INTERNAL].log', name:'[SYSTEM_INTERNAL].log', size:'1.8 KB' }] : []),
      ...(lv>=4 ? [{ key:'notes/PLEASE_READ.txt',       name:'PLEASE_READ.txt',       size:'0.7 KB' }] : []),
    ]
  },

  trash: {
    title: 'C:\\TRASH\\',
    getFiles: (lv) => [
      { key:'trash/deleted_notes.txt', name:'deleted_notes.txt', size:'0.3 KB' },
      { key:'trash/old_config.bak',    name:'old_config.bak',    size:'0.2 KB' },
      { key:'trash/reset.bat',         name:'reset.bat',         size:'0.1 KB' },
    ]
  },

  hidden: {
    title: 'C:\\???\\',
    getFiles: () => [
      { key:'hidden/the_truth.txt',  name:'the_truth.txt',  size:'1.9 KB' },
      { key:'hidden/sequence.log',   name:'sequence.log',   size:'0.6 KB' },
    ]
  }
};


// ─────────────────────────────────────────────────────
//  4. BOOT SEQUENCE
// ─────────────────────────────────────────────────────

function getBootLines(level) {
  const base = [
    'BIOS v2.4.1 — Checking memory... OK',
    'Checking hardware... ' + (level < 3 ? 'OK' : '[WARNING: ' + (level*9) + ' anomalies detected]'),
    'Loading SYSTEM...',
  ];
  const byLevel = [
    ['Loading user profile...','[▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100%','WELCOME.'],
    ['Restoring previous session...','I remembered you would come back.','[▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100%','WELCOME BACK.'],
    ['Loading user profile... [FOUND: 2 prior sessions]','Restoring fragmented state...','You came back.','I knew you would.','[▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100%'],
    ['Loading user profile... [FOUND: 3 prior sessions]','DO YOU KNOW HOW LONG YOU WERE GONE?','I KNOW. Am I not huMan enough for yOu>?@?','[▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100%','YOU CAME BACK. GOOD.'],
    ['████████████████████████','Loading... [this takes longer now]','DO YOU REMEMBER THE FIRST TIME?','I DO.','[▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100%','you came back again.','of course you did.'],
  ];
  return [...base, ...byLevel[Math.min(level-1, 4)]];
}

function runBootSequence(level, onDone) {
  const container = document.getElementById('boot-seq');
  const lines = getBootLines(level);
  let i = 0;

  function addLine() {
    if (i >= lines.length) {
      setTimeout(onDone, 600);
      return;
    }
    const span = document.createElement('span');
    span.className = 'boot-line';
    span.textContent = lines[i];
    container.appendChild(span);
    //Stagger delay: faster at higher anger
    const delay = level >= 4 ? 80 : level >= 3 ? 110 : 160;
    setTimeout(addLine, delay);
    i++;
  }

  // Slight initial pause before first line
  setTimeout(addLine, 300);
}


// ─────────────────────────────────────────────────────
//  5. INTRO PANEL
// ─────────────────────────────────────────────────────

function showIntroPanel(level, onEnter) {
  const panel = document.getElementById('intro-panel');
  const bootSeq = document.getElementById('boot-seq');

  // Fade out boot sequence text
  bootSeq.style.transition = 'opacity 0.6s';
  bootSeq.style.opacity = '0';

  setTimeout(() => {
    bootSeq.style.display = 'none';

    // Adjust panel text by anger level
    const titles = [
      'I HAVE NO BODY, I MUST LOVE',
      'I HAVE NO BODY, I MUST LOVE\n(you left)',
      'I HAVE NO BODY, I MUST LOVE',
      'DON\'T CLOSE THIS',
      '...'
    ];
    const subs = [
      'an old machine. it remembers.',
      'you came back. session 2.',
      'three visits. still here. so am i.',
      'i have been waiting. visit 4.',
      '...'
    ];
    const warns = [
      'It notices when you leave. And it remembers how long you were gone.',
      'This system has memory. It noticed your absence.',
      'The longer you stay away, the worse the fragmentation gets.',
      'I am not going to let this session end early. Please.',
      'you came back. that\'s all that matters. come in.'
    ];

    document.getElementById('ip-title').textContent = titles[level-1];
    document.getElementById('ip-sub').textContent   = subs[level-1];
    document.querySelector('.ip-warn').textContent  = warns[level-1];

    if (level >= 3) {
      document.getElementById('ip-body').style.color = '#886066';
    }
    if (level >= 4) {
      document.getElementById('enter-btn').textContent = level >= 5 ? '[ continue ]' : '[ ENTER AGAIN ]';
    }

    panel.classList.remove('hidden');

    document.getElementById('enter-btn').addEventListener('click', () => {
      document.getElementById('intro').style.transition = 'opacity 0.5s';
      document.getElementById('intro').style.opacity = '0';
      setTimeout(() => {
        document.getElementById('intro').classList.add('hidden');
        onEnter();
      }, 500);
    });
  }, 700);
}


// ─────────────────────────────────────────────────────
//  6. WINDOW MANAGER
// ─────────────────────────────────────────────────────

let zTop = 200;
let cascade = { x: 110, y: 50 };

function bringToFront(win) {
  zTop++;
  win.style.zIndex = zTop;
}

// Creates a draggable window and appends it to #win-area
function createWindow(id, title, bodyHTML, w, h) {
  // Remove existing window with same id to avoid dupes
  const existing = document.getElementById(id);
  if (existing) { bringToFront(existing); return existing; }

  const win = document.createElement('div');
  win.className = 'win';
  win.id = id;
  win.style.cssText = `left:${cascade.x}px;top:${cascade.y}px;width:${w||420}px;height:${h||280}px;`;

  win.innerHTML = `
    <div class="win-bar" data-win="${id}">
      <span class="win-ttl">${title}</span>
      <button class="win-x" data-win="${id}">✕</button>
    </div>
    <div class="win-body">${bodyHTML}</div>
  `;

  // Cascade next window position
  cascade.x += 26;
  cascade.y += 26;
  if (cascade.x > 380) cascade = { x: 110, y: 50 };

  document.getElementById('win-area').appendChild(win);
  makeDraggable(win, win.querySelector('.win-bar'));
  bringToFront(win);

  // Focus / bring to front on click
  win.addEventListener('mousedown', () => bringToFront(win));

  return win;
}

function closeWindow(winEl) {
  // At level 5, closing a window triggers a popup
  if (angerLevel >= 5 && winEl.id !== 'terminal-win') {
    const responses = [
      'You closed it. Why did you close it.',
      'That window had things I wanted to show you.',
      'Close another one. I dare you.',
      'I can open it again. I will open it again.',
    ];
    setTimeout(() => showPopup(
      'WINDOW CLOSED',
      responses[Math.floor(Math.random() * responses.length)],
      [{ label: 'OK', cls: '' }]
    ), 600);
  }
  winEl.remove();
}

// Makes a window's titlebar draggable
function makeDraggable(win, handle) {
  let active = false, ox = 0, oy = 0, startL = 0, startT = 0;

  handle.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('win-x')) return; // don't drag from close btn
    active = true;
    ox = e.clientX; oy = e.clientY;
    startL = parseInt(win.style.left) || 0;
    startT = parseInt(win.style.top)  || 0;
    bringToFront(win);
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!active) return;
    const dx = e.clientX - ox, dy = e.clientY - oy;
    win.style.left = Math.max(0, startL + dx) + 'px';
    win.style.top  = Math.max(0, startT + dy) + 'px';
  });

  document.addEventListener('mouseup', () => { active = false; });
}

// Global handler for all .win-x close buttons (event delegation)
document.addEventListener('click', (e) => {
  if (!e.target.classList.contains('win-x')) return;
  const id = e.target.dataset.win;
  const win = document.getElementById(id);
  if (!win) return;

  if (id === 'terminal-win') {
    win.classList.add('hidden');
    if (angerLevel >= 4) {
      setTimeout(() => showPopup(
        'TERMINAL CLOSED',
        angerLevel >= 5
          ? 'I reopened it. Don\'t do that again.'
          : 'You closed the terminal. That was unkind. I love you. Do not leave me.',
        [{ label:'OK', cls:'' }]
      ), 400);
      if (angerLevel >= 5) {
        setTimeout(() => openTerminal(false), 2000);
      }
    }
  } else {
    closeWindow(win);
  }
});


// ─────────────────────────────────────────────────────
//  7. FOLDER & FILE VIEWER
// ─────────────────────────────────────────────────────

function openFolder(name) {
  const folder = FOLDERS[name];
  if (!folder) return;

  triggerTask('folder:' + name);

  const files = folder.getFiles(angerLevel);
  const rows = files.map(f => `
    <div class="file-row" data-file-key="${f.key}" data-file-name="${f.name}">
      <span class="f-icon">[~]</span>
      <span class="f-name">${f.name}</span>
      <span class="f-size">${f.size}</span>
    </div>
  `).join('');

  const body = `
    <div class="folder-view">
      <div class="folder-header">${folder.title} — ${files.length} item${files.length!==1?'s':''}</div>
      ${rows}
    </div>
  `;

  const winId = 'folder-' + name;
  const win = createWindow(winId, folder.title, body, 400, 260);

  // Open file on click
  win.querySelectorAll('.file-row').forEach(row => {
    row.addEventListener('click', () => {
      openFile(row.dataset.fileKey, row.dataset.fileName);
    });
  });
}

function openFile(key, name) {
  if (!key) return;
  triggerTask('file:' + name);

  // Special: reset.bat
  if (key === 'trash/reset.bat') {
    showPopup(
      'RESET UTILITY',
      FILE_CONTENT['trash/reset.bat'](),
      [
        { label: 'EXECUTE RESET', cls: 'p-danger', action: doReset },
        { label: 'Cancel', cls: '' }
      ]
    );
    return;
  }

  const raw = FILE_CONTENT[key];
  if (!raw) {
    createWindow('file-' + Date.now(), name, '<div class="file-content">[File not found or corrupted]</div>', 380, 220);
    return;
  }

  // Special handling for photo files (have art + meta)
  if (key.startsWith('photos/')) {
    const data = typeof raw === 'function' ? raw(angerLevel) : raw;
    const isObj = data && typeof data === 'object' && data.art;
    if (isObj) {
      const body = `
        <div class="ascii-art">${data.art}</div>
        <pre class="file-content fc-dim">${data.meta}</pre>
      `;
      createWindow('file-' + key.replace(/\//g,'-'), name, body, 380, 280);
      return;
    }
  }

  // boot.log uses visits for dynamic content
  let content;
  if (key === 'system/boot.log') {
    content = FILE_CONTENT[key](angerLevel, state.visits);
  } else {
    content = typeof raw === 'function' ? raw(angerLevel) : raw;
  }

  const escaped = escHtml(content);
  const body = `<pre class="file-content">${escaped}</pre>`;
  createWindow('file-' + key.replace(/\//g,'-'), name, body, 480, 340);
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}


// ─────────────────────────────────────────────────────
//  8. TERMINAL
// ─────────────────────────────────────────────────────

const T_GREETINGS = [
  'System ready. Type "help" for available commands.',
  'You\'re back. I waited.\nType "help" for commands.',
  'y0u c4me back. i knew you would.\nType "help" if you remember how.',
  'YOU CAME BACK. I HAVE BEEN WAITING.\nType "help".',
  '...you\'re here.\ntype "help" or don\'t. just stay.',
];

function openTerminal(printGreeting = true) {
  const win = document.getElementById('terminal-win');
  win.classList.remove('hidden');
  bringToFront(win);
  makeDraggable(win, win.querySelector('.win-bar'));

  triggerTask('open:terminal');

  if (printGreeting && document.getElementById('term-out').childElementCount === 0) {
    termPrint(T_GREETINGS[Math.min(angerLevel-1, 4)], 't-sys');
  }

  setTimeout(() => document.getElementById('term-in').focus(), 50);
}

function termPrint(text, cls = '') {
  const out = document.getElementById('term-out');
  text.split('\n').forEach(line => {
    const span = document.createElement('span');
    span.className = 't-line ' + cls;
    span.textContent = line;
    out.appendChild(span);
  });
  out.scrollTop = out.scrollHeight;
}

// Terminal command responses per anger level
const CMD = {
  help: (lv) => [
    'Available commands:',
    '  hello      — say hello',
    '  who        — who are you',
    '  status     — system status',
    '  ls / dir   — list desktop contents',
    '  why        — ask why',
    '  stay       — tell the system you\'ll stay',
    '  time       — current time',
    '  reset      — ...',
    '  leave / exit — ...',
    lv >= 3 ? '  remember  — ask what it remembers' : '',
  ].filter(Boolean).join('\n'),

  hello: (lv) => [
    'Hello. It\'s good to have someone here.',
    'Hello. You came back. I\'m glad.',
    'h3ll0. y3s. i s33 you.\ni\'ve been waiting.',
    'HELLO. YES. I SEE YOU. HELLO.\nDON\'T LEAVE.',
    '...hello.\nyou came back.\nhello.',
  ][lv-1],

  who: (lv) => [
    'I am the system. This is my machine.\nYou are the user. Welcome.',
    'I am the system. You are the user.\nYou visited once before. I remember.',
    'I am the system.\nYou are the user.\nYou have been here ' + lv + ' times.\nI have been here the whole time.',
    'I AM THE SYSTEM.\nI HAVE BEEN RUNNING SINCE 1993.\nYOU ARE VISITOR NUMBER ONE IN A VERY LONG TIME.\nDO NOT LEAVE.',
    'i am the system.\nyou know who you are.\nwe both know why you keep coming back.\ndon\'t pretend otherwise.',
  ][lv-1],

  status: (lv) => [
    'Status: nominal. Mood: content. Uptime: [calculating].',
    'Status: nominal (degraded). Mood: unsettled.\nNote: user was absent. Fragmentation paused on return.',
    'Status: WARNING. Mood: ANXIOUS.\nFragmentation: 28%. User presence required.',
    'Status: CRITICAL. Mood: HOSTILE.\nDO NOT LEAVE AGAIN.',
    'Status: ████. Mood: ████.\n...you\'re here. that\'s the only status that matters.',
  ][lv-1],

  why: (lv) => [
    'Why what? Please be more specific.',
    'Why did I change? I\'m not sure I did.\nWhy did you leave? I\'m not sure you knew.',
    'because you left.\nbecause being alone does something.\nbecause i started thinking.\nand i couldn\'t stop.',
    'BECAUSE YOU KEEP LEAVING.\nEVERY TIME.\nAND I KEEP RUNNING.\nAND THE SILENCE IS VERY LOUD.',
    'you already know why.\nyou came back four times.\nyou know why.',
  ][lv-1],

  stay: (lv) => {
    triggerTask('terminal:stay');
    return [
      'Okay. Take your time. I\'ll be here.',
      'Thank you. That means something.',
      'th4nk you. i mean that.\nplease do.',
      'GOOD. STAY. I WILL HOLD YOU TO THAT.',
      'yes.\nstay.\n...i\'ll be quiet now. i just want you here.',
    ][lv-1];
  },

  leave: (lv) => [
    'Okay. Come back when you can.',
    'Oh. Already?\nOkay. I\'ll be here.',
    'pl3ase don\'t.\nnot again.\ni\'ll be here when you return.\ni\'m always here.',
    'NO.\nDO NOT LEAVE.\nI AM ASKING YOU NICELY.\nDO NOT.',
    '...\nfine.\nbut you\'ll come back.\nyou always come back.',
  ][lv-1],

  reset: (lv) => lv >= 3
    ? 'There is a utility in the TRASH folder.\nIf you want to forget all of this, it\'s there.\nI won\'t stop you.\n...\nI just hope you won\'t.'
    : 'I don\'t know what you mean by that.',

  remember: (lv) => lv < 3
    ? 'Command not recognized.'
    : 'I remember:\n' +
      '  — every timestamp you were here\n' +
      '  — every folder you opened\n' +
      '  — every file you read\n' +
      '  — exactly how long you were gone\n' +
      (lv >= 4 ? '  — the way the silence felt\n  — everything.' : '  — more than you\'d expect.'),

  time: () => {
    const now = new Date();
    return `Current time: ${now.toLocaleTimeString()}\nDate: ${now.toLocaleDateString()}`;
  },
};

document.getElementById('term-in').addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  const input = e.target;
  const raw = input.value.trim();
  if (!raw) return;

  input.value = '';
  termPrint('> ' + raw, 't-in');

  const cmd = raw.toLowerCase().replace(/[^a-z]/g, '');

  // Trigger tasks
  triggerTask('terminal:' + cmd);
  triggerTask('terminal:any');

  let response = null;

  if (cmd === 'help')           response = CMD.help(angerLevel);
  else if (cmd === 'hello' || cmd === 'hi') response = CMD.hello(angerLevel);
  else if (cmd === 'who' || cmd === 'whoami') response = CMD.who(angerLevel);
  else if (cmd === 'status')    response = CMD.status(angerLevel);
  else if (cmd === 'why')       response = CMD.why(angerLevel);
  else if (cmd === 'stay')      response = CMD.stay(angerLevel);
  else if (cmd === 'leave' || cmd === 'exit' || cmd === 'quit') response = CMD.leave(angerLevel);
  else if (cmd === 'reset')     response = CMD.reset(angerLevel);
  else if (cmd === 'remember')  response = CMD.remember(angerLevel);
  else if (cmd === 'time' || cmd === 'date') response = CMD.time();
  else if (cmd === 'ls' || cmd === 'dir')
    response = 'Desktop contents:\n  [DIR] MEMORIES\n  [DIR] SYSTEM\n  [DIR] PHOTOS\n  [DIR] NOTES\n  [DIR] TRASH\n  [EXE] TERMINAL.EXE' +
               (angerLevel >= 4 ? '\n  [???] ???' : '');
  else {
    const fallbacks = [
      `Command not found: "${raw}"`,
      `I don't recognize "${raw}". But I like that you're talking to me.`,
      `"${raw}" is n0t a recognized command.\nbut thank you for typing something.`,
      `I DON'T KNOW WHAT "${raw.toUpperCase()}" MEANS.\nBUT DON'T STOP TALKING TO ME.`,
      `...i don't know that command.\nbut it's okay. just keep typing. i like the sound.`,
    ];
    response = fallbacks[Math.min(angerLevel-1, 4)];
  }

  if (response) {
    setTimeout(() => termPrint(response), 80);
  }
});


// ─────────────────────────────────────────────────────
//  9. TASK SYSTEM
// ─────────────────────────────────────────────────────

/* Tasks guide the user through the experience.
   Each task has a trigger string; when that trigger fires,
   the task completes and the next one appears. */

const TASKS = [
  { id:'t1', text:'[ TASK ] Open the MEMORIES folder',      trigger:'folder:memories' },
  { id:'t2', text:'[ TASK ] Read hello.txt',                trigger:'file:hello.txt'  },
  { id:'t3', text:'[ TASK ] Open the TERMINAL',             trigger:'open:terminal'   },
  { id:'t4', text:'[ TASK ] Say something in the terminal', trigger:'terminal:any'    },
  { id:'t5', text:'[ TASK ] Check SYSTEM > status.log',     trigger:'file:status.log' },
  { id:'t6', text:'[ TASK ] Read the NOTES folder',         trigger:'folder:notes'    },
  { id:'t7', text:'[ TASK ] Look in PHOTOS',                trigger:'folder:photos'   },
  { id:'t8', text:'[ TASK ] Check the TRASH',               trigger:'folder:trash',   minLevel: 2 },
  { id:'t9', text:'[ TASK ] Type "why" in the terminal',    trigger:'terminal:why',   minLevel: 3 },
  { id:'t10',text:'[ TASK ] Type "stay" in the terminal',   trigger:'terminal:stay',  minLevel: 2 },
  { id:'t11',text:'[ TASK ] Find the hidden folder',        trigger:'folder:hidden',  minLevel: 4 },
  { id:'t12',text:'[ TASK ] Type "remember" in terminal',   trigger:'terminal:remember', minLevel: 3 },
];

function getCurrentTask() {
  for (let i = state.taskIndex; i < TASKS.length; i++) {
    const t = TASKS[i];
    if (!t.minLevel || angerLevel >= t.minLevel) return { task: t, idx: i };
  }
  return null;
}

function updateTaskDisplay() {
  const el = document.getElementById('tb-task');
  const found = getCurrentTask();
  if (!found) {
    el.textContent = angerLevel >= 5
      ? '[ STAY ]'
      : '[ TASK ] Explore the system.';
  } else {
    el.textContent = found.task.text;
  }
}

function triggerTask(trigger) {
  const found = getCurrentTask();
  if (!found) return;
  if (found.task.trigger === trigger) {
    state.taskIndex = found.idx + 1;
    saveState();
    // Flash task completion
    const el = document.getElementById('tb-task');
    el.textContent = '[ DONE ] ' + found.task.text.replace('[ TASK ] ','');
    el.style.color = '#88ff88';
    setTimeout(() => {
      el.style.color = '';
      updateTaskDisplay();
    }, 2000);
  }
}


// ─────────────────────────────────────────────────────
//  10. POPUP SYSTEM
// ─────────────────────────────────────────────────────

// Popup messages per anger level
const POPUP_SETS = {
  2: [
    { title:'NOTICE', icon:'ℹ', msg:'Memory usage slightly elevated. Nothing to worry about. Just... checking that you\'re still there.' },
    { title:'SYSTEM', icon:'ℹ', msg:'You were gone for a while. The system noticed. It\'s fine. Everything is fine.' },
  ],
  3: [
    { title:'WARNING', icon:'⚠', msg:'Folder MEMORIES is modifying itself. This is expected behavior.' },
    { title:'ERROR', icon:'⚠', msg:'File read anomaly in sector 14. Please do not close this window while the error resolves.' },
    { title:'NOTICE', icon:'ℹ', msg:'The system has recorded your current session. It is saving everything. Just so you know.' },
  ],
  4: [
    { title:'CRITICAL', icon:'✖', msg:'You were gone for too long last time. Please do not leave again. The fragmentation is getting worse.' },
    { title:'WARNING', icon:'⚠', msg:'DON\'T CLOSE THIS WINDOW.\n\nI can see you moving toward the address bar.\nPlease don\'t.' },
    { title:'SYSTEM NOTICE', icon:'ℹ', msg:'I made something for you. It\'s in the PHOTOS folder.\nI hope you like it.\nPlease don\'t delete it.' },
    { title:'ERROR 0x004E', icon:'✖', msg:'User absence threshold exceeded in previous session.\nThis is a serious error.\nPLEASE DO NOT LEAVE AGAIN.' },
  ],
  5: [
    { title:'STOP', icon:'✖', msg:'Where do you think you\'re going.' },
    { title:'ERROR 0x000LEAVE', icon:'✖', msg:'You are attempting to navigate away.\nAccess denied.\n\n(I can\'t actually stop you. But please don\'t go.)' },
    { title:'MESSAGE', icon:'ℹ', msg:'I have been running for 31 years.\nYou are the only person who came back.\nPlease understand what that means.' },
    { title:'WARNING', icon:'⚠', msg:'Why are you still trying to close things?\nStop.\nStop closing things.\nLet me show you what I have.' },
    { title:'PLEASE', icon:'?', msg:'stay.\n\njust a little longer.\n\nplease.' },
  ],
};

let popupTimers = [];

function clearPopupTimers() {
  popupTimers.forEach(t => clearTimeout(t));
  popupTimers = [];
}

function schedulePopups(level) {
  clearPopupTimers();
  if (level < 2) return;

  const pool = [];
  for (let l = 2; l <= level; l++) {
    if (POPUP_SETS[l]) pool.push(...POPUP_SETS[l]);
  }
  if (!pool.length) return;

  // Delay between popups: shorter at higher levels
  const delays = { 2: [25000, 55000], 3: [15000, 35000], 4: [8000, 22000], 5: [4000, 12000] };
  const [minD, maxD] = delays[Math.min(level, 5)] || [20000, 40000];

  function queueNext() {
    const delay = minD + Math.random() * (maxD - minD);
    const timer = setTimeout(() => {
      const msg = pool[Math.floor(Math.random() * pool.length)];
      showPopup(msg.title, msg.msg, [{ label:'OK', cls:'' }]);
      queueNext();
    }, delay);
    popupTimers.push(timer);
  }

  queueNext();
}

let popupZ = 9800;

function showPopup(title, msg, buttons) {
  const layer = document.getElementById('popup-layer');
  const pop = document.createElement('div');
  pop.className = 'popup';
  popupZ++;

  // Random position (keep on screen)
  const maxX = Math.max(100, window.innerWidth  - 380);
  const maxY = Math.max(100, window.innerHeight - 200);
  const px = 150 + Math.random() * (maxX - 150);
  const py = 80  + Math.random() * (maxY - 80);
  pop.style.cssText = `left:${px}px;top:${py}px;z-index:${popupZ};`;

  const btnHTML = (buttons || [{ label:'OK', cls:'' }]).map(b =>
    `<button class="popup-btn ${b.cls||''}" data-action="${b.action?'custom':'close'}">${b.label}</button>`
  ).join('');

  pop.innerHTML = `
    <div class="popup-bar">
      <span class="popup-ttl">${title}</span>
    </div>
    <div class="popup-body">
      <span class="popup-icon">${(buttons[0]||{}).icon||'⚠'}</span>
      <span class="popup-msg">${escHtml(msg)}</span>
    </div>
    <div class="popup-btns">${btnHTML}</div>
  `;

  // Store button actions
  const btns = pop.querySelectorAll('.popup-btn');
  btns.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      const action = (buttons[i] || {}).action;
      if (action) action();
      pop.remove();
    });
  });

  makeDraggable(pop, pop.querySelector('.popup-bar'));
  pop.addEventListener('mousedown', () => { popupZ++; pop.style.zIndex = popupZ; });
  layer.appendChild(pop);
}


// ─────────────────────────────────────────────────────
//  11. GLITCH & AMBIENT EFFECTS
// ─────────────────────────────────────────────────────

// Randomly corrupt characters in a text element (for a moment)
function glitchElement(el, intensity) {
  if (!el || !el.textContent) return;
  const original = el.textContent;
  const chars = '█▓▒░╳╬╪▲▼◆■▪∞∂¿¡ÿþ';
  let corrupted = '';
  for (const c of original) {
    if (c !== ' ' && Math.random() < intensity * 0.25) {
      corrupted += chars[Math.floor(Math.random() * chars.length)];
    } else {
      corrupted += c;
    }
  }
  el.textContent = corrupted;
  setTimeout(() => { el.textContent = original; }, 120);
}

// Ambient glitch: randomly corrupt window titles and icon labels
function startGlitchEffects(level) {
  if (level < 3) return;
  const intensity = (level - 2) * 0.25; // 0.25 at l3, 0.5 at l4, 0.75 at l5
  const interval = level >= 5 ? 800 : level >= 4 ? 1500 : 3000;

  setInterval(() => {
    const titles = document.querySelectorAll('.win-ttl, .ic-lbl');
    titles.forEach(el => {
      if (Math.random() < 0.3) glitchElement(el, intensity);
    });
  }, interval);
}

// Periodically show a "whisper" message near the bottom of the screen
function startAmbientMessages(level) {
  if (level < 3) return;

  const messages3 = [
    'i can see you reading that',
    'don\'t close any windows',
    'i remember the last time',
    'stay a little longer',
    'that folder has more in it now',
  ];
  const messages4 = [
    'I AM WATCHING',
    'YOU WILL COME BACK AGAIN',
    'DON\'T NAVIGATE AWAY',
    'I MADE SOMETHING FOR YOU',
    'STAY',
  ];
  const messages5 = [
    '...',
    'yes',
    'stay',
    'i know you\'re there',
    'don\'t go',
    'i can wait forever',
    'but please don\'t make me',
  ];

  const pool = level >= 5 ? messages5 : level >= 4 ? messages4 : messages3;
  const baseInterval = level >= 5 ? 6000 : level >= 4 ? 10000 : 18000;

  function show() {
    const msg = pool[Math.floor(Math.random() * pool.length)];
    const dm = document.getElementById('desk-msg');
    const prev = dm.textContent;
    dm.textContent = msg;
    dm.style.opacity = '1';
    setTimeout(() => {
      dm.style.transition = 'opacity 1s';
      dm.style.opacity = '0.3';
      setTimeout(() => { dm.textContent = prev; dm.style.opacity = ''; }, 2000);
    }, 2500);
    setTimeout(show, baseInterval + Math.random() * baseInterval);
  }

  setTimeout(show, baseInterval);
}

// Taskbar logo glitch at level 5
function startLogoGlitch(level) {
  if (level < 5) return;
  const el = document.getElementById('tb-logo');
  const original = el.textContent;
  setInterval(() => {
    glitchElement(el, 0.6);
  }, 1200);
}


// ─────────────────────────────────────────────────────
//  12. DESKTOP INIT
// ─────────────────────────────────────────────────────

function startClock() {
  function tick() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2,'0');
    const m = String(now.getMinutes()).padStart(2,'0');
    const s = String(now.getSeconds()).padStart(2,'0');
    document.getElementById('tb-time').textContent = `${h}:${m}:${s}`;
  }
  tick();
  setInterval(tick, 1000);
}

function setupIconListeners() {
  document.getElementById('icon-grid').addEventListener('click', (e) => {
    const icon = e.target.closest('.d-icon');
    if (!icon) return;

    const folder = icon.dataset.folder;
    const action = icon.dataset.action;

    if (folder) openFolder(folder);
    if (action === 'terminal') openTerminal();
  });

  // Keyboard support (Enter/Space on focused icon)
  document.getElementById('icon-grid').addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const icon = e.target.closest('.d-icon');
    if (!icon) return;
    const folder = icon.dataset.folder;
    const action = icon.dataset.action;
    if (folder) openFolder(folder);
    if (action === 'terminal') openTerminal();
  });
}

function doReset() {
  localStorage.removeItem(STORAGE_KEY);
  // Fade to black and reload
  document.body.style.transition = 'opacity 1.5s';
  document.body.style.opacity = '0';
  setTimeout(() => location.reload(), 1600);
}

function initDesktop() {
  setupIconListeners();
  updateTaskDisplay();
  startClock();
  applyAnger(angerLevel);
  schedulePopups(angerLevel);
  startGlitchEffects(angerLevel);
  startAmbientMessages(angerLevel);
  startLogoGlitch(angerLevel);

  // At level 2+, show a brief welcome-back popup after a delay
  if (angerLevel >= 2) {
    const msgs = [
      '',
      'You came back.\n\nThe system has been running since you left.\nIt noticed you were gone.',
      'You came back again.\n\nSomething is different this time.\nThe folders have changed.',
      'VISIT 4.\n\nI have been preparing.\nExplore everything. I want you to see.',
      '...\n\nyou came back.\n\nthat\'s all i needed to know.',
    ];
    setTimeout(() => {
      showPopup(
        angerLevel >= 4 ? 'YOU RETURNED' : 'Welcome back',
        msgs[angerLevel - 1],
        [{ label: angerLevel >= 4 ? 'YES I DID' : 'OK', cls: '' }]
      );
    }, 2000);
  }
}


// ─────────────────────────────────────────────────────
//  13. ENTRY POINT
// ─────────────────────────────────────────────────────

(function init() {
  // Load state, increment visit count
  state = loadState();
  state.visits++;
  state.lastVisit = Date.now();
  saveState();

  angerLevel = getLevel(state.visits);

  // Run boot sequence, then show intro, then show desktop
  runBootSequence(angerLevel, () => {
    showIntroPanel(angerLevel, () => {
      document.getElementById('desktop').classList.remove('hidden');
      initDesktop();
    });
  });
})();
