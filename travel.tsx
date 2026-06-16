import { View, Text, ScrollView, Pressable } from 'react-native';
import { useState } from 'react';
import { useGame } from '@/store/gameContext';
import { GameHeader } from '@/components/game/GameHeader';
import { formatMoney } from '@/lib/game/gameEngine';
import type { Location } from '@/types/game';

const LOCATION_INFO: Record<Location, {
  icon: string;
  description: string;
  features: string[];
  travelCost: number;
}> = {
  'Township':            { icon: '🏘️', description: 'Dense urban community. Spaza shops, hustle culture and strong community bonds.', features: ['Spaza shops', 'Township businesses', 'Community jobs', 'SASSA office'], travelCost: 50 },
  'City':                { icon: '🏙️', description: 'Financial and commercial hub. Corporate jobs, large businesses and high cost of living.', features: ['Corporate jobs', 'Financial services', 'Large businesses', 'Universities'], travelCost: 150 },
  'Suburb':              { icon: '🏡', description: 'Residential middle-class area. Better schools, lower crime and stable infrastructure.', features: ['Formal employment', 'Good schools', 'Shopping centres', 'Private healthcare'], travelCost: 120 },
  'Town':                { icon: '🏪', description: 'Small service town. A mix of formal jobs and informal trade in a quieter setting.', features: ['Government jobs', 'Retail trade', 'Light industry', 'Schools'], travelCost: 80 },
  'Village':             { icon: '🌿', description: 'Rural village. Low cost of living, strong tradition, limited formal employment.', features: ['Subsistence farming', 'Community work', 'Traditional leadership', 'Low cost of living'], travelCost: 100 },
  'Informal Settlement': { icon: '🏚️', description: 'Informal housing area. Very low cost of living but limited services and high crime risk.', features: ['Low rent', 'Spaza trade', 'Day labour', 'SASSA access'], travelCost: 30 },
  'Farm':                { icon: '🌾', description: 'Agricultural land. Ideal for crop farming, livestock and off-grid rural living.', features: ['Crop farming', 'Livestock keeping', 'Farm labour', 'Fresh produce'], travelCost: 100 },
};

const TRAVELABLE: Location[] = [
  'Township', 'City', 'Suburb', 'Town', 'Village', 'Informal Settlement', 'Farm',
];

export default function Travel() {
  const { state, dispatch } = useGame();
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!state?.gameStarted) return null;
  const { location, cash, vehicles } = state;
  const hasVehicle = vehicles.length > 0;

  function showFeedback(msg: string) {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  }

  function travelTo(dest: Location) {
    if (dest === location) { showFeedback('⚠️ You are already here.'); return; }
    const info = LOCATION_INFO[dest];
    const cost = hasVehicle ? 0 : info.travelCost;
    if (!hasVehicle && cash < cost) {
      showFeedback(`⚠️ Need ${formatMoney(cost)} for transport to ${dest}.`);
      return;
    }
    dispatch({ type: 'CHANGE_LOCATION', payload: dest });
    showFeedback(`✅ Moved to ${dest}.${cost > 0 ? ` Paid ${formatMoney(cost)}.` : ' Used your vehicle — free travel.'}`);
  }

  return (
    <View className="flex-1 bg-background">
      <GameHeader title="Travel" subtitle="Move between locations" />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View className="px-4 pt-4 pb-10">

          {feedback && (
            <View className="mb-4 p-3" style={{ backgroundColor: feedback.includes('✅') ? '#0D1A0D' : '#1A0A00', borderWidth: 1, borderColor: feedback.includes('✅') ? '#4CAF50' : '#FFB81C' }}>
              <Text className="text-sm" style={{ color: feedback.includes('✅') ? '#4CAF50' : '#FFB81C' }}>{feedback}</Text>
            </View>
          )}

          {/* Current location */}
          <View className="mb-5 p-4" style={{ borderWidth: 2, borderColor: '#FFB81C', backgroundColor: '#0D0A00' }}>
            <Text className="text-muted-foreground text-xs tracking-wider mb-1">CURRENT LOCATION</Text>
            <View className="flex-row items-center gap-3">
              <Text className="text-3xl">{LOCATION_INFO[location]?.icon ?? '📍'}</Text>
              <View className="flex-1">
                <Text className="text-foreground font-bold text-lg">{location}</Text>
                <Text className="text-muted-foreground text-xs">{LOCATION_INFO[location]?.description}</Text>
              </View>
            </View>
          </View>

          {/* Transport status */}
          <View className="mb-5 p-3 flex-row items-center gap-3"
            style={{ borderWidth: 1, borderColor: hasVehicle ? '#4CAF50' : '#333', backgroundColor: '#0D0D0D' }}>
            <Text className="text-lg">{hasVehicle ? '🚗' : '🚌'}</Text>
            <View className="flex-1">
              <Text className="text-foreground font-bold text-sm">
                {hasVehicle ? `Own vehicle (${vehicles[0].type})` : 'No personal vehicle'}
              </Text>
              <Text className="text-muted-foreground text-xs">
                {hasVehicle ? 'Travel between locations for free.' : 'Pay taxi/bus fares to travel.'}
              </Text>
            </View>
          </View>

          <Text className="text-muted-foreground text-xs tracking-wider mb-3">DESTINATIONS</Text>

          {TRAVELABLE.map(dest => {
            const info = LOCATION_INFO[dest];
            const isCurrent = dest === location;
            const travelCost = hasVehicle ? 0 : info.travelCost;
            const canAfford = hasVehicle || cash >= travelCost;

            return (
              <View key={dest} className="mb-3 p-4"
                style={{ borderWidth: isCurrent ? 2 : 1, borderColor: isCurrent ? '#FFB81C' : canAfford ? '#222' : '#1A0000', backgroundColor: '#0D0D0D' }}>
                <View className="flex-row items-start mb-2">
                  <Text className="text-2xl mr-3">{info.icon}</Text>
                  <View className="flex-1">
                    <View className="flex-row justify-between items-center mb-1">
                      <Text className="text-foreground font-bold text-sm">{dest}</Text>
                      {isCurrent ? (
                        <Text className="text-xs font-bold" style={{ color: '#FFB81C' }}>📍 HERE</Text>
                      ) : (
                        <Text className="font-bold text-sm" style={{ color: canAfford ? '#4CAF50' : '#E32636' }}>
                          {travelCost === 0 ? 'FREE' : formatMoney(travelCost)}
                        </Text>
                      )}
                    </View>
                    <Text className="text-muted-foreground text-xs mb-2">{info.description}</Text>
                    <View className="flex-row flex-wrap gap-1.5 mb-1">
                      {info.features.map(f => (
                        <Text key={f} className="text-xs px-2 py-0.5"
                          style={{ backgroundColor: '#0A0800', color: '#888', borderWidth: 1, borderColor: '#222' }}>
                          {f}
                        </Text>
                      ))}
                    </View>
                  </View>
                </View>

                {!isCurrent && (
                  <Pressable onPress={() => travelTo(dest)} className="py-2 items-center"
                    style={{ backgroundColor: canAfford ? '#FFB81C' : '#1A0000', opacity: canAfford ? 1 : 0.6 }}>
                    <Text className="font-bold text-sm" style={{ color: canAfford ? '#0D0D0D' : '#555' }}>
                      {canAfford
                        ? `TRAVEL TO ${dest.toUpperCase()}${travelCost > 0 ? ` — ${formatMoney(travelCost)}` : ' — FREE'}`
                        : `NEED ${formatMoney(travelCost - cash)} MORE`}
                    </Text>
                  </Pressable>
                )}
              </View>
            );
          })}

        </View>
      </ScrollView>
    </View>
  );
}
