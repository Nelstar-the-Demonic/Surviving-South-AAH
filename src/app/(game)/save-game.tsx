import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useGame } from '@/store/gameContext';
import { GameHeader } from '@/components/game/GameHeader';
import { InfoCard } from '@/components/game/InfoCard';
import { formatMoney } from '@/lib/game/gameEngine';

export default function SaveGame() {
  const router = useRouter();
  const { state, saveGame, loadGame, hasSaveInSlot, getSaveSlotMeta, deleteSave } = useGame();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<number | null>(null);

  if (!state?.gameStarted) return null;
  const { day, playerName, cash, location, inventory, properties, vehicles, businesses } = state;

  function showFeedback(msg: string) {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  }

  async function handleSave(slot: number) {
    await saveGame(slot);
    setConfirming(null);
    showFeedback(`✅ Game saved to Slot ${slot + 1}.`);
  }

  async function handleLoad(slot: number) {
    const ok = await loadGame(slot);
    if (ok) {
      showFeedback(`✅ Slot ${slot + 1} loaded.`);
      setTimeout(() => router.replace('/(game)/main'), 800);
    } else {
      showFeedback('❌ Failed to load save. File may be corrupted.');
    }
  }

  async function handleDelete(slot: number) {
    await deleteSave(slot);
    setConfirming(null);
    showFeedback(`🗑️ Slot ${slot + 1} deleted.`);
  }

  return (
    <View className="flex-1 bg-background">
      <GameHeader title="Save Game" subtitle="Manual save slots" />

      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View className="px-4 pt-4 pb-10">

          {feedback && (
            <View className="mb-4 p-3" style={{
              backgroundColor: feedback.includes('✅') ? '#0D1A0D' : feedback.includes('❌') ? '#1A0000' : '#1A1400',
              borderWidth: 1,
              borderColor: feedback.includes('✅') ? '#4CAF50' : feedback.includes('❌') ? '#E32636' : '#FFB81C',
            }}>
              <Text className="text-sm" style={{ color: feedback.includes('✅') ? '#4CAF50' : feedback.includes('❌') ? '#E32636' : '#FFB81C' }}>
                {feedback}
              </Text>
            </View>
          )}

          <InfoCard>
            <Text className="text-muted-foreground text-xs leading-5">
              💾 The game auto-saves every time you end a day.{'\n'}
              Use manual slots to keep milestone saves — before a big purchase, crime run, or business launch.
            </Text>
          </InfoCard>

          {/* Current game snapshot */}
          <View className="mb-6 p-4" style={{ backgroundColor: '#0D0A00', borderWidth: 2, borderColor: '#FFB81C' }}>
            <Text className="text-muted-foreground text-xs tracking-wider mb-1">CURRENT SESSION</Text>
            <Text className="text-foreground font-bold text-base">{playerName}</Text>
            <Text className="text-muted-foreground text-sm">{location} · Day {day}</Text>
            <View className="flex-row flex-wrap gap-4 mt-2">
              <View><Text className="text-muted-foreground text-xs">CASH</Text><Text style={{ color: '#FFB81C' }} className="font-bold text-sm">{formatMoney(cash)}</Text></View>
              <View><Text className="text-muted-foreground text-xs">INVENTORY</Text><Text className="text-foreground font-bold text-sm">{inventory.length} items</Text></View>
              <View><Text className="text-muted-foreground text-xs">PROPERTIES</Text><Text className="text-foreground font-bold text-sm">{properties.length}</Text></View>
              <View><Text className="text-muted-foreground text-xs">VEHICLES</Text><Text className="text-foreground font-bold text-sm">{vehicles.length}</Text></View>
              <View><Text className="text-muted-foreground text-xs">BUSINESSES</Text><Text className="text-foreground font-bold text-sm">{businesses.length}</Text></View>
            </View>
          </View>

          {[0, 1, 2].map(slot => {
            const hasSave = hasSaveInSlot(slot);
            const meta = getSaveSlotMeta(slot);
            const isConfirming = confirming === slot;

            return (
              <View
                key={slot}
                className="mb-4 p-4"
                style={{ borderWidth: 1, borderColor: hasSave ? '#333' : '#1A1A1A', backgroundColor: '#0D0D0D' }}
              >
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1">
                    <Text className="text-muted-foreground text-xs tracking-wider">SAVE SLOT {slot + 1}</Text>
                    {hasSave && meta ? (
                      <>
                        <Text className="text-foreground font-bold mt-1">{meta.playerName}</Text>
                        <Text className="text-muted-foreground text-xs mt-0.5">
                          {meta.location} · Day {meta.day}
                        </Text>
                        {meta.cash !== undefined && (
                          <Text className="text-xs mt-0.5" style={{ color: '#D4AF37' }}>
                            {formatMoney(meta.cash)} · {meta.inventoryCount ?? 0} items · {meta.propertyCount ?? 0} properties
                          </Text>
                        )}
                      </>
                    ) : (
                      <Text className="text-muted-foreground text-sm mt-1">Empty slot</Text>
                    )}
                  </View>
                  <Text className="text-3xl">{hasSave ? '💾' : '🔲'}</Text>
                </View>

                {isConfirming ? (
                  <View>
                    <Text className="text-xs mb-2" style={{ color: '#FFB81C' }}>
                      Overwrite Slot {slot + 1} with current game?
                    </Text>
                    <View className="flex-row gap-2">
                      <Pressable onPress={() => handleSave(slot)} className="flex-1 py-2.5 items-center" style={{ backgroundColor: '#FFB81C' }}>
                        <Text className="font-bold text-sm" style={{ color: '#0D0D0D' }}>YES, SAVE</Text>
                      </Pressable>
                      <Pressable onPress={() => setConfirming(null)} className="flex-1 py-2.5 items-center" style={{ borderWidth: 1, borderColor: '#555' }}>
                        <Text className="font-bold text-sm text-muted-foreground">CANCEL</Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={() => hasSave ? setConfirming(slot) : handleSave(slot)}
                      className="flex-1 py-3 items-center"
                      style={{ backgroundColor: '#FFB81C' }}
                    >
                      <Text className="font-bold text-sm" style={{ color: '#0D0D0D' }}>
                        {hasSave ? 'OVERWRITE' : 'SAVE HERE'}
                      </Text>
                    </Pressable>
                    {hasSave && (
                      <Pressable
                        onPress={() => handleLoad(slot)}
                        className="flex-1 py-3 items-center"
                        style={{ borderWidth: 1, borderColor: '#FFB81C' }}
                      >
                        <Text style={{ color: '#FFB81C' }} className="font-bold text-sm">LOAD</Text>
                      </Pressable>
                    )}
                    {hasSave && (
                      <Pressable
                        onPress={() => handleDelete(slot)}
                        className="py-3 px-4 items-center"
                        style={{ borderWidth: 1, borderColor: '#E32636' }}
                      >
                        <Text style={{ color: '#E32636' }} className="font-bold text-sm">🗑️</Text>
                      </Pressable>
                    )}
                  </View>
                )}
              </View>
            );
          })}

          <InfoCard>
            <Text className="text-muted-foreground text-xs leading-5">
              📦 Each save stores:{'\n'}
              Player profile · Inventory · Farming & Orchard · Businesses{'\n'}
              Vehicles · Education · Relationships · Criminal record{'\n'}
              Prison status · All properties
            </Text>
          </InfoCard>

        </View>
      </ScrollView>
    </View>
  );
}
