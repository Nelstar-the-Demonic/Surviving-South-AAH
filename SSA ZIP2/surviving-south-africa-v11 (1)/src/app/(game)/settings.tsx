import { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useGame } from '@/store/gameContext';
import { GameHeader } from '@/components/game/GameHeader';
import { InfoCard } from '@/components/game/InfoCard';
import { GameButton } from '@/components/game/GameButton';
import { formatMoney } from '@/lib/game/gameEngine';

const LOCATIONS_LIST = [
  'Village', 'Township', 'Informal Settlement', 'Town', 'Suburb', 'City', 'Farm',
] as const;

export default function Settings() {
  const router = useRouter();
  const { state, dispatch } = useGame();
  const [bugText, setBugText] = useState('');
  const [bugCategory, setBugCategory] = useState<'crash' | 'balance' | 'gameplay' | 'ui' | 'other'>('gameplay');
  const [bugSent, setBugSent] = useState(false);

  if (!state?.gameStarted) return null;
  const { location, autoConsume, playerName, day } = state;

  function changeLocation(newLoc: typeof LOCATIONS_LIST[number]) {
    dispatch({ type: 'CHANGE_LOCATION', payload: newLoc });
  }

  function resetGame() {
    dispatch({ type: 'RESET_GAME' });
    router.replace('/');
  }

  function submitBug() {
    if (!bugText.trim()) return;
    dispatch({ type: 'SUBMIT_BUG_REPORT', payload: { description: bugText.trim(), category: bugCategory } });
    setBugText('');
    setBugSent(true);
    setTimeout(() => setBugSent(false), 3000);
  }

  return (
    <View className="flex-1 bg-background">
      <GameHeader title="Settings" subtitle="Game configuration" />

      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View className="px-4 pt-4 pb-10">

          {/* Current status */}
          <InfoCard accent>
            <Text className="text-foreground font-bold">{playerName}</Text>
            <Text className="text-muted-foreground text-sm">Day {day} · {location}</Text>
          </InfoCard>

          {/* Change Location */}
          <Text className="text-muted-foreground text-xs mb-2 mt-2 tracking-wider">TRAVEL / CHANGE LOCATION</Text>
          <InfoCard>
            <Text className="text-muted-foreground text-xs leading-5 mb-3">
              Moving to a new location changes your available jobs, businesses, shops, and events.
              Travel costs R50.
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {LOCATIONS_LIST.map(loc => (
                <Pressable
                  key={loc}
                  onPress={() => changeLocation(loc)}
                  className="px-3 py-2"
                  style={{
                    borderWidth: 1,
                    borderColor: location === loc ? '#FFB81C' : '#333',
                    backgroundColor: location === loc ? '#1A1400' : '#0D0D0D',
                  }}
                >
                  <Text
                    className="text-sm"
                    style={{ color: location === loc ? '#FFB81C' : '#888' }}
                  >
                    {location === loc ? '📍 ' : ''}{loc}
                  </Text>
                </Pressable>
              ))}
            </View>
          </InfoCard>

          {/* Auto-consume */}
          <Text className="text-muted-foreground text-xs mb-2 mt-2 tracking-wider">GAMEPLAY</Text>
          <InfoCard>
            <Pressable
              onPress={() => dispatch({ type: 'TOGGLE_AUTO_CONSUME' })}
              className="flex-row items-center justify-between"
            >
              <View className="flex-1">
                <Text className="text-foreground font-bold text-sm">Auto-Consume Meals</Text>
                <Text className="text-muted-foreground text-xs">
                  Automatically eat when hunger drops below {autoConsume.hungerThreshold}
                </Text>
              </View>
              <View
                className="w-14 h-7 items-center justify-center"
                style={{ backgroundColor: autoConsume.enabled ? '#4CAF50' : '#333' }}
              >
                <Text className="text-xs font-bold text-foreground">
                  {autoConsume.enabled ? 'ON' : 'OFF'}
                </Text>
              </View>
            </Pressable>
          </InfoCard>

          {/* Bug Report */}
          <Text className="text-muted-foreground text-xs mb-2 mt-4 tracking-wider">REPORT A BUG</Text>
          <View className="p-4" style={{ backgroundColor: '#0D0D0D', borderWidth: 1, borderColor: '#333' }}>
            <Text className="text-foreground font-bold text-sm mb-2">🐛 Submit Feedback</Text>
            <Text className="text-muted-foreground text-xs mb-3">
              Found a bug or balance issue? Let us know. Reports are stored locally and help improve the game.
            </Text>

            {/* Category selector */}
            <Text className="text-muted-foreground text-xs mb-1.5">Category:</Text>
            <View className="flex-row flex-wrap gap-2 mb-3">
              {(['crash', 'balance', 'gameplay', 'ui', 'other'] as const).map(cat => (
                <Pressable
                  key={cat}
                  onPress={() => setBugCategory(cat)}
                  className="px-3 py-1.5"
                  style={{
                    borderWidth: 1,
                    borderColor: bugCategory === cat ? '#FFB81C' : '#333',
                    backgroundColor: bugCategory === cat ? '#1A1400' : '#111',
                  }}
                >
                  <Text className="text-xs font-bold capitalize"
                    style={{ color: bugCategory === cat ? '#FFB81C' : '#666' }}>
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </View>

            <TextInput
              value={bugText}
              onChangeText={setBugText}
              placeholder="Describe the bug or issue..."
              placeholderTextColor="#555"
              multiline
              numberOfLines={4}
              style={{
                color: '#fff',
                backgroundColor: '#111',
                borderWidth: 1,
                borderColor: '#333',
                padding: 10,
                marginBottom: 12,
                fontSize: 13,
                textAlignVertical: 'top',
                minHeight: 80,
              }}
            />

            {bugSent && (
              <View className="mb-2 p-2" style={{ backgroundColor: '#0D1A0D', borderWidth: 1, borderColor: '#4CAF50' }}>
                <Text className="text-xs text-center" style={{ color: '#4CAF50' }}>
                  ✅ Report saved locally. Thank you for the feedback!
                </Text>
              </View>
            )}

            <Pressable
              onPress={submitBug}
              className="py-3 items-center"
              style={{ backgroundColor: bugText.trim() ? '#FFB81C' : '#222' }}
            >
              <Text className="font-bold text-sm"
                style={{ color: bugText.trim() ? '#0D0D0D' : '#555' }}>
                SUBMIT REPORT
              </Text>
            </Pressable>

            <Text className="text-xs text-muted-foreground mt-2 text-center">
              Reports stored: {(state.bugReports ?? []).length} · Game Day: {day}
            </Text>
          </View>

          {/* About */}
          <Text className="text-muted-foreground text-xs mb-2 mt-2 tracking-wider">ABOUT</Text>
          <InfoCard>
            <Text className="text-foreground font-bold mb-2">Surviving South Africa</Text>
            <Text className="text-muted-foreground text-xs leading-5">
              A realistic text-based life simulation. Navigate modern South African society,
              escape poverty, build wealth, study, work, farm, and survive.{'\n\n'}
              Every choice has consequences. Every system interconnects.
              There is no death — only consequences.
            </Text>
            <View className="mt-3 pt-3" style={{ borderTopWidth: 1, borderTopColor: '#222' }}>
              <Text className="text-muted-foreground text-xs">Version 1.0 · Single-player</Text>
            </View>
          </InfoCard>

          {/* Danger zone */}
          <Text className="text-muted-foreground text-xs mb-2 mt-4 tracking-wider">DANGER ZONE</Text>
          <View className="p-4" style={{ borderWidth: 1, borderColor: '#E32636', backgroundColor: '#1A0000' }}>
            <Text className="text-sm font-bold mb-1" style={{ color: '#E32636' }}>⚠️ Reset Game</Text>
            <Text className="text-muted-foreground text-xs mb-3">
              This will delete all progress and return to the main menu. This cannot be undone.
            </Text>
            <Pressable
              onPress={resetGame}
              className="py-3 items-center"
              style={{ borderWidth: 1, borderColor: '#E32636' }}
            >
              <Text style={{ color: '#E32636' }} className="font-bold text-sm">RESET ALL PROGRESS</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
