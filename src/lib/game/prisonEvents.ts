// ─── Prison Event Library ───────────────────────────────────────────────────
// Daily-ish incidents while imprisoned. Frequency and flavor depend on which
// activity the player just did (Labour/Exercise = rougher, more frequent;
// Study = milder, rarer). Reuses the same GameEvent/pendingEvents pipeline as
// the main world event library, so these render through the same
// GlobalEventOverlay popup — no separate UI plumbing needed.
//
// Gang recruitment is ALWAYS an explicit accept/decline choice — never
// automatic. AmaJita (health/workout crew) and Reformers can also be joined
// directly by the player from the prison screen (a deliberate, low-risk
// choice), so they don't appear as recruitment events here.

import type { GameEvent, GameState, PrisonGang } from '@/types/game';

export type PrisonActivity = 'labour' | 'exercise' | 'study' | 'socialize';

export interface PrisonEventTemplate {
  id: string;
  weight: number;
  cooldownDays: number;
  activityTags: PrisonActivity[];
  condition: (state: GameState) => boolean;
  build: (state: GameState) => { title: string; description: string; choices: GameEvent['choices'] };
}

function randInt(min: number, max: number): number { return min + Math.floor(Math.random() * (max - min + 1)); }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

const GANG_INFO: Record<Exclude<PrisonGang, 'none'>, { name: string; flavor: string }> = {
  '26':       { name: 'the 26s',   flavor: 'the money and hustle number — control the prison economy' },
  '27':       { name: 'the 27s',   flavor: 'the blood number — enforcers, respected and feared' },
  '28':       { name: 'the 28s',   flavor: 'the number that runs the wings — territory and protection' },
  amajita:    { name: 'AmaJita',   flavor: 'the gym crew — respect earned through strength, not violence' },
  reformers:  { name: 'the Reformers', flavor: 'inmates focused on rehabilitation and early release' },
};

// ══════════════════════════════════════════════════════════════════════════
// GANG RECRUITMENT — 26 / 27 / 28 only. Always a real choice.
// ══════════════════════════════════════════════════════════════════════════
const GANG_RECRUITMENT_EVENTS: PrisonEventTemplate[] = [
  {
    id: 'prison_recruit_26', weight: 2, cooldownDays: 12, activityTags: ['labour', 'socialize'],
    condition: (s) => s.prison.gang === 'none',
    build: () => ({
      title: '💰 The 26s Are Watching',
      description: 'A quiet inmate approaches you in the workshop. "You\'re sharp with numbers. The 26s could use someone like you. We look after our own — inside and out."',
      choices: [
        { label: 'Join the 26s', outcome: 'You\'re in. Word travels fast — some doors open, others close.', effect: { statsChange: { reputation: 8, stress: 10 }, joinPrisonGang: '26' } },
        { label: 'Decline respectfully', outcome: 'He nods and walks off. No hard feelings — for now.', effect: { statsChange: { stress: 5 } } },
      ],
    }),
  },
  {
    id: 'prison_recruit_27', weight: 2, cooldownDays: 12, activityTags: ['exercise', 'labour'],
    condition: (s) => s.prison.gang === 'none',
    build: () => ({
      title: '🩸 The 27s Make Contact',
      description: 'In the yard, a scarred inmate sizes you up. "You held your own out there. The 27s protect their own blood. You in, or you on your own?"',
      choices: [
        { label: 'Join the 27s', outcome: 'Blood in, blood out. You have protection now — and obligations.', effect: { statsChange: { reputation: 10, stress: 15 }, joinPrisonGang: '27' } },
        { label: 'Decline', outcome: '"Your loss," he says, walking off.', effect: { statsChange: { stress: 8 } } },
      ],
    }),
  },
  {
    id: 'prison_recruit_28', weight: 2, cooldownDays: 12, activityTags: ['labour', 'exercise'],
    condition: (s) => s.prison.gang === 'none',
    build: () => ({
      title: '⚔️ The 28s Extend an Offer',
      description: 'A senior figure in the wing corners you after lights-out. "The 28s run this section. You could run with us, or you could struggle alone. Your call."',
      choices: [
        { label: 'Join the 28s', outcome: 'You\'re accepted into the fold. The wing looks different to you now.', effect: { statsChange: { reputation: 9, stress: 12 }, joinPrisonGang: '28' } },
        { label: 'Decline', outcome: 'A tense silence, then he leaves. You\'ll need to watch your back.', effect: { statsChange: { stress: 10 } } },
      ],
    }),
  },
];

// ══════════════════════════════════════════════════════════════════════════
// FIGHTS
// ══════════════════════════════════════════════════════════════════════════
const FIGHT_EVENTS: PrisonEventTemplate[] = [
  {
    id: 'prison_fight_yard', weight: 3, cooldownDays: 6, activityTags: ['exercise', 'labour'],
    condition: () => true,
    build: () => ({
      title: '👊 A Fight Breaks Out',
      description: 'An argument over nothing turns physical fast, and you\'re pulled into it before you can back away.',
      choices: [
        { label: 'Fight back', outcome: 'You hold your own. Word gets around that you\'re not easy prey.', effect: { statsChange: { health: -12, reputation: 6, stress: 10 }, injured: Math.random() < 0.25 } },
        { label: 'Try to de-escalate', outcome: 'You talk your way out, mostly unscathed — but some see it as weakness.', effect: { statsChange: { stress: 8, reputation: -3 } } },
      ],
    }),
  },
  {
    id: 'prison_fight_gang_rival', weight: 2, cooldownDays: 10, activityTags: ['labour', 'exercise', 'socialize'],
    condition: (s) => s.prison.gang !== 'none' && s.prison.gang !== 'reformers',
    build: (s) => ({
      title: '⚠️ Rival Number Confronts You',
      description: `Members of a rival number corner you, unhappy about your ties to ${GANG_INFO[s.prison.gang as Exclude<PrisonGang,'none'>]?.name ?? 'your crew'}.`,
      choices: [
        { label: 'Stand your ground', outcome: 'It gets ugly before guards break it up.', effect: { statsChange: { health: -18, reputation: 8, stress: 15 }, injured: Math.random() < 0.4 } },
        { label: 'Walk away', outcome: 'You swallow your pride and leave. It won\'t be forgotten.', effect: { statsChange: { stress: 12, reputation: -5 } } },
      ],
    }),
  },
];

// ══════════════════════════════════════════════════════════════════════════
// STABBING — serious, rarer, real injury risk
// ══════════════════════════════════════════════════════════════════════════
const STABBING_EVENTS: PrisonEventTemplate[] = [
  {
    id: 'prison_stabbing', weight: 1, cooldownDays: 25, activityTags: ['labour', 'exercise'],
    condition: (s) => s.prison.gang !== 'none' && s.prison.gang !== 'reformers' && s.prison.gang !== 'amajita',
    build: () => ({
      title: '🔪 Ambushed',
      description: 'Someone gets close in a blind spot and you feel a sharp, sudden pain before guards swarm in. It happened too fast to see who.',
      choices: [
        { label: 'Get to the infirmary', outcome: 'You\'re patched up, shaken. This world just got more real.', effect: { statsChange: { health: -30, stress: 25 }, injured: true } },
      ],
    }),
  },
];

// ══════════════════════════════════════════════════════════════════════════
// WARDER BEATINGS
// ══════════════════════════════════════════════════════════════════════════
const WARDER_EVENTS: PrisonEventTemplate[] = [
  {
    id: 'prison_warder_beating', weight: 2, cooldownDays: 15, activityTags: ['labour', 'exercise'],
    condition: () => true,
    build: () => ({
      title: '👮 A Warder Loses Patience',
      description: 'A warder decides you were too slow, too loud, or just unlucky today, and makes an example of you.',
      choices: [
        { label: 'Take it and stay quiet', outcome: 'It\'s over quickly. Better than a longer punishment.', effect: { statsChange: { health: -10, stress: 15, happiness: -8 } } },
        { label: 'Report it later', outcome: 'Filing a complaint is slow and risky, but it\'s on record.', effect: { statsChange: { health: -10, stress: 20 } } },
      ],
    }),
  },
];

// ══════════════════════════════════════════════════════════════════════════
// BULLYING — study-linked, milder
// ══════════════════════════════════════════════════════════════════════════
const BULLYING_EVENTS: PrisonEventTemplate[] = [
  {
    id: 'prison_bully_books', weight: 3, cooldownDays: 10, activityTags: ['study'],
    condition: () => true,
    build: () => ({
      title: '📕 Books Go Missing',
      description: 'Someone\'s been taking your study materials and mocking you for "wasting time on school."',
      choices: [
        { label: 'Confront them', outcome: 'Tense, but they back off — for now.', effect: { statsChange: { stress: 12, reputation: 3 } } },
        { label: 'Ignore it, keep studying', outcome: 'You let it go and refocus on your books.', effect: { statsChange: { stress: 6 } } },
      ],
    }),
  },
  {
    id: 'prison_study_fight', weight: 1, cooldownDays: 15, activityTags: ['study'],
    condition: () => true,
    build: () => ({
      title: '📚 A Shove in the Library',
      description: 'Someone knocks your books to the floor "by accident" and squares up when you react.',
      choices: [
        { label: 'Push back', outcome: 'A brief scuffle before it\'s broken up.', effect: { statsChange: { health: -10, stress: 12 }, injured: Math.random() < 0.15 } },
        { label: 'Pick up your books and leave', outcome: 'Not worth it. You study elsewhere today.', effect: { statsChange: { stress: 8, happiness: -3 } } },
      ],
    }),
  },
];

// ══════════════════════════════════════════════════════════════════════════
// GOOD BEHAVIOR — study-linked, positive
// ══════════════════════════════════════════════════════════════════════════
const GOOD_BEHAVIOR_EVENTS: PrisonEventTemplate[] = [
  {
    id: 'prison_good_behavior_praise', weight: 3, cooldownDays: 10, activityTags: ['study'],
    condition: () => true,
    build: () => ({
      title: '🌟 Noticed for the Right Reasons',
      description: 'A programme coordinator notices your consistent study habits and makes a note in your file.',
      choices: [
        { label: 'Keep it up', outcome: 'Small steps toward a better record.', effect: { statsChange: { happiness: 8, discipline: 5, stress: -8 } } },
      ],
    }),
  },
  {
    id: 'prison_reformers_meeting', weight: 2, cooldownDays: 15, activityTags: ['study'],
    condition: (s) => s.prison.gang !== 'reformers',
    build: () => ({
      title: '🕊️ A Reformers\' Meeting',
      description: 'The Reformers group invites you to sit in on one of their sessions — no pressure, no obligation.',
      choices: [
        { label: 'Sit in and listen', outcome: 'Some of it actually makes sense. Worth thinking about.', effect: { statsChange: { happiness: 6, stress: -10, discipline: 4 } } },
        { label: 'Not interested', outcome: 'You keep to yourself instead.', effect: {} },
      ],
    }),
  },
];

export const PRISON_EVENT_LIBRARY: PrisonEventTemplate[] = [
  ...GANG_RECRUITMENT_EVENTS, ...FIGHT_EVENTS, ...STABBING_EVENTS,
  ...WARDER_EVENTS, ...BULLYING_EVENTS, ...GOOD_BEHAVIOR_EVENTS,
];

/**
 * Rolls a prison incident based on which activity the player just did.
 * Labour/Exercise are the roughest and most frequent; Study is milder and
 * rarer; Socialize sits in between (and is how gang contacts are made).
 * Returns null if nothing fires (most of the time, for Study especially).
 */
export function rollPrisonEvent(state: GameState, activity: PrisonActivity): { event: GameEvent; templateId: string } | null {
  const chanceByActivity: Record<PrisonActivity, number> = {
    labour: 0.32,
    exercise: 0.32,
    socialize: 0.22,
    study: 0.13,
  };
  if (Math.random() > chanceByActivity[activity]) return null;

  const cooldowns = state.prison.incidentCooldowns ?? {};
  const eligible = PRISON_EVENT_LIBRARY.filter((tmpl) => {
    if (!tmpl.activityTags.includes(activity)) return false;
    const last = cooldowns[tmpl.id];
    if (last !== undefined && state.day - last < tmpl.cooldownDays) return false;
    try { return tmpl.condition(state); } catch { return false; }
  });
  if (eligible.length === 0) return null;

  const totalWeight = eligible.reduce((sum, t) => sum + t.weight, 0);
  let roll = Math.random() * totalWeight;
  let chosen = eligible[0];
  for (const tmpl of eligible) {
    roll -= tmpl.weight;
    if (roll <= 0) { chosen = tmpl; break; }
  }

  let built;
  try { built = chosen.build(state); } catch { return null; }

  const event: GameEvent = {
    id: `${chosen.id}_${state.day}_${Math.random().toString(36).slice(2, 7)}`,
    title: built.title,
    description: built.description,
    type: 'crime',
    category: 'crime',
    choices: built.choices,
    day: state.day,
  };

  return { event, templateId: chosen.id };
}
