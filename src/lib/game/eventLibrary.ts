// ─── Event Library ──────────────────────────────────────────────────────────
// A large pool of conditional, weighted random event templates. This file is
// additive: it does not modify or remove any existing gameplay systems. It is
// consumed by `generateDailyEvents` in gameEngine.ts via `selectEventFromLibrary`.
//
// Each template declares WHEN it's allowed to fire (condition) and HOW to build
// its text/choices (build). Many templates use randomized phrasing + randomized
// magnitudes so that the same template rarely plays out identically twice.

import type { GameEvent, EventCategory, EventType, Location } from '@/types/game';
import { NPC_NAME_POOL } from './gameData';

export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter';

// Kept in sync with getSASeason() in gameEngine.ts. Duplicated locally (rather
// than imported) to avoid a circular import between gameEngine <-> eventLibrary.
export function getSeasonForDay(day: number): Season {
  const d = ((day - 1) % 365) + 1;
  if (d >= 335 || d <= 60) return 'Summer';
  if (d >= 245) return 'Spring';
  if (d >= 152) return 'Winter';
  return 'Autumn';
}

export interface EventContext {
  state: import('@/types/game').GameState;
  season: Season;
}

export interface EventTemplate {
  id: string;
  category: EventCategory;
  type: EventType;
  weight: number;       // relative chance among currently-eligible templates
  cooldownDays: number; // minimum days before this template can repeat
  condition: (ctx: EventContext) => boolean;
  build: (ctx: EventContext) => { title: string; description: string; choices: GameEvent['choices'] };
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number): number { return min + Math.floor(Math.random() * (max - min + 1)); }
function randomNpcName(): string { return pick(Math.random() < 0.5 ? NPC_NAME_POOL.male : NPC_NAME_POOL.female); }

const HIGH_CRIME_LOCATIONS: Location[] = ['Township', 'Informal Settlement', 'City'];

function hasBusiness(ctx: EventContext) { return ctx.state.businesses.length > 0; }
function hasFarm(ctx: EventContext) { return ctx.state.cropPlots.length > 0; }
function hasOrchard(ctx: EventContext) { return ctx.state.orchardPlots.length > 0; }
function hasLivestock(ctx: EventContext) { return ctx.state.livestock.length > 0; }
function hasVehicle(ctx: EventContext) { return ctx.state.vehicles.length > 0; }
function hasJob(ctx: EventContext) { return ctx.state.currentJob !== null || ctx.state.formalEmployment !== null; }
function hasPartner(ctx: EventContext) { return ctx.state.npcs.some(n => n.isPartner); }
function isSingle(ctx: EventContext) { return !ctx.state.npcs.some(n => n.isPartner); }
function ownsProperty(ctx: EventContext) { return ctx.state.properties.some(p => p.owned); }
function highCrimeArea(ctx: EventContext) { return HIGH_CRIME_LOCATIONS.includes(ctx.state.location); }
function heat(ctx: EventContext) { return ctx.state.crimeState?.wantedLevel ?? 0; }
function randomBusinessName(ctx: EventContext) { return pick(ctx.state.businesses).name; }
function randomVehicleType(ctx: EventContext) { return pick(ctx.state.vehicles).type; }
function randomCropName(ctx: EventContext) { return pick(ctx.state.cropPlots).cropType; }
function randomLivestockType(ctx: EventContext) { return pick(ctx.state.livestock).type; }
function randomFriendlyNpc(ctx: EventContext) {
  const friendly = ctx.state.npcs.filter(n => !n.isEnemy);
  return friendly.length > 0 ? pick(friendly).name : randomNpcName();
}

// ══════════════════════════════════════════════════════════════════════════
// CRIME
// ══════════════════════════════════════════════════════════════════════════
const CRIME_EVENTS: EventTemplate[] = [
  {
    id: 'crime_witness_offer', category: 'crime', type: 'crime', weight: 3, cooldownDays: 14,
    condition: (ctx) => highCrimeArea(ctx) && heat(ctx) < 40,
    build: () => ({
      title: '👀 You Witnessed Something',
      description: 'You saw a robbery go down on the street. The gang noticed you watching and now you have a choice to make.',
      choices: [
        { label: 'Stay silent, walk away', outcome: 'You keep your head down. Nobody bothers you.', effect: { statsChange: { stress: 8 } } },
        { label: 'Report it to police', outcome: 'You gave a statement. Word may get around that you talk.', effect: { statsChange: { reputation: 4, stress: 15 }, wantedLevelChange: 0 } },
        { label: 'Ask for a cut to stay quiet', outcome: 'They toss you some cash to keep your mouth shut.', effect: { cashChange: randInt(150, 400), statsChange: { stress: 10, reputation: -3 }, wantedLevelChange: 5 } },
      ],
    }),
  },
  {
    id: 'crime_gang_recruitment', category: 'crime', type: 'crime', weight: 2, cooldownDays: 25,
    condition: (ctx) => highCrimeArea(ctx) && ctx.state.stats.reputation < 60,
    build: () => ({
      title: '🔫 A Gang Wants You In',
      description: 'A local gang has been watching you and offers you a spot. Easy money, but there\'s no easy way out once you\'re in.',
      choices: [
        { label: 'Join them', outcome: 'You\'re in. The streets treat you differently now.', effect: { cashChange: randInt(300, 700), statsChange: { reputation: -8, stress: 10 }, wantedLevelChange: 15 } },
        { label: 'Politely decline', outcome: 'They shrug it off, for now.', effect: { statsChange: { stress: 5 } } },
        { label: 'Report them to police', outcome: 'Risky move. You could make enemies for life.', effect: { statsChange: { stress: 25, reputation: 5 }, wantedLevelChange: -5 } },
      ],
    }),
  },
  {
    id: 'crime_stolen_goods_offer', category: 'crime', type: 'crime', weight: 3, cooldownDays: 12,
    condition: (ctx) => highCrimeArea(ctx),
    build: () => {
      const item = pick(['smartphone', 'laptop', 'car radio', 'power tools', 'bicycle']);
      return {
        title: '📦 Cheap Stolen Goods',
        description: `A guy on the corner is selling a ${item} way under market price. Clearly hot, but the deal is tempting.`,
        choices: [
          { label: 'Buy it', outcome: 'You got a bargain — and a legal risk.', effect: { cashChange: -randInt(100, 350), statsChange: { happiness: 5 }, wantedLevelChange: 8 } },
          { label: 'Walk away', outcome: 'Not worth the risk.', effect: { statsChange: { stress: -2 } } },
        ],
      };
    },
  },
  {
    id: 'crime_wrong_place', category: 'crime', type: 'crime', weight: 3, cooldownDays: 10,
    condition: (ctx) => highCrimeArea(ctx) && ctx.state.stats.happiness < 55,
    build: () => ({
      title: '⚠️ Wrong Place, Wrong Time',
      description: 'You stumbled into a dispute between two local crews. Tension is high and eyes are on you.',
      choices: [
        { label: 'Keep walking, don\'t engage', outcome: 'You get through unscathed, but rattled.', effect: { statsChange: { stress: 15 } } },
        { label: 'Try to talk them down', outcome: 'Your calm words defuse things a little.', effect: { statsChange: { reputation: 5, stress: 10 } } },
        { label: 'Run', outcome: 'You bolt and avoid the mess entirely.', effect: { statsChange: { energy: -10, stress: 5 } } },
      ],
    }),
  },
  {
    id: 'crime_debt_collector', category: 'crime', type: 'crime', weight: 2, cooldownDays: 20,
    condition: (ctx) => heat(ctx) > 20,
    build: (ctx) => {
      const owed = randInt(300, 900);
      return {
        title: '💰 Old Debt Comes Calling',
        description: `Someone from your past says you owe them R${owed} from way back. They're not asking nicely.`,
        choices: [
          { label: 'Pay it off', outcome: 'Debt cleared. One less thing hanging over you.', effect: { cashChange: -owed, statsChange: { stress: -10 } } },
          { label: 'Deny it and refuse', outcome: 'They leave angry — this might not be over.', effect: { statsChange: { stress: 20 }, wantedLevelChange: 5 } },
          { label: 'Negotiate a smaller amount', outcome: 'You settle for less than they wanted.', effect: { cashChange: -randInt(100, 300), statsChange: { stress: 5 } } },
        ],
      };
    },
  },
  {
    id: 'crime_fence_opportunity', category: 'crime', type: 'crime', weight: 2, cooldownDays: 18,
    condition: (ctx) => highCrimeArea(ctx) && heat(ctx) < 50,
    build: () => ({
      title: '🕶️ The Fence Calls',
      description: 'A contact offers to move some "extra" goods for you, no questions asked, for a cut of the profit.',
      choices: [
        { label: 'Use the fence', outcome: 'Quick, quiet cash — but it draws attention.', effect: { cashChange: randInt(200, 600), wantedLevelChange: 10, statsChange: { stress: 8 } } },
        { label: 'Decline', outcome: 'You keep your record clean.', effect: { statsChange: { stress: -2 } } },
      ],
    }),
  },
];

// ══════════════════════════════════════════════════════════════════════════
// POLICE / HEAT
// ══════════════════════════════════════════════════════════════════════════
const POLICE_EVENTS: EventTemplate[] = [
  {
    id: 'police_roadblock', category: 'police', type: 'police', weight: 3, cooldownDays: 10,
    condition: (ctx) => hasVehicle(ctx) && heat(ctx) > 10,
    build: (ctx) => ({
      title: '🚓 Police Roadblock',
      description: `Police have set up a roadblock ahead. Your ${randomVehicleType(ctx)} is next in line for a search.`,
      choices: [
        { label: 'Stay calm, cooperate', outcome: 'They wave you through after checking your papers.', effect: { statsChange: { stress: 10 } } },
        { label: 'Try to bribe the officer', outcome: 'It works, but it\'s a gamble every time.', effect: { cashChange: -randInt(100, 400), wantedLevelChange: -10 } },
        { label: 'Turn around and avoid it', outcome: 'You take the long way, wasting time.', effect: { statsChange: { energy: -10, stress: 15 } } },
      ],
    }),
  },
  {
    id: 'police_stop_and_search', category: 'police', type: 'police', weight: 3, cooldownDays: 8,
    condition: (ctx) => highCrimeArea(ctx) && heat(ctx) > 15,
    build: () => ({
      title: '🚔 Stop and Search',
      description: 'Two officers stop you on the street, citing "suspicious behaviour." Your bag is about to be searched.',
      choices: [
        { label: 'Let them search', outcome: 'Nothing found. They let you go, annoyed.', effect: { statsChange: { stress: 15 } } },
        { label: 'Protest your rights', outcome: 'It escalates the tension but you hold your ground.', effect: { statsChange: { stress: 20, reputation: 3 } } },
      ],
    }),
  },
  {
    id: 'police_witness_summons', category: 'police', type: 'police', weight: 2, cooldownDays: 20,
    condition: (ctx) => heat(ctx) > 30,
    build: () => ({
      title: '📄 Police Summons',
      description: 'A summons arrives — police want to question you about recent activity in the area.',
      choices: [
        { label: 'Show up and cooperate', outcome: 'The questioning is uncomfortable but you check out clean.', effect: { statsChange: { stress: 20 }, wantedLevelChange: -15 } },
        { label: 'Ignore it', outcome: 'Skipping it raises more suspicion.', effect: { wantedLevelChange: 15, statsChange: { stress: 10 } } },
      ],
    }),
  },
  {
    id: 'police_community_patrol', category: 'police', type: 'police', weight: 2, cooldownDays: 15,
    condition: (ctx) => heat(ctx) < 20,
    build: () => ({
      title: '👮 Community Police Visit',
      description: 'Local police are doing rounds, chatting with residents to build trust in the community.',
      choices: [
        { label: 'Greet them warmly', outcome: 'Small talk pays off — you\'re seen as a good citizen.', effect: { statsChange: { reputation: 4, happiness: 3 } } },
        { label: 'Keep your distance', outcome: 'You avoid the interaction entirely.', effect: {} },
      ],
    }),
  },
  {
    id: 'police_heat_cooldown', category: 'police', type: 'police', weight: 2, cooldownDays: 20,
    condition: (ctx) => heat(ctx) > 60,
    build: () => ({
      title: '🕵️ Laying Low',
      description: 'Word on the street is the police have your name flagged. It might be smart to keep a low profile for a while.',
      choices: [
        { label: 'Lay low for a few days', outcome: 'Staying out of sight cools things down.', effect: { statsChange: { stress: -5, happiness: -5 }, wantedLevelChange: -20 } },
        { label: 'Carry on as normal', outcome: 'Risky, but you keep your routine.', effect: { statsChange: { stress: 10 } } },
      ],
    }),
  },
];

// ══════════════════════════════════════════════════════════════════════════
// BUSINESS
// ══════════════════════════════════════════════════════════════════════════
const BUSINESS_EVENTS: EventTemplate[] = [
  {
    id: 'biz_loyal_customer', category: 'business', type: 'business', weight: 3, cooldownDays: 10,
    condition: hasBusiness,
    build: (ctx) => ({
      title: '⭐ A Loyal Customer',
      description: `A regular customer at ${randomBusinessName(ctx)} publicly praises your service to their friends.`,
      choices: [
        { label: 'Thank them, offer a small discount', outcome: 'Word spreads, more customers show up.', effect: { businessReputationChange: 8, cashChange: -50 } },
        { label: 'Just say thanks', outcome: 'Simple, genuine, appreciated.', effect: { businessReputationChange: 4 } },
      ],
    }),
  },
  {
    id: 'biz_health_inspector', category: 'business', type: 'business', weight: 2, cooldownDays: 20,
    condition: hasBusiness,
    build: (ctx) => ({
      title: '📋 Inspector Visit',
      description: `A municipal inspector shows up unannounced at ${randomBusinessName(ctx)} to check compliance.`,
      choices: [
        { label: 'Let them inspect properly', outcome: 'You pass, reputation grows.', effect: { businessReputationChange: 6 } },
        { label: 'Slip them a bribe', outcome: 'They look the other way — for now.', effect: { cashChange: -randInt(200, 500), wantedLevelChange: 5 } },
        { label: 'Refuse entry', outcome: 'They come back with a fine.', effect: { cashChange: -randInt(500, 1200), businessReputationChange: -10 } },
      ],
    }),
  },
  {
    id: 'biz_competitor_opens', category: 'business', type: 'business', weight: 2, cooldownDays: 25,
    condition: hasBusiness,
    build: () => ({
      title: '🏬 New Competitor Nearby',
      description: 'A rival business just opened two streets down, undercutting your prices.',
      choices: [
        { label: 'Drop your prices too', outcome: 'You keep customers but shrink your margins.', effect: { cashChange: -randInt(100, 300), businessReputationChange: 3 } },
        { label: 'Improve service instead', outcome: 'Quality wins out over price.', effect: { businessReputationChange: 10, statsChange: { stress: 5 } } },
        { label: 'Ignore it', outcome: 'You lose a bit of foot traffic.', effect: { cashChange: -randInt(150, 350) } },
      ],
    }),
  },
  {
    id: 'biz_bulk_order', category: 'business', type: 'business', weight: 3, cooldownDays: 15,
    condition: hasBusiness,
    build: (ctx) => ({
      title: '📦 Bulk Order Request',
      description: `Someone wants to place a large bulk order from ${randomBusinessName(ctx)}. Good for cash, tight on stock.`,
      choices: [
        { label: 'Accept the order', outcome: 'Big payday, stock runs low.', effect: { cashChange: randInt(500, 1500), businessReputationChange: 5 } },
        { label: 'Decline, too risky', outcome: 'You play it safe.', effect: {} },
      ],
    }),
  },
  {
    id: 'biz_staff_theft', category: 'business', type: 'business', weight: 2, cooldownDays: 20,
    condition: hasBusiness,
    build: (ctx) => ({
      title: '🕵️ Suspected Staff Theft',
      description: `Stock keeps disappearing from ${randomBusinessName(ctx)}. You suspect someone on the inside.`,
      choices: [
        { label: 'Confront them directly', outcome: 'Tense, but it stops the losses.', effect: { businessReputationChange: -3, statsChange: { stress: 15 } } },
        { label: 'Install cameras', outcome: 'A solid long-term fix.', effect: { cashChange: -randInt(300, 600), businessReputationChange: 5 } },
        { label: 'Let it slide', outcome: 'Losses continue quietly.', effect: { cashChange: -randInt(200, 500) } },
      ],
    }),
  },
  {
    id: 'biz_social_media_buzz', category: 'business', type: 'business', weight: 2, cooldownDays: 20,
    condition: hasBusiness,
    build: (ctx) => ({
      title: '📱 Social Media Buzz',
      description: `Someone posted about ${randomBusinessName(ctx)} online and it's getting attention.`,
      choices: [
        { label: 'Lean into the hype, promote it', outcome: 'Traffic spikes for a while.', effect: { cashChange: randInt(200, 600), businessReputationChange: 10 } },
        { label: 'Ignore it', outcome: 'The moment passes.', effect: {} },
      ],
    }),
  },
];

// ══════════════════════════════════════════════════════════════════════════
// FAMILY
// ══════════════════════════════════════════════════════════════════════════
const FAMILY_EVENTS: EventTemplate[] = [
  {
    id: 'family_needs_money', category: 'relationship', type: 'family', weight: 3, cooldownDays: 12,
    condition: () => true,
    build: () => {
      const needed = randInt(200, 800);
      return {
        title: '👨‍👩‍👧 Family Needs Help',
        description: `A relative calls asking for R${needed} to cover an emergency at home.`,
        choices: [
          { label: 'Send the money', outcome: 'Family comes first — even if it hurts your wallet.', effect: { cashChange: -needed, statsChange: { happiness: 5, stress: -5 } } },
          { label: 'Say you can\'t right now', outcome: 'A hard call, but you protect your finances.', effect: { statsChange: { stress: 10, happiness: -8 } } },
        ],
      };
    },
  },
  {
    id: 'family_illness', category: 'relationship', type: 'family', weight: 2, cooldownDays: 30,
    condition: () => true,
    build: () => ({
      title: '🏥 Family Member Falls Ill',
      description: 'A close family member has taken ill and needs support, emotionally and financially.',
      choices: [
        { label: 'Visit and help pay for treatment', outcome: 'You show up for them, at a cost.', effect: { cashChange: -randInt(300, 900), statsChange: { happiness: 8, stress: 10 } } },
        { label: 'Send what you can afford', outcome: 'A smaller gesture, but it counts.', effect: { cashChange: -randInt(100, 300), statsChange: { stress: 5 } } },
      ],
    }),
  },
  {
    id: 'family_visit', category: 'relationship', type: 'family', weight: 3, cooldownDays: 10,
    condition: () => true,
    build: () => ({
      title: '🏡 Family Visit',
      description: 'Relatives drop by unannounced for a weekend visit, bringing food and gossip.',
      choices: [
        { label: 'Host them properly', outcome: 'A warm, tiring, worthwhile weekend.', effect: { cashChange: -randInt(80, 200), statsChange: { happiness: 12, energy: -10 } } },
        { label: 'Keep it brief', outcome: 'Polite but distant.', effect: { statsChange: { happiness: 3 } } },
      ],
    }),
  },
  {
    id: 'family_land_dispute', category: 'relationship', type: 'family', weight: 2, cooldownDays: 30,
    condition: (ctx) => ctx.state.location === 'Village' || ctx.state.location === 'Farm',
    build: () => ({
      title: '📜 Land Dispute',
      description: 'A dispute has broken out among relatives about who has rights to a piece of family land.',
      choices: [
        { label: 'Push for a family meeting to resolve it', outcome: 'It takes effort, but it keeps the peace.', effect: { statsChange: { stress: 15, reputation: 5 } } },
        { label: 'Stay out of it', outcome: 'You avoid the drama entirely.', effect: { statsChange: { stress: 5 } } },
      ],
    }),
  },
  {
    id: 'family_pride', category: 'relationship', type: 'family', weight: 2, cooldownDays: 20,
    condition: (ctx) => ctx.state.stats.reputation > 55,
    build: () => ({
      title: '🎉 Family is Proud of You',
      description: 'Word has gotten around about how well you\'re doing, and your family couldn\'t be prouder.',
      choices: [
        { label: 'Soak it in', outcome: 'A genuinely good day.', effect: { statsChange: { happiness: 10, stress: -8 } } },
      ],
    }),
  },
];

// ══════════════════════════════════════════════════════════════════════════
// ROMANCE
// ══════════════════════════════════════════════════════════════════════════
const ROMANCE_EVENTS: EventTemplate[] = [
  {
    id: 'romance_date_night', category: 'romance', type: 'romance', weight: 3, cooldownDays: 10,
    condition: hasPartner,
    build: () => ({
      title: '💕 Date Night',
      description: 'Your partner suggests a proper night out together, just the two of you.',
      choices: [
        { label: 'Splurge on a nice date', outcome: 'A memorable night for both of you.', effect: { cashChange: -randInt(150, 400), statsChange: { happiness: 15, stress: -10 } } },
        { label: 'Suggest something low-key', outcome: 'Simple, but still special.', effect: { cashChange: -randInt(20, 80), statsChange: { happiness: 8 } } },
      ],
    }),
  },
  {
    id: 'romance_argument', category: 'romance', type: 'romance', weight: 2, cooldownDays: 12,
    condition: hasPartner,
    build: () => ({
      title: '💔 A Disagreement',
      description: 'You and your partner get into an argument about money, time, or trust — it\'s tense.',
      choices: [
        { label: 'Talk it through calmly', outcome: 'You work through it together.', effect: { statsChange: { stress: 5, happiness: 5 } } },
        { label: 'Give each other space', outcome: 'The tension cools, but lingers.', effect: { statsChange: { stress: 10, happiness: -5 } } },
      ],
    }),
  },
  {
    id: 'romance_proposal_thought', category: 'romance', type: 'romance', weight: 1, cooldownDays: 60,
    condition: (ctx) => hasPartner(ctx) && ctx.state.cash > 3000,
    build: () => ({
      title: '💍 Thinking About the Future',
      description: 'Things have been going well for a while now. Your partner has been dropping hints about the future.',
      choices: [
        { label: 'Start saving for a ring', outcome: 'You quietly set money aside.', effect: { cashChange: -randInt(500, 1500), statsChange: { happiness: 10 } } },
        { label: 'Not ready yet', outcome: 'You keep things as they are.', effect: { statsChange: { stress: 5 } } },
      ],
    }),
  },
  {
    id: 'romance_new_interest', category: 'romance', type: 'romance', weight: 2, cooldownDays: 15,
    condition: isSingle,
    build: () => ({
      title: '😊 Someone Caught Your Eye',
      description: `${randomNpcName()} has been friendly toward you lately. There might be something there.`,
      choices: [
        { label: 'Make a move', outcome: 'You put yourself out there.', effect: { statsChange: { happiness: 8, stress: 5 } } },
        { label: 'Keep it professional', outcome: 'You let the moment pass.', effect: {} },
      ],
    }),
  },
  {
    id: 'romance_jealousy', category: 'romance', type: 'romance', weight: 2, cooldownDays: 15,
    condition: hasPartner,
    build: () => ({
      title: '😒 Jealousy Flares Up',
      description: 'Your partner saw you talking closely with someone else and isn\'t happy about it.',
      choices: [
        { label: 'Reassure them', outcome: 'A little effort smooths things over.', effect: { statsChange: { happiness: 5, stress: 5 } } },
        { label: 'Brush it off', outcome: 'They don\'t forget it easily.', effect: { statsChange: { happiness: -8, stress: 10 } } },
      ],
    }),
  },
];

// ══════════════════════════════════════════════════════════════════════════
// FRIENDSHIP
// ══════════════════════════════════════════════════════════════════════════
const FRIENDSHIP_EVENTS: EventTemplate[] = [
  {
    id: 'friend_night_out', category: 'friendship', type: 'friendship', weight: 3, cooldownDays: 10,
    condition: (ctx) => ctx.state.npcs.length > 0,
    build: (ctx) => ({
      title: '🍻 Friends Want to Hang Out',
      description: `${randomFriendlyNpc(ctx)} invites you out for the evening with the crew.`,
      choices: [
        { label: 'Go out, spend a little', outcome: 'A good night, refreshed spirit.', effect: { cashChange: -randInt(50, 200), statsChange: { happiness: 12, energy: -10 } } },
        { label: 'Stay home instead', outcome: 'You rest up, but miss out.', effect: { statsChange: { energy: 10, happiness: -3 } } },
      ],
    }),
  },
  {
    id: 'friend_needs_favor', category: 'friendship', type: 'friendship', weight: 3, cooldownDays: 10,
    condition: (ctx) => ctx.state.npcs.length > 0,
    build: (ctx) => ({
      title: '🤝 A Friend Needs a Favor',
      description: `${randomFriendlyNpc(ctx)} asks you to help them move house / cover a shift / lend an ear.`,
      choices: [
        { label: 'Help them out', outcome: 'You strengthen the friendship.', effect: { statsChange: { energy: -15, happiness: 6 } } },
        { label: 'Say you\'re too busy', outcome: 'They understand, but it stings a little.', effect: { statsChange: { happiness: -3 } } },
      ],
    }),
  },
  {
    id: 'friend_betrayal', category: 'friendship', type: 'friendship', weight: 1, cooldownDays: 40,
    condition: (ctx) => ctx.state.npcs.length > 1,
    build: (ctx) => ({
      title: '😠 A Friend Let You Down',
      description: `You find out ${randomFriendlyNpc(ctx)} spread a rumour about you behind your back.`,
      choices: [
        { label: 'Confront them', outcome: 'It clears the air, but there\'s tension now.', effect: { statsChange: { stress: 15, reputation: -2 } } },
        { label: 'Let it go', outcome: 'You keep the peace, but trust it a little less.', effect: { statsChange: { stress: 5 } } },
      ],
    }),
  },
  {
    id: 'friend_gift', category: 'friendship', type: 'friendship', weight: 2, cooldownDays: 15,
    condition: (ctx) => ctx.state.npcs.length > 0,
    build: (ctx) => ({
      title: '🎁 An Unexpected Gift',
      description: `${randomFriendlyNpc(ctx)} surprises you with a small gift, just because.`,
      choices: [
        { label: 'Accept graciously', outcome: 'A genuinely warm moment.', effect: { statsChange: { happiness: 8 }, cashChange: randInt(20, 100) } },
      ],
    }),
  },
];

// ══════════════════════════════════════════════════════════════════════════
// NPC (general strangers / community encounters)
// ══════════════════════════════════════════════════════════════════════════
const NPC_EVENTS: EventTemplate[] = [
  {
    id: 'npc_stranger_help', category: 'npc', type: 'npc', weight: 3, cooldownDays: 10,
    condition: () => true,
    build: () => ({
      title: '🙋 A Stranger Needs Help',
      description: 'Someone asks for directions, a small loan, or a bit of your time on the street.',
      choices: [
        { label: 'Help them', outcome: 'A small kindness, well received.', effect: { statsChange: { happiness: 4, reputation: 2 } } },
        { label: 'Keep walking', outcome: 'You mind your own business.', effect: {} },
      ],
    }),
  },
  {
    id: 'npc_lost_wallet', category: 'npc', type: 'npc', weight: 2, cooldownDays: 20,
    condition: () => true,
    build: () => {
      const found = randInt(100, 500);
      return {
        title: '👛 You Found a Lost Wallet',
        description: `You spot a wallet on the ground with about R${found} inside.`,
        choices: [
          { label: 'Try to return it', outcome: 'The owner is grateful and rewards you.', effect: { cashChange: randInt(30, 150), statsChange: { reputation: 6, happiness: 5 } } },
          { label: 'Keep the cash', outcome: 'Extra money, extra guilt.', effect: { cashChange: found, statsChange: { happiness: -3 } } },
        ],
      };
    },
  },
  {
    id: 'npc_charity_drive', category: 'npc', type: 'npc', weight: 2, cooldownDays: 20,
    condition: () => true,
    build: () => ({
      title: '🤲 Community Charity Drive',
      description: 'Volunteers are collecting donations for families in need this month.',
      choices: [
        { label: 'Donate what you can', outcome: 'Your reputation in the community grows.', effect: { cashChange: -randInt(30, 150), statsChange: { reputation: 6, happiness: 5 } } },
        { label: 'Not this time', outcome: 'You keep your cash for now.', effect: {} },
      ],
    }),
  },
  {
    id: 'npc_gossip', category: 'npc', type: 'npc', weight: 3, cooldownDays: 10,
    condition: () => true,
    build: () => ({
      title: '🗣️ Neighbourhood Gossip',
      description: 'Someone shares an interesting (and possibly exaggerated) rumour about a local business or personality.',
      choices: [
        { label: 'Listen with interest', outcome: 'You keep your ear to the ground.', effect: { statsChange: { happiness: 2 } } },
        { label: 'Shut it down', outcome: 'You don\'t entertain gossip.', effect: { statsChange: { reputation: 2 } } },
      ],
    }),
  },
];

// ══════════════════════════════════════════════════════════════════════════
// FARMING
// ══════════════════════════════════════════════════════════════════════════
const FARMING_EVENTS: EventTemplate[] = [
  {
    id: 'farm_excellent_harvest', category: 'farming', type: 'farming', weight: 3, cooldownDays: 20,
    condition: hasFarm,
    build: (ctx) => ({
      title: '🌾 Excellent Growing Conditions',
      description: `Perfect weather has boosted your ${randomCropName(ctx)} plot's growth this week.`,
      choices: [
        { label: 'Great news', outcome: 'Your harvest yield will be noticeably better.', effect: { statsChange: { happiness: 5 } } },
      ],
    }),
  },
  {
    id: 'farm_pest_warning', category: 'farming', type: 'farming', weight: 3, cooldownDays: 15,
    condition: hasFarm,
    build: (ctx) => ({
      title: '🐛 Pests Spotted',
      description: `You notice early signs of pests on your ${randomCropName(ctx)} plot.`,
      choices: [
        { label: 'Apply pesticide now (R150)', outcome: 'You catch it early and protect the yield.', effect: { cashChange: -150, statsChange: { stress: -3 } } },
        { label: 'Wait and see', outcome: 'Risky — it could spread.', effect: { statsChange: { stress: 8 } } },
      ],
    }),
  },
  {
    id: 'farm_government_grant', category: 'farming', type: 'farming', weight: 1, cooldownDays: 60,
    condition: hasFarm,
    build: () => ({
      title: '🏛️ Agricultural Grant Available',
      description: 'A government small-farmer support grant is open for applications this month.',
      choices: [
        { label: 'Apply for it', outcome: 'The paperwork pays off.', effect: { cashChange: randInt(500, 2000), statsChange: { stress: 10 } } },
        { label: 'Too much admin, skip it', outcome: 'You save the hassle.', effect: {} },
      ],
    }),
  },
  {
    id: 'farm_equipment_failure', category: 'farming', type: 'farming', weight: 2, cooldownDays: 20,
    condition: hasFarm,
    build: () => ({
      title: '🔧 Equipment Breaks Down',
      description: 'A hoe, pump, or tool you rely on has broken and needs replacing.',
      choices: [
        { label: 'Replace it (R250)', outcome: 'Back to full productivity.', effect: { cashChange: -250 } },
        { label: 'Work around it', outcome: 'Slower going for now.', effect: { statsChange: { energy: -10, stress: 8 } } },
      ],
    }),
  },
  {
    id: 'farm_theft', category: 'farming', type: 'farming', weight: 2, cooldownDays: 20,
    condition: hasFarm,
    build: (ctx) => ({
      title: '🌙 Crop Theft Overnight',
      description: `Someone raided your ${randomCropName(ctx)} plot overnight and made off with some of the harvest.`,
      choices: [
        { label: 'Report it', outcome: 'Little comes of it, but it\'s on record.', effect: { statsChange: { stress: 10 } } },
        { label: 'Set up a night watch', outcome: 'You lose sleep, but deter future theft.', effect: { statsChange: { energy: -15, stress: 5 } } },
      ],
    }),
  },
  {
    id: 'farm_market_demand', category: 'farming', type: 'farming', weight: 2, cooldownDays: 15,
    condition: (ctx) => ctx.state.inventory.some(i => i.category === 'harvest' && i.quantity > 0),
    build: (ctx) => {
      const stock = ctx.state.inventory.filter(i => i.category === 'harvest' && i.quantity > 0);
      const item = pick(stock);
      const sellQty = Math.round(Math.min(item.quantity, randInt(5, 20)) * 10) / 10;
      const total = Math.round(sellQty * (item.sellPrice ?? 10) * 1.3);
      return {
        title: '📈 High Market Demand',
        description: `Local markets are paying well above normal for ${item.name} right now.`,
        choices: [
          { label: `Sell ${sellQty}${item.unit ?? 'kg'} at the higher price`, outcome: 'Good timing pays off.', effect: { cashChange: total, inventoryRemove: [{ id: item.id, quantity: sellQty }] } },
          { label: 'Hold onto your stock', outcome: 'You wait, hoping for an even better price later.', effect: {} },
        ],
      };
    },
  },
  {
    id: 'orchard_bumper_season', category: 'farming', type: 'farming', weight: 2, cooldownDays: 25,
    condition: (ctx) => hasOrchard(ctx) && ctx.state.inventory.some(i => i.category === 'harvest' && i.quantity > 0),
    build: (ctx) => {
      const stock = ctx.state.inventory.filter(i => i.category === 'harvest' && i.quantity > 0);
      const item = pick(stock);
      const sellQty = Math.round(Math.min(item.quantity, randInt(3, 15)) * 10) / 10;
      const total = Math.round(sellQty * (item.sellPrice ?? 10) * 1.2);
      return {
        title: '🍎 Bumper Fruit Season',
        description: 'Your fruit trees are producing more than usual this season.',
        choices: [
          { label: `Sell the surplus (${sellQty}${item.unit ?? 'kg'})`, outcome: 'A welcome bonus.', effect: { cashChange: total, statsChange: { happiness: 5 }, inventoryRemove: [{ id: item.id, quantity: sellQty }] } },
        ],
      };
    },
  },
];

// ══════════════════════════════════════════════════════════════════════════
// LIVESTOCK
// ══════════════════════════════════════════════════════════════════════════
const LIVESTOCK_EVENTS: EventTemplate[] = [
  {
    id: 'livestock_predator', category: 'livestock', type: 'livestock', weight: 2, cooldownDays: 20,
    condition: hasLivestock,
    build: (ctx) => ({
      title: '🐺 Predator Attack',
      description: `Something got into your ${randomLivestockType(ctx)} pen overnight.`,
      choices: [
        { label: 'Reinforce the fencing (R200)', outcome: 'A solid long-term fix.', effect: { cashChange: -200, statsChange: { stress: -3 } } },
        { label: 'Deal with the loss', outcome: 'You absorb the damage this time.', effect: { statsChange: { stress: 10, happiness: -5 } } },
      ],
    }),
  },
  {
    id: 'livestock_good_sale', category: 'livestock', type: 'livestock', weight: 2, cooldownDays: 15,
    condition: (ctx) => ctx.state.livestock.some(g => g.males + g.females > 0),
    build: (ctx) => {
      const group = pick(ctx.state.livestock.filter(g => g.males + g.females > 0));
      return {
        title: '💰 Buyer Interested',
        description: `A trader is interested in buying some of your ${group.type} at a fair price.`,
        choices: [
          { label: 'Negotiate a sale', outcome: 'A profitable exchange.', effect: { cashChange: randInt(200, 600) } },
          { label: 'Not selling right now', outcome: 'You hold onto your stock.', effect: {} },
        ],
      };
    },
  },
  {
    id: 'livestock_disease_scare', category: 'livestock', type: 'livestock', weight: 2, cooldownDays: 20,
    condition: hasLivestock,
    build: (ctx) => ({
      title: '🩺 Disease Scare',
      description: `One of your ${randomLivestockType(ctx)} is showing signs of illness. It could spread if untreated.`,
      choices: [
        { label: 'Call the vet (R300)', outcome: 'Treated in time, crisis averted.', effect: { cashChange: -300, statsChange: { stress: -5 } } },
        { label: 'Isolate and monitor', outcome: 'Free, but riskier.', effect: { statsChange: { stress: 10 } } },
      ],
    }),
  },
  {
    id: 'livestock_feed_shortage', category: 'livestock', type: 'livestock', weight: 2, cooldownDays: 15,
    condition: hasLivestock,
    build: () => ({
      title: '🌾 Feed Running Low',
      description: 'Your animal feed stock is getting low earlier than expected this month.',
      choices: [
        { label: 'Buy more feed (R150)', outcome: 'Stock replenished.', effect: { cashChange: -150 } },
        { label: 'Ration it out', outcome: 'Animals get by, but growth slows.', effect: { statsChange: { stress: 5 } } },
      ],
    }),
  },
  {
    id: 'livestock_prize_offer', category: 'livestock', type: 'livestock', weight: 1, cooldownDays: 40,
    condition: hasLivestock,
    build: () => ({
      title: '🏆 Local Livestock Competition',
      description: 'A community livestock show is offering prizes for the best-kept animals.',
      choices: [
        { label: 'Enter the competition', outcome: 'Your care pays off with recognition and prize money.', effect: { cashChange: randInt(150, 400), statsChange: { reputation: 6, happiness: 8 } } },
        { label: 'Skip it', outcome: 'Not worth the hassle this time.', effect: {} },
      ],
    }),
  },
];

// ══════════════════════════════════════════════════════════════════════════
// WEATHER-DRIVEN
// ══════════════════════════════════════════════════════════════════════════
const WEATHER_EVENTS: EventTemplate[] = [
  {
    id: 'weather_heatwave_hits', category: 'weather', type: 'weather', weight: 3, cooldownDays: 8,
    condition: (ctx) => ctx.state.weather === 'Heatwave',
    build: () => ({
      title: '🌡️ Brutal Heatwave',
      description: 'The heat is relentless today. It\'s draining just to move around outside.',
      choices: [
        { label: 'Stay hydrated, take it slow', outcome: 'You manage the heat carefully.', effect: { statsChange: { energy: -10, hunger: -5 } } },
        { label: 'Push through your day as normal', outcome: 'The heat takes a real toll.', effect: { statsChange: { energy: -20, health: -5 } } },
      ],
    }),
  },
  {
    id: 'weather_storm_damage', category: 'weather', type: 'weather', weight: 3, cooldownDays: 10,
    condition: (ctx) => ctx.state.weather === 'Storm',
    build: () => ({
      title: '⛈️ Storm Damage',
      description: 'A heavy storm rolled through overnight, leaving a mess to clean up.',
      choices: [
        { label: 'Clean up and make repairs', outcome: 'It costs time and a bit of cash.', effect: { cashChange: -randInt(50, 250), statsChange: { energy: -15 } } },
        { label: 'Leave it for now', outcome: 'You\'ll deal with it later.', effect: { statsChange: { stress: 5 } } },
      ],
    }),
  },
  {
    id: 'weather_rain_business_slow', category: 'weather', type: 'weather', weight: 2, cooldownDays: 8,
    condition: (ctx) => ctx.state.weather === 'Rain' && hasBusiness(ctx),
    build: (ctx) => ({
      title: '🌧️ Rain Keeps Customers Away',
      description: `The rain has kept foot traffic down at ${randomBusinessName(ctx)} today.`,
      choices: [
        { label: 'Ride it out', outcome: 'A quiet, slower day for business.', effect: { cashChange: -randInt(50, 150) } },
      ],
    }),
  },
  {
    id: 'weather_perfect_day', category: 'weather', type: 'weather', weight: 3, cooldownDays: 8,
    condition: (ctx) => ctx.state.weather === 'Sunny',
    build: () => ({
      title: '☀️ Beautiful Day',
      description: 'Clear skies and a light breeze — a genuinely good day to be outside.',
      choices: [
        { label: 'Enjoy it', outcome: 'A small mood boost from the good weather.', effect: { statsChange: { happiness: 5, stress: -3 } } },
      ],
    }),
  },
  {
    id: 'weather_drought_worry', category: 'weather', type: 'weather', weight: 2, cooldownDays: 20,
    condition: (ctx) => ctx.season === 'Winter' && hasFarm(ctx),
    build: () => ({
      title: '🏜️ Dry Season Worries',
      description: 'It\'s been weeks without meaningful rain. Locals are getting worried about water for crops.',
      choices: [
        { label: 'Invest in irrigation (R400)', outcome: 'A costly but effective fix.', effect: { cashChange: -400 } },
        { label: 'Hope for rain', outcome: 'A gamble on nature.', effect: { statsChange: { stress: 10 } } },
      ],
    }),
  },
];

// ══════════════════════════════════════════════════════════════════════════
// ILLNESS
// ══════════════════════════════════════════════════════════════════════════
const ILLNESS_EVENTS: EventTemplate[] = [
  {
    id: 'illness_catch_cold', category: 'health', type: 'health', weight: 3, cooldownDays: 15,
    condition: (ctx) => ctx.state.stats.hygiene < 50 && !ctx.state.stats.sickness,
    build: () => ({
      title: '🤧 You\'re Coming Down With Something',
      description: 'You wake up with a scratchy throat and low energy. Might be nothing, might not.',
      choices: [
        { label: 'Rest and take it easy', outcome: 'You manage to shake it off quickly.', effect: { statsChange: { energy: -10, health: -5 } } },
        { label: 'Push through the day', outcome: 'Ignoring it makes it linger.', effect: { statsChange: { energy: -15, health: -10 } } },
      ],
    }),
  },
  {
    id: 'illness_clinic_queue', category: 'health', type: 'health', weight: 2, cooldownDays: 15,
    condition: (ctx) => ctx.state.stats.health < 60,
    build: () => ({
      title: '🏥 Long Clinic Queue',
      description: 'You decide to get checked out, but the local clinic has a long wait.',
      choices: [
        { label: 'Wait it out', outcome: 'A wasted day, but you get seen.', effect: { statsChange: { energy: -15, health: 10, stress: 5 } } },
        { label: 'Pay for a private doctor (R350)', outcome: 'Fast and effective.', effect: { cashChange: -350, statsChange: { health: 20 } } },
      ],
    }),
  },
  {
    id: 'illness_food_poisoning_risk', category: 'health', type: 'health', weight: 2, cooldownDays: 20,
    condition: (ctx) => ctx.state.stats.hunger < 30,
    build: () => ({
      title: '🍽️ Questionable Street Food',
      description: 'You\'re hungry and the food stall you\'re eyeing looks like it\'s been sitting out a while.',
      choices: [
        { label: 'Eat it anyway', outcome: 'Risky call — your stomach may regret it.', effect: { statsChange: { hunger: 30, health: -8 } } },
        { label: 'Hold out for something better', outcome: 'You stay hungry a while longer.', effect: { statsChange: { hunger: -5 } } },
      ],
    }),
  },
  {
    id: 'illness_stress_toll', category: 'health', type: 'health', weight: 2, cooldownDays: 15,
    condition: (ctx) => ctx.state.stats.stress > 70,
    build: () => ({
      title: '😮‍💨 Stress is Catching Up',
      description: 'Your body is starting to feel the effects of prolonged stress — headaches, tension, poor sleep.',
      choices: [
        { label: 'Take a rest day', outcome: 'You recover some balance.', effect: { statsChange: { stress: -20, energy: 10 } } },
        { label: 'Keep grinding', outcome: 'The toll deepens.', effect: { statsChange: { health: -8 } } },
      ],
    }),
  },
  {
    id: 'illness_recovers', category: 'health', type: 'health', weight: 3, cooldownDays: 5,
    condition: (ctx) => !!ctx.state.stats.sickness,
    build: (ctx) => ({
      title: '😌 Feeling Better',
      description: `Your ${ctx.state.stats.sickness ?? 'illness'} seems to be clearing up.`,
      choices: [
        { label: 'Good news', outcome: 'You\'re on the mend.', effect: { statsChange: { health: 10, happiness: 5 } } },
      ],
    }),
  },
];

// ══════════════════════════════════════════════════════════════════════════
// FESTIVALS / CEREMONY / WEDDING / FUNERAL / RELIGION / SPORTS
// ══════════════════════════════════════════════════════════════════════════
const FESTIVAL_EVENTS: EventTemplate[] = [
  {
    id: 'festival_local_fair', category: 'festival', type: 'festival', weight: 2, cooldownDays: 30,
    condition: () => true,
    build: () => ({
      title: '🎪 Local Festival',
      description: 'A community festival has taken over the area — music, food stalls, and a lively crowd.',
      choices: [
        { label: 'Join the celebration', outcome: 'A joyful, memorable day.', effect: { cashChange: -randInt(50, 150), statsChange: { happiness: 15, energy: -10 } } },
        { label: 'Stay home', outcome: 'You skip the noise and save your cash.', effect: {} },
      ],
    }),
  },
  {
    id: 'festival_heritage_day', category: 'festival', type: 'festival', weight: 1, cooldownDays: 60,
    condition: () => true,
    build: () => ({
      title: '🇿🇦 Heritage Celebration',
      description: 'The community comes together to celebrate heritage and tradition with food and dance.',
      choices: [
        { label: 'Take part', outcome: 'A proud, grounding experience.', effect: { statsChange: { happiness: 12, reputation: 3 } } },
      ],
    }),
  },
];

const CEREMONY_EVENTS: EventTemplate[] = [
  {
    id: 'ceremony_traditional', category: 'ceremony', type: 'ceremony', weight: 1, cooldownDays: 60,
    condition: () => true,
    build: () => ({
      title: '🔥 Traditional Ceremony',
      description: 'You\'re invited to a traditional ceremony — an important cultural obligation.',
      choices: [
        { label: 'Attend and contribute (R150)', outcome: 'You honour the tradition and strengthen ties.', effect: { cashChange: -150, statsChange: { reputation: 6, happiness: 8 } } },
        { label: 'Send apologies', outcome: 'Some may see it as a slight.', effect: { statsChange: { reputation: -3 } } },
      ],
    }),
  },
];

const WEDDING_EVENTS: EventTemplate[] = [
  {
    id: 'wedding_invite', category: 'wedding', type: 'wedding', weight: 1, cooldownDays: 60,
    condition: () => true,
    build: () => ({
      title: '💒 Wedding Invitation',
      description: 'You\'ve been invited to a friend\'s wedding — a big, joyful community event.',
      choices: [
        { label: 'Attend with a gift (R200)', outcome: 'A great day, well spent.', effect: { cashChange: -200, statsChange: { happiness: 12, reputation: 3 } } },
        { label: 'Send regrets', outcome: 'You save money, but miss out.', effect: { statsChange: { happiness: -3 } } },
      ],
    }),
  },
];

const FUNERAL_EVENTS: EventTemplate[] = [
  {
    id: 'funeral_attend', category: 'funeral', type: 'funeral', weight: 1, cooldownDays: 45,
    condition: () => true,
    build: () => ({
      title: '🕊️ A Funeral in the Community',
      description: 'A respected community member has passed. The funeral is this weekend, and attendance matters.',
      choices: [
        { label: 'Attend and contribute to costs (R150)', outcome: 'Your presence is noted and appreciated.', effect: { cashChange: -150, statsChange: { reputation: 5, stress: 5, happiness: -5 } } },
        { label: 'Send condolences only', outcome: 'A lighter gesture.', effect: { statsChange: { stress: 3 } } },
      ],
    }),
  },
];

const RELIGION_EVENTS: EventTemplate[] = [
  {
    id: 'religion_service', category: 'religion', type: 'religion', weight: 2, cooldownDays: 20,
    condition: () => true,
    build: () => ({
      title: '⛪ Sunday Service',
      description: 'A neighbour invites you along to a church/mosque/temple service and community gathering.',
      choices: [
        { label: 'Go along', outcome: 'A peaceful, grounding morning.', effect: { statsChange: { happiness: 8, stress: -10 } } },
        { label: 'Decline politely', outcome: 'No hard feelings.', effect: {} },
      ],
    }),
  },
];

const SPORTS_EVENTS: EventTemplate[] = [
  {
    id: 'sports_local_match', category: 'sports', type: 'sports', weight: 3, cooldownDays: 15,
    condition: () => true,
    build: () => ({
      title: '⚽ Local Match Day',
      description: 'The local soccer team has a big match today, and the whole community is buzzing.',
      choices: [
        { label: 'Go watch with friends', outcome: 'A fun, high-energy afternoon.', effect: { cashChange: -randInt(30, 80), statsChange: { happiness: 10 } } },
        { label: 'Skip it', outcome: 'You use the time elsewhere.', effect: {} },
      ],
    }),
  },
  {
    id: 'sports_join_team', category: 'sports', type: 'sports', weight: 2, cooldownDays: 30,
    condition: (ctx) => ctx.state.stats.fitness > 40,
    build: () => ({
      title: '🏃 Join the Local Team',
      description: 'A local amateur sports team is short a player and asks if you\'d like to join for the season.',
      choices: [
        { label: 'Join in', outcome: 'Good for fitness and friendships.', effect: { statsChange: { fitness: 5, happiness: 8, energy: -10 } } },
        { label: 'Not this season', outcome: 'Maybe next time.', effect: {} },
      ],
    }),
  },
];

// ══════════════════════════════════════════════════════════════════════════
// TAXI / VEHICLE / STRIKE
// ══════════════════════════════════════════════════════════════════════════
const TAXI_EVENTS: EventTemplate[] = [
  {
    id: 'taxi_strike', category: 'strike', type: 'strike', weight: 1, cooldownDays: 45,
    condition: () => true,
    build: () => ({
      title: '🚕 Taxi Strike',
      description: 'Minibus taxi associations have called a strike over route disputes. Getting around is much harder today.',
      choices: [
        { label: 'Find alternate transport (R100)', outcome: 'Costly, but you get where you need to go.', effect: { cashChange: -100, statsChange: { stress: 8 } } },
        { label: 'Stay home today', outcome: 'You lose the day but avoid the chaos.', effect: { statsChange: { happiness: -5 } } },
      ],
    }),
  },
  {
    id: 'taxi_overcrowded', category: 'taxi', type: 'taxi', weight: 3, cooldownDays: 8,
    condition: (ctx) => !hasVehicle(ctx),
    build: () => ({
      title: '🚐 Packed Taxi Ride',
      description: 'Your taxi to town is overcrowded and the driver takes it fast on rough roads.',
      choices: [
        { label: 'Grit your teeth and ride it out', outcome: 'You arrive rattled but on time.', effect: { statsChange: { stress: 8, energy: -5 } } },
      ],
    }),
  },
  {
    id: 'taxi_fare_hike', category: 'taxi', type: 'taxi', weight: 2, cooldownDays: 20,
    condition: (ctx) => !hasVehicle(ctx),
    build: () => ({
      title: '💸 Taxi Fares Increase',
      description: 'Fuel prices have gone up and taxi fares have followed.',
      choices: [
        { label: 'Pay the new fare', outcome: 'A small but ongoing extra cost.', effect: { cashChange: -randInt(10, 30) } },
      ],
    }),
  },
];

const VEHICLE_EVENTS: EventTemplate[] = [
  {
    id: 'vehicle_flat_tyre', category: 'vehicle', type: 'vehicle', weight: 3, cooldownDays: 12,
    condition: hasVehicle,
    build: (ctx) => ({
      title: '🛞 Flat Tyre',
      description: `Your ${randomVehicleType(ctx)} picked up a flat on a pothole-riddled road.`,
      choices: [
        { label: 'Fix it now (R120)', outcome: 'Back on the road quickly.', effect: { cashChange: -120, vehicleConditionChange: 5 } },
        { label: 'Limp along on the spare', outcome: 'Risky for the long term.', effect: { vehicleConditionChange: -10, statsChange: { stress: 5 } } },
      ],
    }),
  },
  {
    id: 'vehicle_theft_attempt', category: 'vehicle', type: 'vehicle', weight: 2, cooldownDays: 25,
    condition: (ctx) => hasVehicle(ctx) && highCrimeArea(ctx),
    build: (ctx) => ({
      title: '🔐 Attempted Vehicle Theft',
      description: `Someone tried to break into your ${randomVehicleType(ctx)} overnight but was scared off.`,
      choices: [
        { label: 'Install extra security (R300)', outcome: 'Peace of mind, for a price.', effect: { cashChange: -300, statsChange: { stress: -5 } } },
        { label: 'Just be more careful', outcome: 'Free, but risk remains.', effect: { statsChange: { stress: 10 } } },
      ],
    }),
  },
  {
    id: 'vehicle_good_service', category: 'vehicle', type: 'vehicle', weight: 2, cooldownDays: 20,
    condition: hasVehicle,
    build: (ctx) => ({
      title: '🔧 Overdue Service',
      description: `Your ${randomVehicleType(ctx)} is due for a proper service and checkup.`,
      choices: [
        { label: 'Get it serviced (R400)', outcome: 'Runs like new.', effect: { cashChange: -400, vehicleConditionChange: 25 } },
        { label: 'Put it off', outcome: 'Condition keeps slipping.', effect: { vehicleConditionChange: -8 } },
      ],
    }),
  },
  {
    id: 'vehicle_pothole_damage', category: 'vehicle', type: 'vehicle', weight: 2, cooldownDays: 15,
    condition: hasVehicle,
    build: () => ({
      title: '🕳️ Pothole Damage',
      description: 'A hidden pothole did a number on your suspension.',
      choices: [
        { label: 'Repair it (R350)', outcome: 'Fixed properly.', effect: { cashChange: -350, vehicleConditionChange: 10 } },
        { label: 'Ignore the noise', outcome: 'It\'ll get worse over time.', effect: { vehicleConditionChange: -12 } },
      ],
    }),
  },
];

// ══════════════════════════════════════════════════════════════════════════
// EMPLOYMENT / SCHOOL / UNIVERSITY
// ══════════════════════════════════════════════════════════════════════════
const EMPLOYMENT_EVENTS: EventTemplate[] = [
  {
    id: 'job_bonus', category: 'employment', type: 'employment', weight: 2, cooldownDays: 25,
    condition: hasJob,
    build: () => ({
      title: '💵 Surprise Bonus',
      description: 'Your hard work hasn\'t gone unnoticed — a small bonus lands in your pay.',
      choices: [
        { label: 'Nice', outcome: 'A pleasant surprise.', effect: { cashChange: randInt(150, 500), statsChange: { happiness: 8 } } },
      ],
    }),
  },
  {
    id: 'job_overtime_request', category: 'employment', type: 'employment', weight: 3, cooldownDays: 10,
    condition: hasJob,
    build: () => ({
      title: '⏰ Overtime Requested',
      description: 'Your boss asks if you can work extra hours this week — more pay, more fatigue.',
      choices: [
        { label: 'Take the overtime', outcome: 'Extra cash, extra tired.', effect: { cashChange: randInt(150, 350), statsChange: { energy: -20, stress: 10 } } },
        { label: 'Decline', outcome: 'You protect your rest.', effect: { statsChange: { energy: 5 } } },
      ],
    }),
  },
  {
    id: 'job_promotion_chance', category: 'employment', type: 'employment', weight: 1, cooldownDays: 40,
    condition: (ctx) => hasJob(ctx) && ctx.state.stats.discipline > 55,
    build: () => ({
      title: '📈 Promotion on the Table',
      description: 'Management is considering you for a step up — but it comes with more pressure.',
      choices: [
        { label: 'Go for it', outcome: 'You put yourself forward for the opportunity.', effect: { statsChange: { stress: 15, reputation: 8, happiness: 10 } } },
        { label: 'Not ready for more responsibility', outcome: 'You stay comfortable where you are.', effect: {} },
      ],
    }),
  },
  {
    id: 'job_layoff_scare', category: 'employment', type: 'employment', weight: 2, cooldownDays: 30,
    condition: hasJob,
    build: () => ({
      title: '⚠️ Layoff Rumours',
      description: 'Talk around the workplace is that budget cuts might mean layoffs soon.',
      choices: [
        { label: 'Start looking at backup options', outcome: 'Better safe than sorry.', effect: { statsChange: { stress: 10 } } },
        { label: 'Wait and see', outcome: 'You hope for the best.', effect: { statsChange: { stress: 15 } } },
      ],
    }),
  },
  {
    id: 'job_toxic_boss', category: 'employment', type: 'employment', weight: 2, cooldownDays: 15,
    condition: hasJob,
    build: () => ({
      title: '😤 Difficult Boss Day',
      description: 'Your boss is in a foul mood and takes it out on the whole team today.',
      choices: [
        { label: 'Keep your head down', outcome: 'You get through it quietly.', effect: { statsChange: { stress: 15 } } },
        { label: 'Push back respectfully', outcome: 'Risky, but you stand your ground.', effect: { statsChange: { stress: 20, reputation: 3 } } },
      ],
    }),
  },
];

const SCHOOL_EVENTS: EventTemplate[] = [
  {
    id: 'school_exam_pressure', category: 'school', type: 'education', weight: 2, cooldownDays: 20,
    condition: (ctx) => ctx.state.age < 20 && !!ctx.state.currentCourse,
    build: () => ({
      title: '📝 Exams Coming Up',
      description: 'A big exam is approaching and you\'re feeling the pressure to prepare.',
      choices: [
        { label: 'Study hard', outcome: 'Extra effort now pays off later.', effect: { statsChange: { intelligence: 4, stress: 12, energy: -10 } } },
        { label: 'Wing it', outcome: 'Risky, but you save your energy.', effect: { statsChange: { stress: 5 } } },
      ],
    }),
  },
  {
    id: 'school_peer_pressure', category: 'school', type: 'education', weight: 2, cooldownDays: 20,
    condition: (ctx) => ctx.state.age < 22,
    build: () => ({
      title: '👥 Peer Pressure',
      description: 'Classmates are pushing you to skip responsibilities and join them instead.',
      choices: [
        { label: 'Stay focused', outcome: 'You keep your priorities straight.', effect: { statsChange: { discipline: 4 } } },
        { label: 'Go along with it', outcome: 'Fun now, consequences later.', effect: { statsChange: { happiness: 8, discipline: -5, education: -3 } } },
      ],
    }),
  },
];

const UNIVERSITY_EVENTS: EventTemplate[] = [
  {
    id: 'university_scholarship_news', category: 'university', type: 'education', weight: 1, cooldownDays: 45,
    condition: (ctx) => !!ctx.state.currentCourse && ctx.state.currentCourse.institution === 'University',
    build: () => ({
      title: '🎓 Scholarship Opportunity',
      description: 'A merit-based scholarship application has opened for students with strong grades.',
      choices: [
        { label: 'Apply', outcome: 'Your effort in class starts to pay off.', effect: { statsChange: { stress: 8 }, cashChange: randInt(200, 800) } },
        { label: 'Not eligible / skip', outcome: 'You focus elsewhere.', effect: {} },
      ],
    }),
  },
  {
    id: 'university_group_project', category: 'university', type: 'education', weight: 2, cooldownDays: 20,
    condition: (ctx) => !!ctx.state.currentCourse && ctx.state.currentCourse.institution === 'University',
    build: () => ({
      title: '👨‍🎓 Group Project Drama',
      description: 'A group assignment is falling apart because a teammate isn\'t pulling their weight.',
      choices: [
        { label: 'Pick up the slack yourself', outcome: 'Exhausting, but the grade is protected.', effect: { statsChange: { energy: -15, education: 3, stress: 10 } } },
        { label: 'Report the issue', outcome: 'A fair, if awkward, resolution.', effect: { statsChange: { stress: 8 } } },
      ],
    }),
  },
];

// ══════════════════════════════════════════════════════════════════════════
// COMMUNITY / POLITICS / CORRUPTION / STRIKE / PROTEST / MEETING
// ══════════════════════════════════════════════════════════════════════════
const COMMUNITY_EVENTS: EventTemplate[] = [
  {
    id: 'community_cleanup', category: 'community', type: 'community', weight: 2, cooldownDays: 20,
    condition: () => true,
    build: () => ({
      title: '🧹 Community Cleanup Day',
      description: 'Neighbours are organizing a cleanup of the local area and inviting everyone to pitch in.',
      choices: [
        { label: 'Join in', outcome: 'A good community moment, if tiring.', effect: { statsChange: { reputation: 5, energy: -10, happiness: 5 } } },
        { label: 'Skip it', outcome: 'You keep your day free.', effect: {} },
      ],
    }),
  },
  {
    id: 'community_project', category: 'community', type: 'community', weight: 2, cooldownDays: 30,
    condition: () => true,
    build: () => ({
      title: '🏗️ Community Project Proposal',
      description: 'Residents are proposing a small community project (a garden, a crèche, a sports field) and asking for contributions.',
      choices: [
        { label: 'Contribute (R100)', outcome: 'You help make it happen.', effect: { cashChange: -100, statsChange: { reputation: 6, happiness: 5 } } },
        { label: 'Can\'t spare it right now', outcome: 'No judgement, but you sit this one out.', effect: {} },
      ],
    }),
  },
];

const MEETING_EVENTS: EventTemplate[] = [
  {
    id: 'meeting_community', category: 'meeting', type: 'meeting', weight: 2, cooldownDays: 20,
    condition: () => true,
    build: () => ({
      title: '🗳️ Community Meeting',
      description: 'A community meeting has been called to discuss local issues — service delivery, safety, development.',
      choices: [
        { label: 'Attend and speak up', outcome: 'Your voice is heard.', effect: { statsChange: { reputation: 5, stress: 5 } } },
        { label: 'Skip it', outcome: 'You let others decide.', effect: {} },
      ],
    }),
  },
];

const POLITICS_EVENTS: EventTemplate[] = [
  {
    id: 'politics_local_candidate', category: 'politics', type: 'politics', weight: 1, cooldownDays: 45,
    condition: () => true,
    build: () => ({
      title: '📢 Local Politician Visits',
      description: 'A local political candidate is campaigning in your area, making promises about development.',
      choices: [
        { label: 'Engage and ask questions', outcome: 'You make your concerns known.', effect: { statsChange: { reputation: 3 } } },
        { label: 'Ignore the noise', outcome: 'You\'ve heard promises before.', effect: {} },
      ],
    }),
  },
];

const CORRUPTION_EVENTS: EventTemplate[] = [
  {
    id: 'corruption_bribe_request', category: 'corruption', type: 'corruption', weight: 2, cooldownDays: 25,
    condition: () => true,
    build: () => ({
      title: '✋ A Palm Needs Greasing',
      description: 'An official hints that paperwork will "move faster" with a little something extra.',
      choices: [
        { label: 'Pay the bribe', outcome: 'Things move quickly, but it feels wrong.', effect: { cashChange: -randInt(100, 400), statsChange: { stress: 5, reputation: -3 } } },
        { label: 'Refuse and wait it out', outcome: 'Slower, but you keep your integrity.', effect: { statsChange: { stress: 10, reputation: 3 } } },
      ],
    }),
  },
  {
    id: 'corruption_witness', category: 'corruption', type: 'corruption', weight: 1, cooldownDays: 40,
    condition: () => true,
    build: () => ({
      title: '👁️ You Witness Corruption',
      description: 'You overhear a local official arranging a shady deal involving municipal funds.',
      choices: [
        { label: 'Report it anonymously', outcome: 'A risk, but it might do some good.', effect: { statsChange: { stress: 10, reputation: 4 } } },
        { label: 'Say nothing', outcome: 'Not your fight today.', effect: {} },
      ],
    }),
  },
];

const PROTEST_EVENTS: EventTemplate[] = [
  {
    id: 'protest_service_delivery', category: 'protest', type: 'protest', weight: 1, cooldownDays: 40,
    condition: () => true,
    build: () => ({
      title: '🔥 Service Delivery Protest',
      description: 'Residents have taken to the streets over ongoing water and electricity failures. Roads are blocked, tension is high.',
      choices: [
        { label: 'Join the protest', outcome: 'You add your voice, but it\'s risky.', effect: { statsChange: { reputation: 4, stress: 15 }, wantedLevelChange: 5 } },
        { label: 'Avoid the area entirely', outcome: 'You steer clear of the chaos.', effect: { statsChange: { stress: 5 } } },
      ],
    }),
  },
];

// ══════════════════════════════════════════════════════════════════════════
// GAMBLING / ALCOHOL / DRUGS
// ══════════════════════════════════════════════════════════════════════════
const GAMBLING_EVENTS: EventTemplate[] = [
  {
    id: 'gambling_dice_game', category: 'gambling', type: 'gambling', weight: 2, cooldownDays: 15,
    condition: (ctx) => ctx.state.cash > 50,
    build: () => {
      const won = Math.random() < 0.45;
      const amount = randInt(50, 300);
      return {
        title: '🎲 Street Dice Game',
        description: 'A group is running a dice game on the corner, inviting passersby to try their luck.',
        choices: [
          { label: `Bet R${amount}`, outcome: won ? 'Luck was on your side!' : 'The house wins this time.', effect: { cashChange: won ? amount : -amount, statsChange: { stress: won ? -5 : 8 } } },
          { label: 'Not today', outcome: 'You keep your money in your pocket.', effect: {} },
        ],
      };
    },
  },
  {
    id: 'gambling_lottery', category: 'gambling', type: 'gambling', weight: 2, cooldownDays: 15,
    condition: () => true,
    build: () => {
      const won = Math.random() < 0.1;
      return {
        title: '🎟️ National Lottery',
        description: 'The weekly lottery draw is tonight, and you\'re considering buying a ticket.',
        choices: [
          { label: 'Buy a ticket (R20)', outcome: won ? 'A small but real win!' : 'No luck this time.', effect: { cashChange: won ? randInt(200, 800) : -20 } },
          { label: 'Skip it', outcome: 'You save the R20.', effect: {} },
        ],
      };
    },
  },
  {
    id: 'gambling_addiction_check', category: 'gambling', type: 'gambling', weight: 1, cooldownDays: 30,
    condition: (ctx) => (ctx.state.stats.addictions ?? []).includes('gambling'),
    build: () => ({
      title: '🎰 The Urge to Gamble',
      description: 'The pull to bet again is strong today.',
      choices: [
        { label: 'Give in', outcome: 'A brief high, a real cost.', effect: { cashChange: -randInt(200, 600), statsChange: { stress: -5, happiness: -5 } } },
        { label: 'Resist', outcome: 'A hard, worthwhile choice.', effect: { statsChange: { discipline: 4, stress: 10 } } },
      ],
    }),
  },
];

const ALCOHOL_EVENTS: EventTemplate[] = [
  {
    id: 'alcohol_shebeen_invite', category: 'alcohol', type: 'alcohol', weight: 3, cooldownDays: 12,
    condition: () => true,
    build: () => ({
      title: '🍺 Shebeen Invite',
      description: 'Friends invite you for drinks at the local shebeen after a long week.',
      choices: [
        { label: 'Go and have a few', outcome: 'A good time, though you\'ll feel it tomorrow.', effect: { cashChange: -randInt(50, 150), statsChange: { happiness: 10, energy: -15, health: -3 } } },
        { label: 'Have just one and leave early', outcome: 'A balanced night out.', effect: { cashChange: -randInt(20, 50), statsChange: { happiness: 5 } } },
        { label: 'Decline entirely', outcome: 'You keep your night quiet.', effect: {} },
      ],
    }),
  },
  {
    id: 'alcohol_hangover', category: 'alcohol', type: 'alcohol', weight: 2, cooldownDays: 8,
    condition: (ctx) => ctx.state.stats.health < 70,
    build: () => ({
      title: '🥴 Rough Morning',
      description: 'Last night is catching up with you this morning.',
      choices: [
        { label: 'Push through', outcome: 'A slow, foggy start to the day.', effect: { statsChange: { energy: -15, health: -3 } } },
      ],
    }),
  },
  {
    id: 'alcohol_dependency_check', category: 'alcohol', type: 'alcohol', weight: 1, cooldownDays: 30,
    condition: (ctx) => (ctx.state.stats.addictions ?? []).includes('alcohol'),
    build: () => ({
      title: '🍷 The Bottle Calls',
      description: 'The craving for a drink is hard to ignore today.',
      choices: [
        { label: 'Have a drink', outcome: 'Temporary relief, lasting cost.', effect: { cashChange: -randInt(40, 120), statsChange: { happiness: 5, health: -5 } } },
        { label: 'Stay strong', outcome: 'A tough but healthy choice.', effect: { statsChange: { discipline: 4, stress: 8 } } },
      ],
    }),
  },
];

const DRUGS_EVENTS: EventTemplate[] = [
  {
    id: 'drugs_peer_offer', category: 'drugs', type: 'drugs', weight: 2, cooldownDays: 20,
    condition: (ctx) => highCrimeArea(ctx),
    build: () => ({
      title: '💊 Offered Something Stronger',
      description: 'At a gathering, someone offers you something a bit stronger than usual.',
      choices: [
        { label: 'Try it', outcome: 'A rush now, a risk down the line.', effect: { statsChange: { happiness: 10, health: -8, discipline: -5 } } },
        { label: 'Pass', outcome: 'You keep a clear head.', effect: { statsChange: { discipline: 3 } } },
      ],
    }),
  },
  {
    id: 'drugs_search_risk', category: 'drugs', type: 'drugs', weight: 2, cooldownDays: 20,
    condition: (ctx) => ctx.state.inventory.some(i => i.category === 'drug') && highCrimeArea(ctx),
    build: () => ({
      title: '🚨 Carrying Risk',
      description: 'You realize you\'re carrying items that would be very bad news if police stopped you right now.',
      choices: [
        { label: 'Get rid of it quickly', outcome: 'A loss, but you play it safe.', effect: { statsChange: { stress: 10 } } },
        { label: 'Keep it and hope for the best', outcome: 'You gamble on not getting caught.', effect: { wantedLevelChange: 10, statsChange: { stress: 15 } } },
      ],
    }),
  },
  {
    id: 'drugs_addiction_spiral', category: 'drugs', type: 'drugs', weight: 1, cooldownDays: 25,
    condition: (ctx) => (ctx.state.stats.addictions ?? []).length > 0,
    build: () => ({
      title: '🌀 The Addiction Speaks',
      description: 'The pull of addiction is strong today, clouding your judgement.',
      choices: [
        { label: 'Give in', outcome: 'The cycle continues.', effect: { cashChange: -randInt(150, 400), statsChange: { health: -10, happiness: 8 } } },
        { label: 'Reach out for help', outcome: 'A hard, important step.', effect: { statsChange: { stress: 15, discipline: 5 } } },
      ],
    }),
  },
];

// ══════════════════════════════════════════════════════════════════════════
// PROPERTY / FIRE / THEFT / MARKET / LOAD SHEDDING / WATER
// ══════════════════════════════════════════════════════════════════════════
const PROPERTY_EVENTS: EventTemplate[] = [
  {
    id: 'property_leak', category: 'property', type: 'property', weight: 2, cooldownDays: 15,
    condition: ownsProperty,
    build: () => ({
      title: '🚿 Plumbing Leak',
      description: 'A pipe has started leaking somewhere in your home.',
      choices: [
        { label: 'Call a plumber (R250)', outcome: 'Fixed properly and quickly.', effect: { cashChange: -250 } },
        { label: 'Patch it yourself', outcome: 'A temporary, imperfect fix.', effect: { statsChange: { energy: -10, stress: 5 } } },
      ],
    }),
  },
  {
    id: 'property_break_in', category: 'property', type: 'property', weight: 2, cooldownDays: 25,
    condition: (ctx) => ownsProperty(ctx) && highCrimeArea(ctx),
    build: () => ({
      title: '🔓 Attempted Break-In',
      description: 'Someone tried to break into your home while you were out — a window was forced but nothing major taken.',
      choices: [
        { label: 'Improve security (R400)', outcome: 'Peace of mind restored.', effect: { cashChange: -400, statsChange: { stress: -8 } } },
        { label: 'Just fix the window', outcome: 'A cheaper, riskier fix.', effect: { cashChange: -80, statsChange: { stress: 12 } } },
      ],
    }),
  },
  {
    id: 'property_neighbour_dispute', category: 'property', type: 'property', weight: 2, cooldownDays: 20,
    condition: ownsProperty,
    build: () => ({
      title: '🏘️ Boundary Dispute',
      description: 'A neighbour is disputing where your property line actually falls.',
      choices: [
        { label: 'Settle it amicably', outcome: 'A fair compromise reached.', effect: { statsChange: { stress: 8, reputation: 3 } } },
        { label: 'Stand your ground firmly', outcome: 'Tension lingers, but you don\'t budge.', effect: { statsChange: { stress: 15 } } },
      ],
    }),
  },
];

const FIRE_EVENTS: EventTemplate[] = [
  {
    id: 'fire_nearby', category: 'fire', type: 'fire', weight: 1, cooldownDays: 40,
    condition: (ctx) => ctx.state.location === 'Township' || ctx.state.location === 'Informal Settlement',
    build: () => ({
      title: '🔥 Fire Nearby',
      description: 'A shack fire has broken out a few streets away, and everyone is on edge.',
      choices: [
        { label: 'Help however you can', outcome: 'The community pulls together.', effect: { statsChange: { reputation: 6, stress: 15 } } },
        { label: 'Keep your distance', outcome: 'You stay safe but feel guilty.', effect: { statsChange: { stress: 10, happiness: -5 } } },
      ],
    }),
  },
  {
    id: 'fire_kitchen_scare', category: 'fire', type: 'fire', weight: 2, cooldownDays: 25,
    condition: ownsProperty,
    build: () => ({
      title: '🍳 Kitchen Fire Scare',
      description: 'A small kitchen fire breaks out but is put out quickly, leaving some damage.',
      choices: [
        { label: 'Repair the damage (R200)', outcome: 'Fixed up, lesson learned.', effect: { cashChange: -200, statsChange: { stress: 8 } } },
      ],
    }),
  },
];

const THEFT_EVENTS: EventTemplate[] = [
  {
    id: 'theft_pickpocket', category: 'theft', type: 'crime', weight: 3, cooldownDays: 10,
    condition: highCrimeArea,
    build: (ctx) => ({
      title: '👛 Pickpocketed',
      description: 'In a crowded market, someone lifted cash straight out of your pocket.',
      choices: [
        { label: 'Chase them', outcome: 'A risky sprint through the crowd.', effect: { statsChange: { energy: -10, stress: 10 } } },
        { label: 'Let it go', outcome: 'You cut your losses.', effect: { cashChange: -Math.min(ctx.state.cash, randInt(50, 200)), statsChange: { stress: 10 } } },
      ],
    }),
  },
  {
    id: 'theft_home_burglary', category: 'theft', type: 'crime', weight: 1, cooldownDays: 40,
    condition: (ctx) => ownsProperty(ctx) && highCrimeArea(ctx),
    build: () => ({
      title: '🏚️ Home Burglary',
      description: 'You come home to find your place has been broken into and some items are missing.',
      choices: [
        { label: 'Report to police and file insurance', outcome: 'A slow process, but proper channels.', effect: { statsChange: { stress: 15 }, cashChange: -randInt(200, 500) } },
        { label: 'Handle it yourself', outcome: 'You quietly absorb the loss.', effect: { cashChange: -randInt(300, 700), statsChange: { stress: 20 } } },
      ],
    }),
  },
];

const MARKET_EVENTS: EventTemplate[] = [
  {
    id: 'market_price_spike', category: 'market', type: 'random', weight: 2, cooldownDays: 15,
    condition: () => true,
    build: () => ({
      title: '📈 Prices Spiking',
      description: 'Fuel and food prices have jumped this week, tightening everyone\'s budget.',
      choices: [
        { label: 'Tighten your spending', outcome: 'A careful, disciplined response.', effect: { statsChange: { stress: 8, discipline: 3 } } },
        { label: 'Absorb the cost', outcome: 'Your budget takes a hit.', effect: { cashChange: -randInt(80, 250) } },
      ],
    }),
  },
  {
    id: 'market_good_deal', category: 'market', type: 'random', weight: 2, cooldownDays: 15,
    condition: () => true,
    build: () => ({
      title: '🏷️ Bargain Find',
      description: 'A market trader is clearing stock at unusually low prices.',
      choices: [
        { label: 'Stock up', outcome: 'Good value for money.', effect: { cashChange: -randInt(50, 150), statsChange: { happiness: 4 } } },
        { label: 'Skip it', outcome: 'Not needed right now.', effect: {} },
      ],
    }),
  },
];

const LOADSHEDDING_EVENTS: EventTemplate[] = [
  {
    id: 'loadshedding_hits', category: 'loadshedding', type: 'random', weight: 3, cooldownDays: 6,
    condition: () => true,
    build: () => ({
      title: '💡 Load Shedding',
      description: 'The power goes out for hours today, disrupting work, cooking, and business.',
      choices: [
        { label: 'Work around it', outcome: 'A frustrating but manageable inconvenience.', effect: { statsChange: { stress: 8 } } },
        { label: 'Buy candles/gas (R40)', outcome: 'A small cost eases the disruption.', effect: { cashChange: -40, statsChange: { stress: 3 } } },
      ],
    }),
  },
  {
    id: 'loadshedding_business_hit', category: 'loadshedding', type: 'business', weight: 2, cooldownDays: 10,
    condition: hasBusiness,
    build: (ctx) => ({
      title: '💡 Load Shedding Hits Business',
      description: `Extended power cuts disrupted operations at ${randomBusinessName(ctx)} today.`,
      choices: [
        { label: 'Absorb the loss', outcome: 'Frustrating, but there\'s little choice.', effect: { cashChange: -randInt(100, 300) } },
        { label: 'Invest in a generator (R800)', outcome: 'A costly but effective long-term fix.', effect: { cashChange: -800, businessReputationChange: 8 } },
      ],
    }),
  },
];

const WATER_EVENTS: EventTemplate[] = [
  {
    id: 'water_shortage', category: 'water', type: 'random', weight: 2, cooldownDays: 15,
    condition: () => true,
    build: () => ({
      title: '🚰 Water Shortage',
      description: 'Municipal water supply has been cut off in the area for maintenance, expected to last days.',
      choices: [
        { label: 'Buy water from a tanker (R60)', outcome: 'An added cost, but you get by.', effect: { cashChange: -60, statsChange: { hygiene: -5 } } },
        { label: 'Ration what you have', outcome: 'A tighter, less comfortable few days.', effect: { statsChange: { hygiene: -15, stress: 8 } } },
      ],
    }),
  },
];

// ══════════════════════════════════════════════════════════════════════════
// Assemble full library
// ══════════════════════════════════════════════════════════════════════════
export const EVENT_LIBRARY: EventTemplate[] = [
  ...CRIME_EVENTS, ...POLICE_EVENTS, ...BUSINESS_EVENTS, ...FAMILY_EVENTS,
  ...ROMANCE_EVENTS, ...FRIENDSHIP_EVENTS, ...NPC_EVENTS, ...FARMING_EVENTS,
  ...LIVESTOCK_EVENTS, ...WEATHER_EVENTS, ...ILLNESS_EVENTS, ...FESTIVAL_EVENTS,
  ...CEREMONY_EVENTS, ...WEDDING_EVENTS, ...FUNERAL_EVENTS, ...RELIGION_EVENTS,
  ...SPORTS_EVENTS, ...TAXI_EVENTS, ...VEHICLE_EVENTS, ...EMPLOYMENT_EVENTS,
  ...SCHOOL_EVENTS, ...UNIVERSITY_EVENTS, ...COMMUNITY_EVENTS, ...MEETING_EVENTS,
  ...POLITICS_EVENTS, ...CORRUPTION_EVENTS, ...PROTEST_EVENTS, ...GAMBLING_EVENTS,
  ...ALCOHOL_EVENTS, ...DRUGS_EVENTS, ...PROPERTY_EVENTS, ...FIRE_EVENTS,
  ...THEFT_EVENTS, ...MARKET_EVENTS, ...LOADSHEDDING_EVENTS, ...WATER_EVENTS,
];

// ─── Selection ──────────────────────────────────────────────────────────────
// Picks one eligible template (condition passes + not on cooldown), weighted by
// `weight`, and builds a ready-to-use GameEvent. Returns null if nothing fires.
export function selectEventFromLibrary(state: import('@/types/game').GameState): { event: GameEvent; templateId: string } | null {
  const season = getSeasonForDay(state.day);
  const ctx: EventContext = { state, season };
  const cooldowns = state.eventCooldowns ?? {};

  const eligible = EVENT_LIBRARY.filter((tmpl) => {
    const last = cooldowns[tmpl.id];
    if (last !== undefined && state.day - last < tmpl.cooldownDays) return false;
    try {
      return tmpl.condition(ctx);
    } catch {
      return false;
    }
  });

  if (eligible.length === 0) return null;

  const totalWeight = eligible.reduce((sum, t) => sum + t.weight, 0);
  let roll = Math.random() * totalWeight;
  let chosen: EventTemplate = eligible[0];
  for (const tmpl of eligible) {
    roll -= tmpl.weight;
    if (roll <= 0) {
      chosen = tmpl;
      break;
    }
  }

  let built;
  try {
    built = chosen.build(ctx);
  } catch {
    return null;
  }

  const event: GameEvent = {
    id: `${chosen.id}_${state.day}_${Math.random().toString(36).slice(2, 7)}`,
    title: built.title,
    description: built.description,
    type: chosen.type,
    category: chosen.category,
    choices: built.choices,
    day: state.day,
  };

  return { event, templateId: chosen.id };
}
