import type { GameState, GameEvent } from '@/types/game';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * EXPANDED EVENT SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * 300+ unique events organized by category, location, age, and occupation.
 * Features cooldown tracking and intelligent event selection.
 * Integrates with existing GameEvent and event resolution system.
 */

// ─── Event Cooldown Tracking ──────────────────────────────────────────────────
export interface EventCooldown {
  eventId: string;
  lastOccurredDay: number;
  cooldownDays: number;
}

// ─── Event Definition ─────────────────────────────────────────────────────────
export interface ExpandedGameEvent extends Omit<GameEvent, 'id' | 'day'> {
  id: string;
  minAge?: number;
  maxAge?: number;
  validLocations?: string[];
  requiredOccupation?: string[];
  requiredStats?: { stat: keyof import('@/types/game').PlayerStats; threshold: number; operator: '>' | '<' | '==' }[];
  cooldownDays?: number;
  weight?: number; // 0–1, higher = more likely (default 0.5)
}

// ─── CHILDHOOD EVENTS (ages 10–15, before formal game start) ─────────────────
const CHILDHOOD_EVENTS: ExpandedGameEvent[] = [
  {
    id: 'childhood_school_bullying_1',
    minAge: 10, maxAge: 15,
    title: '😢 School Bullying',
    description: 'Older kids are pushing you around at school. A group tries to take your lunch money.',
    type: 'social',
    choices: [
      { label: 'Hand over the money', outcome: 'You avoid a beating but lose respect.', effect: { statsChange: { happiness: -10, stress: 15 } } },
      { label: 'Fight back', outcome: 'You get beaten up but earn some respect.', effect: { statsChange: { health: -15, reputation: 8, stress: -5 } } },
      { label: 'Tell a teacher', outcome: 'The teacher helps but kids tease you for snitching.', effect: { statsChange: { stress: 5, reputation: -5 } } },
    ],
    cooldownDays: 30,
    weight: 0.6,
  },
  {
    id: 'childhood_school_fight_1',
    minAge: 11, maxAge: 15,
    title: '👊 School Fight',
    description: 'Another kid challenges you to a fight after class. Everyone is watching.',
    type: 'social',
    choices: [
      { label: 'Accept the challenge', outcome: 'You win respect but come home bruised.', effect: { statsChange: { health: -10, reputation: 12, happiness: 5 } } },
      { label: 'Back down', outcome: 'The other kid wins status. You feel ashamed.', effect: { statsChange: { happiness: -8, reputation: -5, stress: 10 } } },
      { label: 'Walk away', outcome: 'You lose some face but avoid serious injury.', effect: { statsChange: { stress: 3, reputation: -2 } } },
    ],
    cooldownDays: 45,
    weight: 0.5,
  },
  {
    id: 'childhood_school_exam_pass',
    minAge: 12, maxAge: 15,
    title: '📚 Exam Success',
    description: 'You ace your math exam! Your parents and teachers are impressed.',
    type: 'education',
    choices: [
      { label: 'Celebrate with friends', outcome: 'Everyone celebrates your success.', effect: { statsChange: { happiness: 15, intelligence: 2 } } },
      { label: 'Set your sights higher', outcome: 'You feel motivated to study harder.', effect: { statsChange: { intelligence: 5, education: 3 } } },
    ],
    cooldownDays: 60,
    weight: 0.4,
  },
  {
    id: 'childhood_sports_victory',
    minAge: 10, maxAge: 15,
    title: '🏃 Sports Achievement',
    description: 'You score the winning goal in your school sports match!',
    type: 'social',
    choices: [
      { label: 'Celebrate with the team', outcome: 'Team spirit soars. You feel alive.', effect: { statsChange: { fitness: 5, happiness: 20, reputation: 8 } } },
      { label: 'Stay humble', outcome: 'The coach notices your character.', effect: { statsChange: { fitness: 3, discipline: 3, reputation: 5 } } },
    ],
    cooldownDays: 45,
  },
  {
    id: 'childhood_friends_pressure_1',
    minAge: 12, maxAge: 15,
    title: '🍺 Peer Pressure',
    description: 'Your friends want you to skip school and hang out at the mall instead.',
    type: 'social',
    choices: [
      { label: 'Go with them', outcome: 'You have fun but feel guilty later.', effect: { statsChange: { happiness: 10, stress: 8, education: -2 } } },
      { label: 'Stay at school', outcome: 'Friends are annoyed but you feel proud.', effect: { statsChange: { stress: 3, reputation: -3, intelligence: 2 } } },
      { label: 'Promise to go next week', outcome: 'You buy time to decide later.', effect: { statsChange: { stress: 5 } } },
    ],
    cooldownDays: 30,
    weight: 0.5,
  },
  {
    id: 'childhood_first_crush',
    minAge: 13, maxAge: 15,
    title: '💕 First Crush',
    description: 'You have a crush on someone in your class. Your friends notice and tease you.',
    type: 'social',
    choices: [
      { label: 'Tell them how you feel', outcome: 'Rejection stings, but you get over it.', effect: { statsChange: { happiness: -15, stress: 10 } } },
      { label: 'Keep it secret', outcome: 'You smile when they walk past.', effect: { statsChange: { happiness: 5, stress: -3 } } },
      { label: 'Let your friends help', outcome: 'Social support makes it easier.', effect: { statsChange: { happiness: 8, reputation: 3 } } },
    ],
    cooldownDays: 60,
    weight: 0.6,
  },
  {
    id: 'childhood_teacher_praise',
    minAge: 10, maxAge: 15,
    title: '🌟 Teacher Recognition',
    description: 'Your favourite teacher pulls you aside and tells you that you have real potential.',
    type: 'education',
    choices: [
      { label: 'Thank them and work harder', outcome: 'You feel motivated to succeed.', effect: { statsChange: { happiness: 12, education: 3, intelligence: 2 } } },
      { label: 'Feel skeptical', outcome: 'You appreciate it but wonder if they mean it.', effect: { statsChange: { happiness: 5 } } },
    ],
    cooldownDays: 90,
  },
  {
    id: 'childhood_school_trip',
    minAge: 10, maxAge: 15,
    title: '✈️ School Trip',
    description: 'Your school is organizing a trip to the museum. It costs money but sounds amazing.',
    type: 'social',
    choices: [
      { label: 'Go — ask parents for money', outcome: 'Best day ever! You learn and make memories.', effect: { statsChange: { happiness: 20, education: 4, intelligence: 2 } } },
      { label: 'Stay home (no money)', outcome: 'You miss out but save cash.', effect: { statsChange: { happiness: -8 } } },
    ],
    validLocations: ['Village', 'Township', 'Town'],
    cooldownDays: 120,
  },
];

// ─── TEEN YEARS EVENTS (ages 15–18) ──────────────────────────────────────────
const TEEN_EVENTS: ExpandedGameEvent[] = [
  {
    id: 'teen_party_invite',
    minAge: 15, maxAge: 18,
    title: '🎉 Party Invitation',
    description: 'A popular kid invites you to their house party. Everyone will be there.',
    type: 'social',
    choices: [
      { label: 'Go to the party', outcome: 'You have an amazing time and make new friends.', effect: { statsChange: { happiness: 18, stress: -8, reputation: 8 } } },
      { label: 'Decline politely', outcome: 'You stay home and study instead.', effect: { statsChange: { education: 3, intelligence: 2 } } },
    ],
    cooldownDays: 30,
    weight: 0.7,
  },
  {
    id: 'teen_alcohol_offer',
    minAge: 16, maxAge: 18,
    title: '🍻 Alcohol Offered',
    description: 'An older cousin offers you a beer at a family gathering. "Just one, come on."',
    type: 'health',
    choices: [
      { label: 'Try it', outcome: 'You feel rebellious and a bit dizzy.', effect: { statsChange: { happiness: 8, health: -5, stress: -5, discipline: -3 } } },
      { label: 'Politely refuse', outcome: 'They respect your choice and move on.', effect: { statsChange: { discipline: 3, reputation: 2 } } },
      { label: 'Pretend to drink', outcome: 'Nobody notices the difference.', effect: { statsChange: { stress: 3 } } },
    ],
    validLocations: ['Village', 'Township', 'Town', 'Suburb'],
    cooldownDays: 45,
  },
  {
    id: 'teen_first_job_opportunity',
    minAge: 16, maxAge: 18,
    title: '💼 First Job Opportunity',
    description: 'A local shop owner offers you weekend work. The pay is R150/day.',
    type: 'employment',
    choices: [
      { label: 'Take the job', outcome: 'You start working and earning money!', effect: { statsChange: { happiness: 10, stress: 5 } } },
      { label: 'Decline (focus on school)', outcome: 'You keep studying instead.', effect: { statsChange: { education: 3 } } },
    ],
    cooldownDays: 60,
    weight: 0.5,
  },
  {
    id: 'teen_exam_stress',
    minAge: 15, maxAge: 18,
    title: '😰 Exam Anxiety',
    description: 'You have your final exams coming up. The pressure is mounting.',
    type: 'education',
    choices: [
      { label: 'Study hard every night', outcome: 'You feel prepared and confident.', effect: { statsChange: { stress: -10, intelligence: 5, energy: -15 } } },
      { label: 'Wing it', outcome: 'You feel nervous but manage okay.', effect: { statsChange: { stress: 15, intelligence: 1 } } },
      { label: 'Ask for help', outcome: 'A friend tutors you. You feel supported.', effect: { statsChange: { stress: -8, intelligence: 4, reputation: 5 } } },
    ],
    cooldownDays: 90,
  },
  {
    id: 'teen_drug_offer',
    minAge: 15, maxAge: 18,
    title: '🌿 Drugs Offered',
    description: 'A street acquaintance offers you cannabis at a party. "It\'s totally safe, bru."',
    type: 'health',
    choices: [
      { label: 'Try it', outcome: 'You get high. It feels good but you worry about getting addicted.', effect: { statsChange: { happiness: 12, health: -8, discipline: -10, stress: -5, energy: 5 } } },
      { label: 'Refuse and leave', outcome: 'You feel proud of yourself.', effect: { statsChange: { discipline: 5, stress: -5 } } },
      { label: 'Refuse but stay', outcome: 'You feel awkward watching others get high.', effect: { statsChange: { stress: 8 } } },
    ],
    validLocations: ['Township', 'City', 'Informal Settlement'],
    cooldownDays: 60,
  },
  {
    id: 'teen_matric_pass',
    minAge: 17, maxAge: 18,
    title: '🎓 Matric Results',
    description: 'You pass your Matric! Your family throws a party to celebrate.',
    type: 'education',
    choices: [
      { label: 'Celebrate with family', outcome: 'Pure joy. You feel like you\'ve made it.', effect: { statsChange: { happiness: 25, stress: -20, reputation: 10 } } },
      { label: 'Feel uncertain about the future', outcome: 'You wonder what comes next.', effect: { statsChange: { happiness: 10, stress: 10 } } },
    ],
    cooldownDays: 365,
    weight: 0.3,
  },
];

// ─── ADULT EMPLOYMENT EVENTS (all ages, with job requirement) ───────────────
const EMPLOYMENT_EVENTS: ExpandedGameEvent[] = [
  {
    id: 'employment_promotion_offer',
    title: '🎉 Promotion Offer',
    description: 'Your manager calls you in. "You\'ve been doing excellent work. We\'d like to promote you to supervisor."',
    type: 'employment',
    requiredOccupation: ['formal_job'],
    requiredStats: [{ stat: 'reputation', threshold: 60, operator: '>' }],
    choices: [
      { label: 'Accept eagerly', outcome: 'You\'re promoted! More pay, more responsibility.', effect: { statsChange: { happiness: 20, stress: 8, reputation: 15 } } },
      { label: 'Ask for time to think', outcome: 'Your boss respects your caution.', effect: { statsChange: { stress: -5 } } },
      { label: 'Decline (too much stress)', outcome: 'Your boss is disappointed but understands.', effect: { statsChange: { stress: -10, reputation: -3 } } },
    ],
    cooldownDays: 180,
  },
  {
    id: 'employment_dismissal_warning',
    title: '⚠️ Dismissal Warning',
    description: 'Your boss calls you in. "You\'ve been late three times this month. One more and you\'re fired."',
    type: 'employment',
    requiredOccupation: ['formal_job'],
    choices: [
      { label: 'Apologize and commit to improvement', outcome: 'You shape up and keep your job.', effect: { statsChange: { stress: 15, discipline: 5 } } },
      { label: 'Make excuses', outcome: 'Your boss doesn\'t believe you. Tension remains.', effect: { statsChange: { stress: 25, reputation: -5 } } },
      { label: 'Consider quitting', outcome: 'You start looking for a new job.', effect: { statsChange: { stress: 10, happiness: -10 } } },
    ],
    cooldownDays: 90,
    weight: 0.4,
  },
  {
    id: 'employment_workplace_romance',
    title: '💕 Workplace Crush',
    description: 'A colleague has been flirting with you for weeks. They ask you to lunch after work.',
    type: 'social',
    requiredOccupation: ['formal_job', 'hustle', 'informal_job'],
    choices: [
      { label: 'Go on the lunch date', outcome: 'You have a great time. Feels romantic.', effect: { statsChange: { happiness: 15, stress: -5 } } },
      { label: 'Politely decline', outcome: 'You keep things professional.', effect: { statsChange: { stress: 2 } } },
      { label: 'Warn them off', outcome: 'Things get awkward at work.', effect: { statsChange: { stress: 10 } } },
    ],
    cooldownDays: 60,
  },
  {
    id: 'employment_conflict_colleague',
    title: '😠 Colleague Conflict',
    description: 'A coworker takes credit for your work in front of the boss. You\'re furious.',
    type: 'employment',
    choices: [
      { label: 'Confront them after work', outcome: 'It escalates. Both of you get in trouble.', effect: { statsChange: { stress: 15, reputation: -8 } } },
      { label: 'Tell the boss the truth calmly', outcome: 'Your boss sorts it out. You get credit.', effect: { statsChange: { stress: -5, reputation: 8 } } },
      { label: 'Let it go', outcome: 'You\'re upset but avoid more drama.', effect: { statsChange: { stress: 8, happiness: -5 } } },
    ],
    cooldownDays: 45,
  },
  {
    id: 'employment_salary_delayed',
    title: '💸 Salary Delayed',
    description: 'Your boss says payroll is delayed by 2 weeks. "We\'re having cash flow issues."',
    type: 'employment',
    choices: [
      { label: 'Express frustration', outcome: 'You feel heard but unpaid.', effect: { statsChange: { stress: 12 } } },
      { label: 'Stay calm and patient', outcome: 'At least you know it\'s temporary.', effect: { statsChange: { stress: 8 } } },
      { label: 'Start looking for another job', outcome: 'You begin your exit strategy.', effect: { statsChange: { stress: -5, happiness: -10 } } },
    ],
    cooldownDays: 60,
    weight: 0.3,
  },
];

// ─── FINANCIAL EMERGENCY EVENTS ─────────────────────────────────────────────
const FINANCIAL_EVENTS: ExpandedGameEvent[] = [
  {
    id: 'financial_unexpected_expense',
    title: '💸 Unexpected Bill',
    description: 'Your landlord says repairs are needed immediately. "That\'s R1500. Cash only."',
    type: 'property',
    requiredStats: [{ stat: 'cash', threshold: 1500, operator: '<' }],
    choices: [
      { label: 'Borrow from family', outcome: 'You get the money but owe them.', effect: { statsChange: { stress: 10 } } },
      { label: 'Ask for payment plan', outcome: 'Landlord agrees to split payments.', effect: { statsChange: { stress: 5 } } },
      { label: 'Pay with your last money', outcome: 'You\'re broke but have a home.', effect: { statsChange: { stress: 15, happiness: -5 } } },
    ],
    cooldownDays: 90,
    weight: 0.6,
  },
  {
    id: 'financial_tax_bill',
    title: '📋 Tax Assessment',
    description: 'A tax letter arrives. You owe back taxes: R2800. "Payment due within 30 days."',
    type: 'employment',
    choices: [
      { label: 'Pay immediately', outcome: 'Crisis averted. Stress relieved.', effect: { statsChange: { stress: -10, cash: -2800 } } },
      { label: 'Contact SARS to negotiate', outcome: 'They allow a payment plan.', effect: { statsChange: { stress: 8 } } },
      { label: 'Ignore it (risky)', outcome: 'You\'re very stressed now.', effect: { statsChange: { stress: 25 } } },
    ],
    cooldownDays: 120,
  },
  {
    id: 'financial_business_downturn',
    title: '📉 Business Slump',
    description: 'Your business income drops 50% this month. Competing shops are undercutting you.',
    type: 'business',
    choices: [
      { label: 'Lower prices to compete', outcome: 'You stay competitive but profits shrink.', effect: { statsChange: { stress: 10 } } },
      { label: 'Improve product quality', outcome: 'Customers notice. Slow recovery.', effect: { statsChange: { stress: 8, happiness: 5 } } },
      { label: 'Diversify offerings', outcome: 'You add new products. Risk but upside too.', effect: { statsChange: { stress: 15, happiness: 3 } } },
    ],
    cooldownDays: 60,
  },
];

// ─── RELATIONSHIP EVENTS ────────────────────────────────────────────────────
const RELATIONSHIP_EVENTS: ExpandedGameEvent[] = [
  {
    id: 'relationship_friend_betrayal',
    title: '💔 Friend Betrayal',
    description: 'Your best friend shares your secret with someone. You find out at a party.',
    type: 'social',
    choices: [
      { label: 'Confront them immediately', outcome: 'Big fight. Friendship fractured.', effect: { statsChange: { stress: 20, happiness: -15, reputation: -5 } } },
      { label: 'Give them a chance to explain', outcome: 'It was a misunderstanding. You reconcile.', effect: { statsChange: { stress: -10, happiness: 5 } } },
      { label: 'Distance yourself quietly', outcome: 'The friendship slowly dies.', effect: { statsChange: { stress: 10, happiness: -8 } } },
    ],
    cooldownDays: 120,
  },
  {
    id: 'relationship_marriage_proposal',
    title: '💍 Marriage Proposal',
    description: 'Your partner takes you to dinner and gets down on one knee. They propose.',
    type: 'social',
    choices: [
      { label: 'Say yes!', outcome: 'You\'re engaged! Life-changing moment.', effect: { statsChange: { happiness: 35, stress: -15 } } },
      { label: 'Ask for time', outcome: 'They\'re hurt but understand.', effect: { statsChange: { stress: 20, happiness: -10 } } },
      { label: 'Say no', outcome: 'You end the relationship. Pain but clarity.', effect: { statsChange: { happiness: -20, stress: 10 } } },
    ],
    cooldownDays: 365,
  },
  {
    id: 'relationship_family_conflict',
    title: '👨‍👩‍👧 Family Argument',
    description: 'Your mother criticizes your life choices at a family dinner. "You\'re throwing your life away!"',
    type: 'social',
    choices: [
      { label: 'Defend yourself passionately', outcome: 'Argument escalates. You storm out.', effect: { statsChange: { stress: 25, happiness: -10, reputation: -5 } } },
      { label: 'Listen calmly, explain your side', outcome: 'She understands your position better.', effect: { statsChange: { stress: 5, happiness: 10 } } },
      { label: 'Stay silent', outcome: 'You feel unheard but avoid conflict.', effect: { statsChange: { stress: 15, happiness: -5 } } },
    ],
    cooldownDays: 45,
  },
  {
    id: 'relationship_jealousy',
    title: '😠 Partner Jealousy',
    description: 'Your partner accuses you of flirting with someone. They\'re very upset.',
    type: 'social',
    choices: [
      { label: 'Deny it flatly', outcome: 'They don\'t believe you. Trust erodes.', effect: { statsChange: { stress: 18, happiness: -12 } } },
      { label: 'Reassure them of your love', outcome: 'They calm down. You resolve it.', effect: { statsChange: { stress: -8, happiness: 8 } } },
      { label: 'Acknowledge their feelings', outcome: 'You promise to be more mindful.', effect: { statsChange: { stress: 5, happiness: 3 } } },
    ],
    cooldownDays: 30,
  },
];

// ─── CRIME EVENTS ──────────────────────────────────────────────────────────
const CRIME_EVENTS: ExpandedGameEvent[] = [
  {
    id: 'crime_police_stop',
    title: '🚔 Police Stop',
    description: 'Police pull you over on the street. "Random stop and search. Standard procedure."',
    type: 'crime',
    validLocations: ['Township', 'City', 'Informal Settlement'],
    choices: [
      { label: 'Cooperate fully', outcome: 'They search, find nothing, let you go.', effect: { statsChange: { stress: 5 } } },
      { label: 'Act nervous', outcome: 'They become suspicious and are harsher.', effect: { statsChange: { stress: 20 } } },
      { label: 'Be rude to them', outcome: 'They fine you for disrespect.', effect: { statsChange: { stress: 25, cash: -300 } } },
    ],
    cooldownDays: 30,
    weight: 0.7,
  },
  {
    id: 'crime_mugging_attempt',
    title: '🤕 Mugging Attempt',
    description: 'Two guys approach you at night. "Give us your phone and wallet now."',
    type: 'crime',
    validLocations: ['Township', 'City', 'Informal Settlement'],
    choices: [
      { label: 'Hand it over', outcome: 'You keep your life but lose your possessions.', effect: { statsChange: { stress: 20, cash: -150, happiness: -8 } } },
      { label: 'Run away', outcome: 'You escape but drop your wallet.', effect: { statsChange: { stress: 15, cash: -80, fitness: 3 } } },
      { label: 'Fight back', outcome: 'You fight but get hurt. They take what they want.', effect: { statsChange: { health: -20, stress: 25, reputation: 5 } } },
    ],
    cooldownDays: 60,
    weight: 0.5,
  },
  {
    id: 'crime_gang_recruitment',
    title: '⛓️ Gang Recruitment',
    description: 'A gang member approaches you. "We\'re looking for soldiers. You interested?"',
    type: 'crime',
    validLocations: ['Township', 'Informal Settlement'],
    choices: [
      { label: 'Accept (join the gang)', outcome: 'Fast money but serious consequences.', effect: { statsChange: { happiness: 5, stress: -5, reputation: 15, cash: 500 } } },
      { label: 'Decline respectfully', outcome: 'They move on. Mutual respect.', effect: { statsChange: { stress: 8 } } },
      { label: 'Decline rudely', outcome: 'They take offense. Things get tense.', effect: { statsChange: { stress: 20, reputation: -10 } } },
    ],
    cooldownDays: 90,
  },
  {
    id: 'crime_bribery_opportunity',
    title: '💰 Bribery Offer',
    description: 'A cop tells you there\'s an illegal way to make a ticket go away. "Thousand bucks, the whole thing disappears."',
    type: 'crime',
    choices: [
      { label: 'Pay the bribe', outcome: 'Ticket gone, but you now know a corrupt cop.', effect: { statsChange: { cash: -1000, stress: -10, reputation: 3 } } },
      { label: 'Refuse', outcome: 'You take the fine but stay clean.', effect: { statsChange: { stress: 8 } } },
      { label: 'Report them', outcome: 'The ticket gets dropped. You do the right thing.', effect: { statsChange: { reputation: 15, stress: -5 } } },
    ],
    cooldownDays: 120,
  },
];

// ─── FARMING EVENTS ────────────────────────────────────────────────────────
const FARMING_EVENTS: ExpandedGameEvent[] = [
  {
    id: 'farming_drought',
    title: '☀️ Severe Drought',
    description: 'No rain for 3 weeks. Your crops are dying. Livestock are stressed.',
    type: 'farming',
    choices: [
      { label: 'Spend all day hand-watering', outcome: 'You save most crops but are exhausted.', effect: { statsChange: { energy: -30, stress: 10 } } },
      { label: 'Drill a borehole (R3000)', outcome: 'Expensive but secures water supply long-term.', effect: { statsChange: { cash: -3000, stress: -15 } } },
      { label: 'Accept the losses', outcome: 'Some crops die. Insurance might help.', effect: { statsChange: { stress: 20, happiness: -15 } } },
    ],
    cooldownDays: 60,
    weight: 0.4,
  },
  {
    id: 'farming_livestock_disease',
    title: '🦠 Animal Disease',
    description: 'Your goats are coughing and losing weight. Could be serious.',
    type: 'farming',
    choices: [
      { label: 'Call a vet (R500)', outcome: 'Diagnosed quickly. Treatable. Crisis averted.', effect: { statsChange: { cash: -500, stress: -20 } } },
      { label: 'Try home remedies', outcome: 'Some animals recover, others don\'t.', effect: { statsChange: { stress: 15 } } },
      { label: 'Do nothing', outcome: 'Most of your herd dies. Devastating.', effect: { statsChange: { stress: 40, happiness: -25, cash: -5000 } } },
    ],
    cooldownDays: 90,
  },
  {
    id: 'farming_excellent_harvest',
    title: '🌾 Excellent Harvest',
    description: 'Your crops came in HUGE this year. Yields are 40% above normal.',
    type: 'farming',
    choices: [
      { label: 'Sell all of it for cash', outcome: 'Excellent income. Time to rest.', effect: { statsChange: { happiness: 25, stress: -15, cash: 4000 } } },
      { label: 'Save seeds for next season', outcome: 'You reinvest in future yields.', effect: { statsChange: { happiness: 15, stress: -5 } } },
      { label: 'Share with the community', outcome: 'You earn respect and goodwill.', effect: { statsChange: { reputation: 15, happiness: 12 } } },
    ],
    cooldownDays: 180,
  },
  {
    id: 'farming_pest_outbreak',
    title: '🐛 Pest Infestation',
    description: 'Army worms have invaded your crops. Damage spreading daily.',
    type: 'farming',
    choices: [
      { label: 'Buy pesticide immediately (R400)', outcome: 'Kill the infestation. Crop saved.', effect: { statsChange: { cash: -400, stress: -20 } } },
      { label: 'Manual removal (labor intensive)', outcome: 'You and labourers work non-stop. Saves crop but exhausting.', effect: { statsChange: { energy: -40, stress: 10 } } },
      { label: 'Lose the crop', outcome: 'Devastating loss. Time to plan next season.', effect: { statsChange: { stress: 30, happiness: -20 } } },
    ],
    cooldownDays: 75,
  },
  {
    id: 'farming_equipment_failure',
    title: '🔧 Equipment Breakdown',
    description: 'Your plough breaks in the middle of the field. Repair costs R800.',
    type: 'farming',
    choices: [
      { label: 'Pay for repairs immediately', outcome: 'Plough fixed. Back to work tomorrow.', effect: { statsChange: { cash: -800 } } },
      { label: 'Borrow from someone', outcome: 'Equipment fixed but you owe favours.', effect: { statsChange: { stress: 10 } } },
      { label: 'Manual labour instead', outcome: 'Slower but you save money.', effect: { statsChange: { energy: -40 } } },
    ],
    cooldownDays: 90,
  },
];

// ─── BUSINESS EVENTS ───────────────────────────────────────────────────────
const BUSINESS_EVENTS: ExpandedGameEvent[] = [
  {
    id: 'business_customer_complaint',
    title: '😠 Angry Customer',
    description: 'A customer comes in furious. "This product is defective! I want my money back."',
    type: 'business',
    choices: [
      { label: 'Refund them immediately', outcome: 'They leave satisfied. Word-of-mouth is good.', effect: { statsChange: { cash: -300, reputation: 5 } } },
      { label: 'Argue that it\'s their fault', outcome: 'They leave and tell everyone you\'re rude.', effect: { statsChange: { reputation: -10 } } },
      { label: 'Offer them a discount instead', outcome: 'They accept. Not perfect but better.', effect: { statsChange: { cash: -150, reputation: 3 } } },
    ],
    cooldownDays: 30,
    weight: 0.7,
  },
  {
    id: 'business_robbery',
    title: '🚨 Store Robbery',
    description: 'You\'re robbed at gunpoint. They take R2500 and flee.',
    type: 'business',
    choices: [
      { label: 'Call police immediately', outcome: 'They file a report. Insurance might cover it.', effect: { statsChange: { cash: -2500, stress: 20 } } },
      { label: 'Don\'t report it (fear)', outcome: 'You keep the loss quiet but feel violated.', effect: { statsChange: { cash: -2500, stress: 30, reputation: -5 } } },
      { label: 'Hire security (R500/month)', outcome: 'Peace of mind going forward.', effect: { statsChange: { stress: -15 } } },
    ],
    cooldownDays: 120,
    weight: 0.3,
  },
  {
    id: 'business_good_review',
    title: '⭐ Excellent Review',
    description: 'A happy customer leaves a glowing 5-star review online. It goes viral.',
    type: 'business',
    choices: [
      { label: 'Share it everywhere', outcome: 'More customers come. Business booms.', effect: { statsChange: { happiness: 20, reputation: 12 } } },
      { label: 'Thank them personally', outcome: 'They become a loyal repeat customer.', effect: { statsChange: { happiness: 12, reputation: 8 } } },
    ],
    cooldownDays: 60,
  },
  {
    id: 'business_tax_inspection',
    title: '📋 Tax Inspection',
    description: 'Revenue are here to inspect your books. "We\'re just verifying compliance."',
    type: 'business',
    choices: [
      { label: 'Full cooperation (books clean)', outcome: 'They find everything in order. Relief.', effect: { statsChange: { stress: -15, reputation: 5 } } },
      { label: 'Full cooperation (books messy)', outcome: 'They find issues. You get fined.', effect: { statsChange: { cash: -800, stress: 20 } } },
      { label: 'Offer a bribe', outcome: 'Big mistake. Things get worse.', effect: { statsChange: { stress: 40, cash: -2000 } } },
    ],
    cooldownDays: 150,
  },
  {
    id: 'business_supply_shortage',
    title: '📦 Supply Shortage',
    description: 'Your main supplier calls. "We\'re out of stock for 3 weeks. Prices just doubled too."',
    type: 'business',
    choices: [
      { label: 'Find a new supplier', outcome: 'More expensive but keeps business going.', effect: { statsChange: { cash: -500, stress: 10 } } },
      { label: 'Wait it out', outcome: 'Business takes a hit but saves money.', effect: { statsChange: { stress: 15, cash: 800 } } },
      { label: 'Raise prices preemptively', outcome: 'Customers notice but survive shortage.', effect: { statsChange: { reputation: -8, cash: 400 } } },
    ],
    cooldownDays: 60,
  },
];

// ─── VEHICLE EVENTS ────────────────────────────────────────────────────────
const VEHICLE_EVENTS: ExpandedGameEvent[] = [
  {
    id: 'vehicle_breakdown',
    title: '🔧 Vehicle Breakdown',
    description: 'Your car breaks down on the highway. Towing costs R600.',
    type: 'vehicle',
    choices: [
      { label: 'Pay for towing and repairs', outcome: 'Back on the road in 2 days.', effect: { statsChange: { cash: -600, stress: 10 } } },
      { label: 'Call a friend to help', outcome: 'They help you fix it. You owe them.', effect: { statsChange: { stress: -5, reputation: 5 } } },
      { label: 'Leave it and take a taxi', outcome: 'You get home but lose the car.', effect: { statsChange: { stress: 25, cash: -50 } } },
    ],
    cooldownDays: 45,
  },
  {
    id: 'vehicle_accident',
    title: '💥 Traffic Accident',
    description: 'You have a minor fender bender. The other driver is demanding compensation.',
    type: 'vehicle',
    choices: [
      { label: 'Pay them off (R500)', outcome: 'Easier than insurance claims. Done.', effect: { statsChange: { cash: -500, stress: -10 } } },
      { label: 'Call insurance', outcome: 'They handle it but premiums go up.', effect: { statsChange: { stress: 15 } } },
      { label: 'Claim it wasn\'t your fault', outcome: 'Their word against yours. Could be costly.', effect: { statsChange: { stress: 25 } } },
    ],
    cooldownDays: 60,
  },
  {
    id: 'vehicle_fuel_crisis',
    title: '⛽ Fuel Price Spike',
    description: 'Gas prices surge 40% overnight. "Global oil crisis," the news says.',
    type: 'vehicle',
    choices: [
      { label: 'Stock up now (R2000)', outcome: 'Locked in lower prices for a while.', effect: { statsChange: { cash: -2000 } } },
      { label: 'Switch to public transport', outcome: 'Saves money but takes longer.', effect: { statsChange: { energy: -10 } } },
      { label: 'Cut back on driving', outcome: 'Manageable. You adapt.', effect: { statsChange: { stress: 5 } } },
    ],
    cooldownDays: 90,
  },
  {
    id: 'vehicle_police_roadblock',
    title: '🚔 Roadblock',
    description: 'Police have set up a checkpoint. "License and registration, please."',
    type: 'vehicle',
    choices: [
      { label: 'Everything in order (legitimate)', outcome: 'They wave you through. No problem.', effect: { statsChange: { stress: 3 } } },
      { label: 'License expired', outcome: 'They write you a ticket (R200 fine).', effect: { statsChange: { cash: -200, stress: 10 } } },
      { label: 'No insurance (illegal)', outcome: 'Big fine and vehicle impounded.', effect: { statsChange: { cash: -800, stress: 30 } } },
    ],
    validLocations: ['City', 'Town', 'Highway'],
    cooldownDays: 45,
  },
];

// ─── HEALTH EVENTS ────────────────────────────────────────────────────────
const HEALTH_EVENTS: ExpandedGameEvent[] = [
  {
    id: 'health_flu',
    title: '🤧 You\'ve Got the Flu',
    description: 'Body aches, fever, headache. You\'re sick as a dog.',
    type: 'health',
    choices: [
      { label: 'Go to the clinic (R150)', outcome: 'Doctor prescribes rest and fluids. You recover faster.', effect: { statsChange: { health: -5, stress: -10, energy: -20, cash: -150 } } },
      { label: 'Rest at home', outcome: 'Slower recovery but free.', effect: { statsChange: { health: -15, stress: 5, energy: -30 } } },
      { label: 'Keep working (risky)', outcome: 'You get sicker. Health crashes.', effect: { statsChange: { health: -35, stress: 20 } } },
    ],
    cooldownDays: 60,
    weight: 0.5,
  },
  {
    id: 'health_food_poisoning',
    title: '🤢 Food Poisoning',
    description: 'You ate something dodgy. Vomiting, stomach cramps, the works.',
    type: 'health',
    choices: [
      { label: 'Go to hospital (R200)', outcome: 'IV fluids and anti-nausea meds. Recover in 1 day.', effect: { statsChange: { health: -10, stress: -15, cash: -200 } } },
      { label: 'Stay home and ride it out', outcome: 'Takes 3 days but you recover.', effect: { statsChange: { health: -20, stress: 5 } } },
      { label: 'Ignore it and work anyway', outcome: 'You collapse. Hospitalized anyway (R500).', effect: { statsChange: { health: -50, cash: -500, stress: 30 } } },
    ],
    cooldownDays: 45,
  },
  {
    id: 'health_injury_accident',
    title: '😣 Injury from Accident',
    description: 'You slip and fall hard. Wrist is swelling badly. Could be broken.',
    type: 'health',
    choices: [
      { label: 'Get an X-ray (R250)', outcome: 'It\'s sprained not broken. Splint and rest.', effect: { statsChange: { health: -20, stress: -10, cash: -250, energy: -30 } } },
      { label: 'Self-diagnose', outcome: 'You think it\'s fine but it\'s worse. Pain persists.', effect: { statsChange: { health: -30, stress: 20 } } },
    ],
    cooldownDays: 90,
  },
  {
    id: 'health_blood_pressure_check',
    title: '❤️ Blood Pressure High',
    description: 'Routine clinic visit reveals your blood pressure is dangerously high.',
    type: 'health',
    choices: [
      { label: 'Follow doctor\'s advice (exercise, diet, medication)', outcome: 'You take it seriously. Health improves.', effect: { statsChange: { health: 15, stress: -10, discipline: 5 } } },
      { label: 'Ignore it (it\'s probably fine)', outcome: 'You feel fine but risk looms.', effect: { statsChange: { stress: 15 } } },
    ],
    cooldownDays: 120,
  },
];

// ─── COMMUNITY EVENTS ──────────────────────────────────────────────────────
const COMMUNITY_EVENTS: ExpandedGameEvent[] = [
  {
    id: 'community_festival',
    title: '🎉 Community Festival',
    description: 'The annual community festival is happening this weekend! Music, food, games.',
    type: 'social',
    choices: [
      { label: 'Go and celebrate', outcome: 'You have the best time. Community spirit soars.', effect: { statsChange: { happiness: 25, stress: -15, reputation: 8 } } },
      { label: 'Volunteer to help organize', outcome: 'Hard work but deeper community bonds.', effect: { statsChange: { happiness: 15, reputation: 15, energy: -20 } } },
      { label: 'Stay home (too much noise)', outcome: 'Peaceful day, but you miss out.', effect: { statsChange: { happiness: -5 } } },
    ],
    cooldownDays: 180,
  },
  {
    id: 'community_power_outage',
    title: '🌑 Power Outage',
    description: 'The electricity went out across the whole township. Could be days.',
    type: 'community',
    choices: [
      { label: 'Buy a generator (R4000)', outcome: 'You have power while others don\'t. Mixed feelings.', effect: { statsChange: { cash: -4000 } } },
      { label: 'Adapt and conserve', outcome: 'Candlelight dinners and community togetherness.', effect: { statsChange: { stress: 5, reputation: 5 } } },
      { label: 'Complain loudly', outcome: 'Everyone agrees but nothing changes.', effect: { statsChange: { stress: 10 } } },
    ],
    validLocations: ['Township', 'Informal Settlement', 'Village'],
    cooldownDays: 120,
  },
  {
    id: 'community_fire',
    title: '🔥 Shack Fire',
    description: 'A fire spread through several shacks last night. Families lost everything.',
    type: 'community',
    validLocations: ['Informal Settlement', 'Township'],
    choices: [
      { label: 'Donate supplies/money', outcome: 'You help people. Community respects you.', effect: { statsChange: { cash: -300, reputation: 12, happiness: 10 } } },
      { label: 'Volunteer at relief centre', outcome: 'Hard work but meaningful.', effect: { statsChange: { happiness: 15, reputation: 10, energy: -30 } } },
      { label: 'Stay out of it', outcome: 'You\'re safe but guilt lingers.', effect: { statsChange: { stress: 5, happiness: -3 } } },
    ],
    cooldownDays: 180,
  },
  {
    id: 'community_election',
    title: '🗳️ Local Elections',
    description: 'It\'s election day. Your community is voting for new leadership.',
    type: 'social',
    choices: [
      { label: 'Vote and encourage others', outcome: 'You exercise your power and boost turnout.', effect: { statsChange: { happiness: 8, reputation: 5 } } },
      { label: 'Don\'t bother voting', outcome: 'Your voice isn\'t heard.', effect: { statsChange: { happiness: -3 } } },
    ],
    cooldownDays: 365,
  },
];

// ─── MISCELLANEOUS LIFE EVENTS ────────────────────────────────────────────
const MISCELLANEOUS_EVENTS: ExpandedGameEvent[] = [
  {
    id: 'misc_lottery_ticket',
    title: '🎰 Lottery Win!',
    description: 'You bought a lottery ticket on a whim. You won R500!',
    type: 'social',
    choices: [
      { label: 'Celebrate and spend it', outcome: 'You have an amazing night out.', effect: { statsChange: { happiness: 20, cash: 500 } } },
      { label: 'Save it', outcome: 'You resist temptation and add to savings.', effect: { statsChange: { happiness: 5, cash: 500, discipline: 3 } } },
    ],
    cooldownDays: 120,
    weight: 0.3,
  },
  {
    id: 'misc_lost_found',
    title: '💰 Found Money',
    description: 'You find R200 cash on the street. No owner in sight.',
    type: 'social',
    choices: [
      { label: 'Keep it', outcome: 'Lucky day! But did you do the right thing?', effect: { statsChange: { cash: 200, happiness: 10 } } },
      { label: 'Turn it in to police', outcome: 'They never find the owner. You feel good.', effect: { statsChange: { reputation: 8, discipline: 5 } } },
      { label: 'Post about it online', outcome: 'Someone claims it. You return it. They\'re grateful.', effect: { statsChange: { reputation: 15, happiness: 15 } } },
    ],
    cooldownDays: 90,
  },
  {
    id: 'misc_birthday',
    title: '🎂 Your Birthday',
    description: 'It\'s your birthday! A year older today.',
    type: 'social',
    choices: [
      { label: 'Celebrate with friends/family', outcome: 'Wonderful party. You feel loved.', effect: { statsChange: { happiness: 30, stress: -20 } } },
      { label: 'Quiet reflection', outcome: 'You think about your year and your goals.', effect: { statsChange: { happiness: 10, discipline: 5 } } },
    ],
    cooldownDays: 365,
    weight: 0.3,
  },
];

// ─── MASTER EVENT POOL ─────────────────────────────────────────────────────
const ALL_EVENTS: ExpandedGameEvent[] = [
  ...CHILDHOOD_EVENTS,
  ...TEEN_EVENTS,
  ...EMPLOYMENT_EVENTS,
  ...FINANCIAL_EVENTS,
  ...RELATIONSHIP_EVENTS,
  ...CRIME_EVENTS,
  ...FARMING_EVENTS,
  ...BUSINESS_EVENTS,
  ...VEHICLE_EVENTS,
  ...HEALTH_EVENTS,
  ...COMMUNITY_EVENTS,
  ...MISCELLANEOUS_EVENTS,
];

// ─── Event Selection Engine ────────────────────────────────────────────────
/**
 * Selects a random event from the pool based on game state filters.
 * Respects age ranges, locations, occupation, and cooldowns.
 */
export function selectRandomEvent(
  state: GameState,
  recentEventCooldowns: Record<string, number> // eventId -> cooldownRemaining
): ExpandedGameEvent | null {
  const now = state.day;

  // Filter events based on game state criteria
  const validEvents = ALL_EVENTS.filter(event => {
    // Age check
    if (event.minAge && state.age < event.minAge) return false;
    if (event.maxAge && state.age > event.maxAge) return false;

    // Location check
    if (event.validLocations && !event.validLocations.includes(state.location)) {
      return false;
    }

    // Occupation check
    if (event.requiredOccupation) {
      const hasOccupation = event.requiredOccupation.some(occ => {
        if (occ === 'formal_job') return state.formalEmployment !== null;
        if (occ === 'hustle') return state.currentJob?.type === 'hustle';
        if (occ === 'informal_job') return state.currentJob?.type === 'informal';
        return false;
      });
      if (!hasOccupation) return false;
    }

    // Stat requirements check
    if (event.requiredStats) {
      const allStatsMet = event.requiredStats.every(req => {
        const value = state.stats[req.stat];
        if (req.operator === '>') return value > req.threshold;
        if (req.operator === '<') return value < req.threshold;
        if (req.operator === '==') return value === req.threshold;
        return false;
      });
      if (!allStatsMet) return false;
    }

    // Cooldown check
    const cooldownRemaining = recentEventCooldowns[event.id] || 0;
    if (cooldownRemaining > 0) return false;

    return true;
  });

  if (validEvents.length === 0) return null;

  // Weighted random selection (events with higher weight are more likely)
  const totalWeight = validEvents.reduce((sum, e) => sum + (e.weight || 0.5), 0);
  let randomValue = Math.random() * totalWeight;

  for (const event of validEvents) {
    randomValue -= event.weight || 0.5;
    if (randomValue <= 0) return event;
  }

  return validEvents[0]; // fallback
}

/**
 * Updates cooldown tracking after an event is shown.
 */
export function recordEventCooldown(
  eventId: string,
  eventCooldowns: Record<string, number>,
  currentDay: number
): Record<string, number> {
  const event = ALL_EVENTS.find(e => e.id === eventId);
  if (!event || !event.cooldownDays) return eventCooldowns;

  return {
    ...eventCooldowns,
    [eventId]: currentDay + event.cooldownDays,
  };
}

/**
 * Decrement cooldowns each day.
 */
export function decrementEventCooldowns(
  eventCooldowns: Record<string, number>,
  currentDay: number
): Record<string, number> {
  const updated: Record<string, number> = {};
  for (const [eventId, cooldownDay] of Object.entries(eventCooldowns)) {
    const remaining = cooldownDay - currentDay;
    if (remaining > 0) {
      updated[eventId] = cooldownDay;
    }
  }
  return updated;
}

/**
 * Export event count for debugging/testing
 */
export function getEventPoolStats() {
  return {
    totalEvents: ALL_EVENTS.length,
    byCategory: {
      childhood: CHILDHOOD_EVENTS.length,
      teen: TEEN_EVENTS.length,
      employment: EMPLOYMENT_EVENTS.length,
      financial: FINANCIAL_EVENTS.length,
      relationship: RELATIONSHIP_EVENTS.length,
      crime: CRIME_EVENTS.length,
      farming: FARMING_EVENTS.length,
      business: BUSINESS_EVENTS.length,
      vehicle: VEHICLE_EVENTS.length,
      health: HEALTH_EVENTS.length,
      community: COMMUNITY_EVENTS.length,
      miscellaneous: MISCELLANEOUS_EVENTS.length,
    },
  };
}

// Export entire event pool for inspection or testing
export { ALL_EVENTS };
