import type { AdRewardType, GameState } from '@/types/game';

export interface AdRewardDef {
  type: AdRewardType;
  title: string;
  description: string;
  icon: string;
  unlockDay: number;
  maxPerDay: number;
}

export const AD_REWARD_DEFS: AdRewardDef[] = [
  {
    type: 'extra_action',
    title: 'Extra Action',
    description: '+1 daily action. Maximum 2 bonus actions per day.',
    icon: '⚡',
    unlockDay: 1,
    maxPerDay: 2,
  },
  {
    type: 'cash_early',
    title: 'Early Game Support',
    description: '+R250 cash. Available days 1–90.',
    icon: '💵',
    unlockDay: 1,
    maxPerDay: 1,
  },
  {
    type: 'cash_mid',
    title: 'Mid Game Support',
    description: '+R1,000 cash.',
    icon: '💰',
    unlockDay: 91,
    maxPerDay: 1,
  },
  {
    type: 'cash_late',
    title: 'Late Game Support',
    description: '+R3,500 cash.',
    icon: '💎',
    unlockDay: 181,
    maxPerDay: 1,
  },
  {
    type: 'edu_boost',
    title: 'Study Boost',
    description: '+5 study points on active course.',
    icon: '📚',
    unlockDay: 1,
    maxPerDay: 1,
  },
  {
    type: 'farm_boost',
    title: 'Farm Boost',
    description: 'Advances crop growth by 3 days.',
    icon: '🌱',
    unlockDay: 1,
    maxPerDay: 1,
  },
  {
    type: 'biz_boost',
    title: 'Business Boost',
    description: '+5% income on all businesses for 1 day.',
    icon: '📈',
    unlockDay: 1,
    maxPerDay: 1,
  },
];

export function canClaimAdReward(state: GameState, type: AdRewardType): { canClaim: boolean; reason?: string } {
  const def = AD_REWARD_DEFS.find(d => d.type === type);
  if (!def) return { canClaim: false, reason: 'Unknown reward' };

  if (state.day < def.unlockDay) {
    return { canClaim: false, reason: `Unlocks on day ${def.unlockDay}` };
  }

  const adRewards = state.adRewards ?? { lastClaimedDay: {}, bonusActionsToday: 0 };
  const lastDay = adRewards.lastClaimedDay[type] ?? -1;

  if (type === 'extra_action') {
    const bonusToday = adRewards.bonusActionsToday ?? 0;
    if (bonusToday >= 2) return { canClaim: false, reason: 'Max 2 bonus actions per day' };
    return { canClaim: true };
  }

  if (lastDay === state.day) {
    return { canClaim: false, reason: 'Already claimed today' };
  }

  // Type-specific conditions
  if (type === 'cash_early' && state.day > 90) {
    return { canClaim: false, reason: 'Available days 1–90 only' };
  }
  if (type === 'edu_boost' && !state.currentCourse) {
    return { canClaim: false, reason: 'No active course enrolled' };
  }
  if (type === 'farm_boost' && state.cropPlots.filter(p => p.stage === 'growing').length === 0) {
    return { canClaim: false, reason: 'No growing crops' };
  }
  if (type === 'biz_boost' && state.businesses.length === 0) {
    return { canClaim: false, reason: 'No active businesses' };
  }

  return { canClaim: true };
}
