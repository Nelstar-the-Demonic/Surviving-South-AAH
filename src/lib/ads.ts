// ─── Ads (Google Mobile Ads / AdMob) ───────────────────────────────────────
// Wraps react-native-google-mobile-ads for rewarded ads.

import mobileAds, {
  RewardedAd,
  RewardedAdEventType,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

// Your real AdMob rewarded ad unit — ACTIVE. Real users watching this earns
// real revenue. Do not repeatedly watch/click it yourself for testing — that
// risks an invalid-traffic flag on the account. Genuine play is fine.
const REAL_REWARDED_AD_UNIT_ID = 'ca-app-pub-8730823359699825/5331730602';

const REWARDED_AD_UNIT_ID = REAL_REWARDED_AD_UNIT_ID;

let rewardedAd: RewardedAd | null = null;
let isLoaded = false;
let isInitialized = false;

function loadRewardedAd() {
  isLoaded = false;
  rewardedAd = RewardedAd.createForAdRequest(REWARDED_AD_UNIT_ID);

  rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
    isLoaded = true;
  });
  rewardedAd.addAdEventListener(AdEventType.ERROR, () => {
    isLoaded = false;
  });

  rewardedAd.load();
}

/** Call once, on app startup. */
export function initAds() {
  if (isInitialized) return;
  isInitialized = true;
  mobileAds()
    .initialize()
    .then(() => {
      loadRewardedAd();
    })
    .catch(() => {
      isInitialized = false;
    });
}

/**
 * Shows a rewarded ad if one is ready. Calls onEarned() only if the user
 * actually watched to completion. Calls onUnavailable() immediately (no ad
 * shown) if nothing is loaded yet — e.g. still loading, or offline.
 */
export function showRewardedAd(onEarned: () => void, onUnavailable?: () => void) {
  if (!rewardedAd || !isLoaded) {
    onUnavailable?.();
    loadRewardedAd();
    return;
  }

  const unsubscribeEarned = rewardedAd.addAdEventListener(
    RewardedAdEventType.EARNED_REWARD,
    () => {
      onEarned();
    }
  );
  const unsubscribeClosed = rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
    unsubscribeEarned();
    unsubscribeClosed();
    loadRewardedAd();
  });

  rewardedAd.show();
}

export function isRewardedAdReady(): boolean {
  return isLoaded;
}
