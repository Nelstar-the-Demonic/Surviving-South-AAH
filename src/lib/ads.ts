// ─── Ads (Google Mobile Ads / AdMob) ───────────────────────────────────────
// Wraps react-native-google-mobile-ads for rewarded ads. Uses Google's
// official TEST ad unit IDs everywhere for now — these always serve a real
// (test) ad and are always safe to ship, but never earn revenue and never
// risk an AdMob policy violation for using real IDs before the app has a
// live store listing.
//
// TO GO LIVE LATER: once you have a real AdMob app + ad unit, replace
// REWARDED_AD_UNIT_ID below with your real unit ID, and set the real
// androidAppId in app.json's react-native-google-mobile-ads plugin config.
// Nothing else about the calling code (main.tsx etc.) needs to change.

import mobileAds, {
  RewardedAd,
  RewardedAdEventType,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

// Always TestIds for now — see note above.
const REWARDED_AD_UNIT_ID = TestIds.REWARDED;

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
      // Ads SDK failed to init (e.g. no network) — the app should keep
      // working normally, just without ads available right now.
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
    loadRewardedAd(); // try to have one ready for next time
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
    loadRewardedAd(); // preload the next one
  });

  rewardedAd.show();
}

export function isRewardedAdReady(): boolean {
  return isLoaded;
}
