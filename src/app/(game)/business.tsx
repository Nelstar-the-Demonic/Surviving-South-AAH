import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useGame } from '@/store/gameContext';
import { GameHeader } from '@/components/game/GameHeader';
import { InfoCard } from '@/components/game/InfoCard';
import { BUSINESS_DEFINITIONS } from '@/lib/game/gameData';
import { formatMoney } from '@/lib/game/gameEngine';

export default function Business() {
  const router = useRouter();
  const { state, dispatch } = useGame();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [view, setView] = useState<'owned' | 'start'>('owned');

  if (!state?.gameStarted) return null;
  const { businesses, cash, location, qualifications, inventory } = state;

  // Stock availability checks for income gating display
  const hasDrugStock = inventory.some(i => i.category === 'drug' && i.quantity > 0);
  const hasCannabisStock = inventory.some(i => (i.id === 'harvest_cannabis' || i.id === 'cannabis') && i.quantity > 0);
  const hasMeatStock = inventory.some(i => i.category === 'meat' && i.quantity > 0);
  const hasMilkStock = inventory.some(i => (i.id === 'farm_cow_milk' || i.id === 'farm_goat_milk' || i.id === 'livestock_milk') && i.quantity > 0);
  const taxiCount = state.vehicles.filter(v => v.type === 'Minibus Taxi' && v.condition > 20).length;
  const truckCount = state.vehicles.filter(v => (v.type === 'Truck' || v.type === 'Light Delivery Van') && v.condition > 20).length;

  function getStockStatus(biz: typeof businesses[0]): { ok: boolean; msg: string } {
    if (biz.type === 'Drug Business')      return hasDrugStock   ? { ok: true, msg: '✅ Drug stock available' }           : { ok: false, msg: '⛔ No drugs in inventory — no income' };
    if (biz.type === 'Cannabis Business')  return hasCannabisStock ? { ok: true, msg: '✅ Cannabis stock available' }     : { ok: false, msg: '⛔ No cannabis in inventory — no income' };
    if (biz.type === 'Butchery')           return hasMeatStock   ? { ok: true, msg: '✅ Meat stock available' }           : { ok: false, msg: '⛔ No meat in inventory — no income' };
    if (biz.type === 'Dairy')              return hasMilkStock   ? { ok: true, msg: '✅ Milk stock available' }           : { ok: false, msg: '⛔ No milk in inventory — no income' };
    if (biz.type === 'Taxi Business')      return taxiCount > 0  ? { ok: true, msg: `✅ ${taxiCount} taxi(s) in fleet` } : { ok: false, msg: '⛔ No Minibus Taxis — no income' };
    if (biz.type === 'Logistics Company')  return truckCount > 0 ? { ok: true, msg: `✅ ${truckCount} truck(s) in fleet` } : { ok: false, msg: '⛔ No trucks/vans — no income' };
    return { ok: true, msg: '' };
  }

  function getRestockItems(biz: typeof businesses[0]) {
    if (biz.type === 'Drug Business')     return inventory.filter(i => i.category === 'drug' && i.quantity > 0);
    if (biz.type === 'Cannabis Business') return inventory.filter(i => (i.id === 'harvest_cannabis' || i.id === 'cannabis') && i.quantity > 0);
    if (biz.type === 'Butchery')          return inventory.filter(i => i.category === 'meat' && i.quantity > 0);
    if (biz.type === 'Dairy')             return inventory.filter(i => (i.id === 'farm_cow_milk' || i.id === 'farm_goat_milk') && i.quantity > 0);
    return [];
  }

  function showFeedback(msg: string) {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  }

  function startBusiness(type: string) {
    const def = BUSINESS_DEFINITIONS.find(b => b.type === type);
    if (!def) return;

    const totalCost = def.capitalRequired + def.licenceCost + def.registrationCost;
    if (cash < totalCost) {
      showFeedback(`⚠️ Insufficient funds. Need ${formatMoney(totalCost)} total.`);
      return;
    }
    if (!def.availableLocations.includes(location)) {
      showFeedback(`⚠️ ${type} is not available in ${location}.`);
      return;
    }
    const missingQuals = def.requiredQualifications.filter(q => !qualifications.includes(q));
    if (missingQuals.length > 0) {
      showFeedback(`⚠️ Missing: ${missingQuals.join(', ')}`);
      return;
    }

    dispatch({ type: 'START_BUSINESS', payload: type });
    showFeedback(`✅ ${type} launched! It will earn daily income automatically.`);
  }

  const availableDefs = BUSINESS_DEFINITIONS.filter(d =>
    d.availableLocations.includes(location) &&
    !businesses.some(b => b.type === d.type)
  );

  return (
    <View className="flex-1 bg-background">
      <GameHeader title="Business" subtitle="Build income-generating enterprises" />

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

          {/* Tab toggle */}
          <View className="flex-row gap-3 mb-4">
            {(['owned', 'start'] as const).map(v => (
              <Pressable
                key={v}
                onPress={() => setView(v)}
                className="flex-1 py-3 items-center"
                style={{
                  borderWidth: 1,
                  borderColor: view === v ? '#FFB81C' : '#333',
                  backgroundColor: view === v ? '#1A1400' : '#0D0D0D',
                }}
              >
                <Text style={{ color: view === v ? '#FFB81C' : '#666' }} className="font-bold text-sm">
                  {v === 'owned' ? `MY BUSINESSES (${businesses.length})` : 'START NEW'}
                </Text>
              </Pressable>
            ))}
          </View>

          {view === 'owned' && (
            <>
              {businesses.length === 0 ? (
                <InfoCard>
                  <Text className="text-muted-foreground text-sm text-center py-4">
                    You don't own any businesses yet.{'\n'}
                    Switch to "Start New" to launch your first enterprise.
                  </Text>
                </InfoCard>
              ) : (
                businesses.map(biz => (
                  <View
                    key={biz.id}
                    className="mb-4 p-4"
                    style={{ borderWidth: 1, borderColor: '#FFB81C', backgroundColor: '#0D0A00' }}
                  >
                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-1">
                        <Text className="text-foreground font-bold text-base">{biz.name}</Text>
                        <Text className="text-muted-foreground text-xs mt-0.5">
                          {biz.type} · {biz.location}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text style={{ color: '#4CAF50' }} className="font-bold">
                          {formatMoney(biz.dailyIncome)}/day
                        </Text>
                        <Text className="text-muted-foreground text-xs">auto-collected</Text>
                      </View>
                    </View>

                    <View className="flex-row gap-4 mb-3">
                      <View>
                        <Text className="text-muted-foreground text-xs">REPUTATION</Text>
                        <Text className="text-foreground font-bold">{biz.reputation}/100</Text>
                      </View>
                      <View>
                        <Text className="text-muted-foreground text-xs">INVESTMENT</Text>
                        <Text className="text-foreground font-bold">{formatMoney(biz.capital)}</Text>
                      </View>
                      <View>
                        <Text className="text-muted-foreground text-xs">LICENSED</Text>
                        <Text style={{ color: '#4CAF50' }} className="font-bold">
                          {biz.isLicensed ? '✓ YES' : '✗ NO'}
                        </Text>
                      </View>
                    </View>

                    <View className="h-1.5 bg-secondary mb-1">
                      <View className="h-1.5" style={{ width: `${biz.reputation}%`, backgroundColor: '#FFB81C' }} />
                    </View>
                    <Text className="text-muted-foreground text-xs mb-2">Reputation affects daily income</Text>

                    {/* Stock status & restock panel — all stock-gated business types */}
                    {['Drug Business', 'Cannabis Business', 'Butchery', 'Dairy'].includes(biz.type) && (() => {
                      const stockStatus = getStockStatus(biz);
                      const restockItems = getRestockItems(biz);
                      return (
                        <View className="mt-2 p-3" style={{
                          borderWidth: 1,
                          borderColor: stockStatus.ok ? '#2A4A2A' : '#4A1A1A',
                          backgroundColor: stockStatus.ok ? '#041004' : '#0D0000',
                        }}>
                          <Text className="text-xs font-bold mb-2" style={{ color: stockStatus.ok ? '#4CAF50' : '#E32636' }}>
                            {stockStatus.msg}
                          </Text>
                          {!stockStatus.ok && restockItems.length > 0 && (
                            <>
                              <Text className="text-xs mb-2" style={{ color: '#888' }}>Move from inventory to restock:</Text>
                              {restockItems.map(item => (
                                <Pressable
                                  key={item.id}
                                  onPress={() => {
                                    const qty = Math.min(10, item.quantity);
                                    dispatch({ type: 'RESTOCK_BUSINESS', payload: { businessId: biz.id, itemId: item.id, quantity: qty, cost: 0 } });
                                    showFeedback(`✅ Moved ${qty} ${item.unit ?? 'unit(s)'} of ${item.name} to ${biz.name}.`);
                                  }}
                                  className="mb-1 p-2 flex-row justify-between items-center"
                                  style={{ borderWidth: 1, borderColor: '#1A2A1A', backgroundColor: '#080808' }}
                                >
                                  <Text style={{ color: '#ccc', fontSize: 12 }}>{item.name}</Text>
                                  <Text style={{ color: '#FFB81C', fontSize: 11 }}>
                                    {item.quantity.toFixed ? item.quantity.toFixed(1) : item.quantity} {item.unit} → Move 10
                                  </Text>
                                </Pressable>
                              ))}
                            </>
                          )}
                          {!stockStatus.ok && restockItems.length === 0 && (
                            <Text className="text-xs" style={{ color: '#666' }}>
                              {biz.type === 'Drug Business' && 'Buy drugs from Shop → Black Market, then move to business.'}
                              {biz.type === 'Cannabis Business' && 'Harvest cannabis from Farming, then move to business.'}
                              {biz.type === 'Butchery' && 'Slaughter livestock in Farming to get meat.'}
                              {biz.type === 'Dairy' && 'Collect milk from cattle/goats in Farming.'}
                            </Text>
                          )}
                          {(biz.stock ?? []).length > 0 && (
                            <View className="mt-2 flex-row flex-wrap gap-2">
                              {(biz.stock ?? []).map(s => (
                                <View key={s.id} className="px-2 py-1" style={{ backgroundColor: '#0A1A0A', borderWidth: 1, borderColor: '#2A4A2A' }}>
                                  <Text className="text-xs" style={{ color: '#81C784' }}>{s.name}: {typeof s.quantity === 'number' ? s.quantity.toFixed(1) : s.quantity} {s.unitSellPrice > 0 ? `· R${s.unitSellPrice}/unit` : ''}</Text>
                                </View>
                              ))}
                            </View>
                          )}
                        </View>
                      );
                    })()}

                    {/* Fleet-gated businesses */}
                    {(biz.type === 'Taxi Business' || biz.type === 'Logistics Company') && (() => {
                      const stockStatus = getStockStatus(biz);
                      return (
                        <View className="mt-2 p-3" style={{
                          borderWidth: 1,
                          borderColor: stockStatus.ok ? '#2A4A2A' : '#4A1A1A',
                          backgroundColor: stockStatus.ok ? '#041004' : '#0D0000',
                        }}>
                          <Text className="text-xs font-bold" style={{ color: stockStatus.ok ? '#4CAF50' : '#E32636' }}>
                            {stockStatus.msg}
                          </Text>
                          {!stockStatus.ok && (
                            <Text className="text-xs mt-1" style={{ color: '#666' }}>
                              {biz.type === 'Taxi Business' ? 'Buy a Minibus Taxi from Vehicles.' : 'Buy a Truck or Light Delivery Van from Vehicles.'}
                            </Text>
                          )}
                        </View>
                      );
                    })()}
                  </View>
                ))
              )}
            </>
          )}

          {view === 'start' && (
            <>
              <InfoCard>
                <Text className="text-muted-foreground text-xs leading-5">
                  💡 Starting a business requires capital, licence fees, and registration.
                  Businesses run automatically and generate daily income.
                  Location and reputation affect how much you earn.
                </Text>
              </InfoCard>

              {availableDefs.length === 0 && (
                <InfoCard>
                  <Text className="text-muted-foreground text-sm text-center py-2">
                    You already own all available business types in {location},
                    or no new businesses are available here.
                  </Text>
                </InfoCard>
              )}

              {availableDefs.map(def => {
                const totalCost = def.capitalRequired + def.licenceCost + def.registrationCost;
                const hasQuals = def.requiredQualifications.every(q => qualifications.includes(q));
                const canAfford = cash >= totalCost;

                return (
                  <View
                    key={def.type}
                    className="mb-3 p-4"
                    style={{
                      borderWidth: 1,
                      borderColor: hasQuals && canAfford ? '#333' : '#1A1A1A',
                      backgroundColor: '#0D0D0D',
                      opacity: hasQuals ? 1 : 0.65,
                    }}
                  >
                    <Text className="text-foreground font-bold text-sm mb-1">{def.type}</Text>
                    <Text className="text-muted-foreground text-xs mb-3">{def.description}</Text>

                    <View className="flex-row flex-wrap gap-3 mb-3">
                      <View>
                        <Text className="text-muted-foreground text-xs">CAPITAL</Text>
                        <Text className="text-foreground text-sm font-bold">{formatMoney(def.capitalRequired)}</Text>
                      </View>
                      <View>
                        <Text className="text-muted-foreground text-xs">LICENCE</Text>
                        <Text className="text-foreground text-sm font-bold">{formatMoney(def.licenceCost)}</Text>
                      </View>
                      <View>
                        <Text className="text-muted-foreground text-xs">REGISTRATION</Text>
                        <Text className="text-foreground text-sm font-bold">{formatMoney(def.registrationCost)}</Text>
                      </View>
                      <View>
                        <Text className="text-muted-foreground text-xs">BASE INCOME</Text>
                        <Text style={{ color: '#4CAF50' }} className="text-sm font-bold">
                          {formatMoney(def.baseDailyIncome)}/day
                        </Text>
                      </View>
                    </View>

                    <View className="mb-3 p-2" style={{ backgroundColor: '#0D0A00' }}>
                      <Text className="text-muted-foreground text-xs">
                        Total cost: {formatMoney(totalCost)} · Your cash: {formatMoney(cash)}
                      </Text>
                    </View>

                    {def.requiredQualifications.length > 0 && (
                      <Text className="text-xs mb-3" style={{ color: hasQuals ? '#4CAF50' : '#E32636' }}>
                        {hasQuals ? '✓' : '✗'} Requires: {def.requiredQualifications.join(', ')}
                      </Text>
                    )}

                    <Pressable
                      onPress={() => startBusiness(def.type)}
                      className="py-3 items-center"
                      style={{
                        backgroundColor: hasQuals && canAfford ? '#FFB81C' : '#222',
                        opacity: hasQuals && canAfford ? 1 : 0.5,
                      }}
                    >
                      <Text
                        className="font-bold text-sm"
                        style={{ color: hasQuals && canAfford ? '#0D0D0D' : '#555' }}
                      >
                        {!hasQuals ? 'MISSING QUALIFICATIONS' : !canAfford ? 'INSUFFICIENT FUNDS' : `LAUNCH — ${formatMoney(totalCost)}`}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}

              {/* All types not available here */}
              {BUSINESS_DEFINITIONS.filter(d => !d.availableLocations.includes(location)).length > 0 && (
                <InfoCard>
                  <Text className="text-muted-foreground text-xs">
                    Some businesses are only available in other locations. Move to access more options.
                  </Text>
                </InfoCard>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
