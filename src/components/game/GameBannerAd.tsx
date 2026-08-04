// ─── Banner Ad ──────────────────────────────────────────────────────────────
import { useState } from 'react';
import { View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

// Your real banner ad unit — ACTIVE.
const BANNER_AD_UNIT_ID = 'ca-app-pub-8730823359699825/1392485599';

export function GameBannerAd() {
  const [failed, setFailed] = useState(false);
  if (failed) return null; // no ad, no broken gap in the layout

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%' }}>
      <BannerAd
        unitId={BANNER_AD_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
}
