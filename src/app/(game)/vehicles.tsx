import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useGame } from '@/store/gameContext';
import { GameHeader } from '@/components/game/GameHeader';
import { InfoCard } from '@/components/game/InfoCard';
import { VEHICLE_DEFINITIONS, LICENCE_DEFINITIONS } from '@/lib/game/gameData';
import { formatMoney } from '@/lib/game/gameEngine';

export default function Vehicles() {
  const router = useRouter();
  const { state, dispatch } = useGame();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [tab, setTab] = useState<'owned' | 'buy' | 'licences'>('owned');

  if (!state?.gameStarted) return null;
  const { vehicles, qualifications, cash } = state;

  function showFeedback(msg: string) {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  }

  function buyVehicle(idx: number) {
    const def = VEHICLE_DEFINITIONS[idx];
    if (!def) return;
    if (cash < def.price) {
      showFeedback(`⚠️ Need ${formatMoney(def.price)} to buy.`);
      return;
    }
    if (def.requiredLicence && !qualifications.includes(def.requiredLicence as any)) {
      showFeedback(`⚠️ You need a ${def.requiredLicence} licence first. Visit Traffic Department.`);
      return;
    }
    const countOfType = vehicles.filter(v => v.type === def.type).length;
    if (countOfType >= 30) {
      showFeedback(`⚠️ Maximum 30 ${def.type}s reached.`);
      return;
    }
    dispatch({ type: 'BUY_VEHICLE', payload: idx });
    showFeedback(`✅ ${def.type} purchased! Added to your fleet.`);
  }

  function applyLicence(licId: string) {
    const lic = LICENCE_DEFINITIONS.find(l => l.id === licId);
    if (!lic) return;
    if (qualifications.includes(lic.qualification)) {
      showFeedback('You already have this licence.');
      return;
    }
    if (cash < lic.cost) {
      showFeedback(`⚠️ Need ${formatMoney(lic.cost)} for this licence.`);
      return;
    }
    dispatch({ type: 'APPLY_LICENCE', payload: licId });
    showFeedback(`✅ ${lic.name} obtained!`);
  }

  return (
    <View className="flex-1 bg-background">
      <GameHeader title="Vehicles" subtitle="Transport expands your opportunities" />

      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View className="px-4 pt-4 pb-10">

          {feedback && (
            <View className="mb-4 p-3" style={{
              backgroundColor: feedback.includes('✅') ? '#0D1A0D' : '#1A0A00',
              borderWidth: 1,
              borderColor: feedback.includes('✅') ? '#4CAF50' : '#FFB81C',
            }}>
              <Text className="text-sm" style={{ color: feedback.includes('✅') ? '#4CAF50' : '#FFB81C' }}>
                {feedback}
              </Text>
            </View>
          )}

          <View className="flex-row gap-2 mb-4">
            {(['owned', 'buy', 'licences'] as const).map(t => (
              <Pressable
                key={t}
                onPress={() => setTab(t)}
                className="flex-1 items-center py-2"
                style={{
                  borderWidth: 1,
                  borderColor: tab === t ? '#FFB81C' : '#333',
                  backgroundColor: tab === t ? '#1A1400' : '#0D0D0D',
                }}
              >
                <Text className="text-xs font-bold" style={{ color: tab === t ? '#FFB81C' : '#666' }}>
                  {t === 'owned' ? `MY (${vehicles.length})` : t.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>

          {tab === 'owned' && (
            <>
              {vehicles.length === 0 ? (
                <InfoCard>
                  <Text className="text-muted-foreground text-sm text-center py-4">
                    You don't own any vehicles.{'\n'}
                    Vehicles unlock jobs, businesses, and income bonuses.
                  </Text>
                </InfoCard>
              ) : (
                <>
                  {/* Fleet summary by type */}
                  {(() => {
                    const fleetMap: Record<string, number> = {};
                    vehicles.forEach(v => { fleetMap[v.type] = (fleetMap[v.type] ?? 0) + 1; });
                    return (
                      <View className="mb-3 p-3 flex-row flex-wrap gap-2" style={{ borderWidth: 1, borderColor: '#2A1A00', backgroundColor: '#0A0800' }}>
                        <Text className="text-xs font-bold w-full" style={{ color: '#D4AF37' }}>🚗 FLEET SUMMARY</Text>
                        {Object.entries(fleetMap).map(([type, count]) => {
                          const def = VEHICLE_DEFINITIONS.find(d => d.type === type);
                          return (
                            <View key={type} className="px-3 py-1" style={{ borderWidth: 1, borderColor: '#3A2200', backgroundColor: '#1A1000' }}>
                              <Text style={{ color: '#FFB81C', fontSize: 12 }}>
                                {def?.icon ?? '🚗'} {type} × {count}/30
                              </Text>
                              {def?.farmBonus ? <Text style={{ color: '#4CAF50', fontSize: 10 }}>🌾 Farm bonus</Text> : null}
                              {def?.taxiIncome ? <Text style={{ color: '#4CAF50', fontSize: 10 }}>🚐 Taxi income</Text> : null}
                              {def?.logisticsBonus ? <Text style={{ color: '#4CAF50', fontSize: 10 }}>🚛 Logistics bonus</Text> : null}
                              {def?.incomeBonus ? <Text style={{ color: '#4CAF50', fontSize: 10 }}>💼 Income bonus</Text> : null}
                            </View>
                          );
                        })}
                      </View>
                    );
                  })()}

                  {vehicles.map((v, vIdx) => {
                    const vDef = VEHICLE_DEFINITIONS.find(d => d.type === v.type);
                    const resaleValue = Math.floor((vDef?.price ?? 5000) * (v.condition / 100) * 0.65);
                    return (
                      <View key={v.id} className="mb-3 p-4" style={{ borderWidth: 1, borderColor: '#FFB81C', backgroundColor: '#0D0A00' }}>
                        <View className="flex-row justify-between items-center mb-2">
                          <Text className="text-foreground font-bold text-base">{vDef?.icon ?? '🚗'} {v.type}</Text>
                          <Text style={{ color: v.condition >= 70 ? '#4CAF50' : v.condition >= 40 ? '#FFB81C' : '#E32636' }} className="font-bold">
                            {v.condition}% condition
                          </Text>
                        </View>
                        <View className="h-1.5 bg-secondary mb-2">
                          <View className="h-1.5" style={{
                            width: `${v.condition}%`,
                            backgroundColor: v.condition >= 70 ? '#4CAF50' : v.condition >= 40 ? '#FFB81C' : '#E32636',
                          }} />
                        </View>
                        <View className="flex-row flex-wrap gap-3 mb-2">
                          {vDef?.farmBonus && <Text style={{ color: '#81C784', fontSize: 11 }}>🌾 Farming bonus</Text>}
                          {vDef?.taxiIncome && <Text style={{ color: '#81C784', fontSize: 11 }}>🚐 Taxi income</Text>}
                          {vDef?.logisticsBonus && <Text style={{ color: '#81C784', fontSize: 11 }}>🚛 Logistics bonus</Text>}
                          {vDef?.incomeBonus && <Text style={{ color: '#81C784', fontSize: 11 }}>💼 Work income bonus</Text>}
                          {v.requiredLicence && (
                            <Text className="text-muted-foreground text-xs">
                              Licence: {v.requiredLicence}
                            </Text>
                          )}
                        </View>
                        <Pressable
                          onPress={() => {
                            dispatch({ type: 'SELL_VEHICLE', payload: vIdx });
                            showFeedback(`✅ Sold ${v.type} for ${formatMoney(resaleValue)}.`);
                          }}
                          className="py-2 items-center mt-1"
                          style={{ borderWidth: 1, borderColor: '#FF9800' }}
                        >
                          <Text className="text-xs font-bold" style={{ color: '#FF9800' }}>
                            💰 SELL — {formatMoney(resaleValue)}
                          </Text>
                        </Pressable>
                      </View>
                    );
                  })}
                </>
              )}
            </>
          )}

          {tab === 'buy' && (
            <>
              {VEHICLE_DEFINITIONS.map((def, idx) => {
                const hasLicence = !def.requiredLicence || qualifications.includes(def.requiredLicence as any);
                const canAfford = cash >= def.price;
                const countOwned = vehicles.filter(v => v.type === def.type).length;
                const atMax = countOwned >= 30;

                return (
                  <View
                    key={def.type}
                    className="mb-3 p-4"
                    style={{
                      borderWidth: 1,
                      borderColor: hasLicence && canAfford && !atMax ? '#333' : '#1A1A1A',
                      backgroundColor: '#0D0D0D',
                      opacity: hasLicence ? 1 : 0.6,
                    }}
                  >
                    <View className="flex-row justify-between items-start mb-2">
                      <View className="flex-1">
                        <Text className="text-foreground font-bold text-sm">{def.icon ?? '🚗'} {def.type}</Text>
                        <Text className="text-muted-foreground text-xs">{def.description}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ color: '#FFB81C' }} className="font-bold">{formatMoney(def.price)}</Text>
                        <Text style={{ color: '#555', fontSize: 10 }}>Owned: {countOwned}/30</Text>
                      </View>
                    </View>

                    {/* Bonuses */}
                    <View className="flex-row flex-wrap gap-2 mb-2">
                      {def.farmBonus    && <Text style={{ color: '#81C784', fontSize: 10 }}>🌾 Farm boost</Text>}
                      {def.taxiIncome   && <Text style={{ color: '#81C784', fontSize: 10 }}>🚐 Taxi income: R{def.taxiIncome}/day</Text>}
                      {def.logisticsBonus && <Text style={{ color: '#81C784', fontSize: 10 }}>🚛 Logistics income</Text>}
                      {def.incomeBonus  && <Text style={{ color: '#81C784', fontSize: 10 }}>💼 Work bonus</Text>}
                    </View>

                    {def.requiredLicence && (
                      <Text className="text-xs mb-3" style={{ color: hasLicence ? '#4CAF50' : '#E32636' }}>
                        {hasLicence ? '✓' : '✗'} Requires: {def.requiredLicence}
                      </Text>
                    )}

                    <Pressable
                      onPress={() => buyVehicle(idx)}
                      className="py-2 items-center"
                      style={{
                        backgroundColor: hasLicence && canAfford && !atMax ? '#FFB81C' : '#222',
                        opacity: hasLicence && canAfford && !atMax ? 1 : 0.5,
                      }}
                    >
                      <Text
                        className="font-bold text-sm"
                        style={{ color: hasLicence && canAfford && !atMax ? '#0D0D0D' : '#555' }}
                      >
                        {atMax ? 'MAX FLEET REACHED (30)' : !hasLicence ? 'LICENCE REQUIRED' : !canAfford ? 'INSUFFICIENT FUNDS' : `BUY — ${formatMoney(def.price)}`}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </>
          )}

          {tab === 'licences' && (
            <>
              <InfoCard>
                <Text className="text-muted-foreground text-xs">
                  Licences allow you to legally operate vehicles and run certain businesses.
                  Visit the Traffic Department in Government Services to apply.
                </Text>
              </InfoCard>
              {LICENCE_DEFINITIONS.map(lic => {
                const hasIt = qualifications.includes(lic.qualification);
                return (
                  <View
                    key={lic.id}
                    className="mb-3 p-4"
                    style={{
                      borderWidth: 1,
                      borderColor: hasIt ? '#4CAF50' : '#333',
                      backgroundColor: hasIt ? '#050D05' : '#0D0D0D',
                    }}
                  >
                    <View className="flex-row justify-between items-center mb-1">
                      <Text className="text-foreground font-bold text-sm">{lic.name}</Text>
                      {hasIt ? (
                        <Text style={{ color: '#4CAF50' }}>✓ OBTAINED</Text>
                      ) : (
                        <Text style={{ color: '#FFB81C' }} className="font-bold">{formatMoney(lic.cost)}</Text>
                      )}
                    </View>
                    <Text className="text-muted-foreground text-xs mb-3">{lic.description}</Text>
                    {!hasIt && (
                      <Pressable
                        onPress={() => applyLicence(lic.id)}
                        className="py-2 items-center"
                        style={{
                          backgroundColor: cash >= lic.cost ? '#FFB81C' : '#222',
                          opacity: cash >= lic.cost ? 1 : 0.5,
                        }}
                      >
                        <Text className="font-bold text-sm" style={{ color: cash >= lic.cost ? '#0D0D0D' : '#555' }}>
                          {cash >= lic.cost ? `APPLY — ${formatMoney(lic.cost)}` : 'INSUFFICIENT FUNDS'}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                );
              })}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
