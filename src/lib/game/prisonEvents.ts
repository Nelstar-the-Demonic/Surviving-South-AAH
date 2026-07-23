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
  severity: 'incident' | 'neutral'; // 'incident' resets the good-behavior streak; 'neutral' doesn't
  condition: (state: GameState) => boolean;
  build: (state: GameState) => { title: string; description: string; choices: GameEvent['choices'] };
}

function randInt(min: number, max: number): number { return min + Math.floor(Math.random() * (max - min + 1)); }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

const GANG_INFO: Record<Exclude<PrisonGang, 'none'>, { name: string; flavor: string }> = {
  sunrise:    { name: 'Sunrise',   flavor: 'money and hustle — petty theft, smuggling, running the wing economy' },
  axemen:     { name: '🪓 Men',    flavor: 'the muscle — violence, intimidation, protection rackets' },
  amadoda:    { name: 'Amadoda Amnyama', flavor: 'the heaviest crowd in the wing — best avoided if you can help it' },
  amajita:    { name: 'AmaJita',   flavor: 'the gym crew — respect earned through strength, not violence' },
  reformers:  { name: 'the Reformers', flavor: 'inmates focused on rehabilitation and early release' },
};

// ══════════════════════════════════════════════════════════════════════════
// GANG RECRUITMENT — Sunrise / Axemen / Amadoda only. Always a real choice.
// ══════════════════════════════════════════════════════════════════════════
const GANG_RECRUITMENT_EVENTS: PrisonEventTemplate[] = [
  {
    id: 'prison_recruit_sunrise', weight: 2, cooldownDays: 12, activityTags: ['labour', 'socialize'], severity: 'incident',
    condition: (s) => s.prison.gang === 'none',
    build: () => ({
      title: '💰 Sunrise Is Watching',
      description: 'A quiet inmate approaches you in the workshop. "You\'re sharp with numbers. Sunrise could use someone like you — small hustles, smuggling, we look after our own."',
      choices: [
        { label: 'Join Sunrise', outcome: 'You\'re in. Word travels fast — some doors open, others close.', effect: { statsChange: { reputation: 8, stress: 10 }, joinPrisonGang: 'sunrise' } },
        { label: 'Decline respectfully', outcome: 'He nods and walks off. No hard feelings — for now.', effect: { statsChange: { stress: 5 } } },
      ],
    }),
  },
  {
    id: 'prison_recruit_axemen', weight: 2, cooldownDays: 12, activityTags: ['exercise', 'labour'], severity: 'incident',
    condition: (s) => s.prison.gang === 'none',
    build: () => ({
      title: '🪓 The Axemen Make Contact',
      description: 'In the yard, a scarred inmate sizes you up. "You held your own out there. The Axemen protect their own. You in, or you on your own?"',
      choices: [
        { label: 'Join the Axemen', outcome: 'You have protection now — and obligations that come with it.', effect: { statsChange: { reputation: 10, stress: 15 }, joinPrisonGang: 'axemen' } },
        { label: 'Decline', outcome: '"Your loss," he says, walking off.', effect: { statsChange: { stress: 8 } } },
      ],
    }),
  },
  {
    id: 'prison_recruit_amadoda', weight: 2, cooldownDays: 12, activityTags: ['labour', 'exercise'], severity: 'incident',
    condition: (s) => s.prison.gang === 'none',
    build: () => ({
      title: '⚔️ Amadoda Amnyama Extend an Offer',
      description: 'A senior figure in the wing corners you after lights-out. "We run this section. You could run with us, or you could struggle alone. Your call."',
      choices: [
        { label: 'Join them', outcome: 'You\'re accepted into the fold. The wing looks different to you now.', effect: { statsChange: { reputation: 9, stress: 12 }, joinPrisonGang: 'amadoda' } },
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
    id: 'prison_fight_yard', weight: 3, cooldownDays: 6, activityTags: ['exercise', 'labour'], severity: 'incident',
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
    id: 'prison_fight_gang_rival', weight: 2, cooldownDays: 10, activityTags: ['labour', 'exercise', 'socialize'], severity: 'incident',
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
    id: 'prison_stabbing', weight: 1, cooldownDays: 25, activityTags: ['labour', 'exercise'], severity: 'incident',
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
    id: 'prison_warder_beating', weight: 2, cooldownDays: 15, activityTags: ['labour', 'exercise'], severity: 'incident',
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
    id: 'prison_bully_books', weight: 3, cooldownDays: 10, activityTags: ['study'], severity: 'incident',
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
    id: 'prison_study_fight', weight: 1, cooldownDays: 15, activityTags: ['study'], severity: 'incident',
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
    id: 'prison_good_behavior_praise', weight: 3, cooldownDays: 10, activityTags: ['study'], severity: 'neutral',
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
    id: 'prison_reformers_meeting', weight: 2, cooldownDays: 15, activityTags: ['study'], severity: 'neutral',
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

// ══════════════════════════════════════════════════════════════════════════
// FAMILY / FRIEND VISITS
// ══════════════════════════════════════════════════════════════════════════
const VISIT_EVENTS: PrisonEventTemplate[] = [
  {
    id: 'prison_family_visit', weight: 3, cooldownDays: 14, activityTags: ['socialize', 'study'], severity: 'neutral',
    condition: () => true,
    build: () => ({
      title: '👨‍👩‍👧 A Visit',
      description: 'A family member or friend made the trip to see you. A small window of normal life.',
      choices: [
        { label: 'Make the most of it', outcome: 'It lifts your spirits more than you expected.', effect: { statsChange: { happiness: 12, stress: -15 }, cashChange: randInt(50, 200) } },
      ],
    }),
  },
  {
    id: 'prison_no_visit', weight: 1, cooldownDays: 20, activityTags: ['socialize'], severity: 'incident',
    condition: () => true,
    build: () => ({
      title: '😔 No One Came',
      description: 'You waited for visiting hours, but no one showed. It stings more than you\'d like to admit.',
      choices: [
        { label: 'Shake it off', outcome: 'You push through the disappointment.', effect: { statsChange: { happiness: -10, stress: 10 } } },
      ],
    }),
  },
];

// ══════════════════════════════════════════════════════════════════════════
// WARDER BRIBES
// ══════════════════════════════════════════════════════════════════════════
const BRIBE_EVENTS: PrisonEventTemplate[] = [
  {
    id: 'prison_warder_bribe_offer', weight: 2, cooldownDays: 15, activityTags: ['labour', 'socialize'], severity: 'neutral',
    condition: (s) => s.cash > 200,
    build: () => {
      const amount = randInt(150, 500);
      return {
        title: '🤝 A Warder Hints at a Deal',
        description: `A warder makes it clear that R${amount} could buy you easier duties and fewer hassles for a while.`,
        choices: [
          { label: `Pay R${amount}`, outcome: 'Things get noticeably easier for a bit.', effect: { cashChange: -amount, statsChange: { stress: -15, happiness: 6 } } },
          { label: 'Refuse', outcome: 'He shrugs and walks off. Things stay as they are.', effect: {} },
        ],
      };
    },
  },
];

// ══════════════════════════════════════════════════════════════════════════
// NEW FRIENDS — can go either way
// ══════════════════════════════════════════════════════════════════════════
const FRIENDSHIP_EVENTS: PrisonEventTemplate[] = [
  {
    id: 'prison_friend_positive', weight: 2, cooldownDays: 15, activityTags: ['socialize', 'labour', 'exercise'], severity: 'neutral',
    condition: () => true,
    build: () => ({
      title: '🤝 An Unexpected Ally',
      description: 'An inmate with connections and years left on their sentence takes a liking to you and starts looking out for you.',
      choices: [
        { label: 'Accept the friendship', outcome: 'Having someone in your corner makes the days easier.', effect: { statsChange: { happiness: 8, stress: -12, reputation: 3 } } },
      ],
    }),
  },
  {
    id: 'prison_friend_negative', weight: 2, cooldownDays: 15, activityTags: ['socialize'], severity: 'incident',
    condition: () => true,
    build: () => {
      const amount = randInt(50, 200);
      return {
        title: '😒 A "Friend" Wants Something',
        description: 'Someone who\'s been friendly turns out to have an angle — they want a "loan" you\'ll never see repaid.',
        choices: [
          { label: 'Pay to avoid trouble', outcome: 'Cheaper than the alternative, probably.', effect: { cashChange: -amount, statsChange: { stress: 8 } } },
          { label: 'Refuse', outcome: 'The friendliness cools off fast.', effect: { statsChange: { stress: 15 } } },
        ],
      };
    },
  },
];

export const PRISON_EVENT_LIBRARY: PrisonEventTemplate[] = [
  ...GANG_RECRUITMENT_EVENTS, ...FIGHT_EVENTS, ...STABBING_EVENTS,
  ...WARDER_EVENTS, ...BULLYING_EVENTS, ...GOOD_BEHAVIOR_EVENTS,
  ...VISIT_EVENTS, ...BRIBE_EVENTS, ...FRIENDSHIP_EVENTS,
];

/**
 * Rolls a prison incident based on which activity the player just did.
 * Labour/Exercise are the roughest and most frequent; Study is milder and
 * rarer; Socialize sits in between (and is how gang contacts are made).
 * Returns null if nothing fires (most of the time, for Study especially).
 */
export function rollPrisonEvent(state: GameState, activity: PrisonActivity): { event: GameEvent; templateId: string; severity: 'incident' | 'neutral' } | null {
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

  return { event, templateId: chosen.id, severity: chosen.severity };
}
