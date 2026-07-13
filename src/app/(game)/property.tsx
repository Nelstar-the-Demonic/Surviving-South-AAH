import { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useGame } from '@/store/gameContext';
import { GameHeader } from '@/components/game/GameHeader';
import { InfoCard } from '@/components/game/InfoCard';
import { PROPERTY_DEFINITIONS } from '@/lib/game/gameData';
import { formatMoney } from '@/lib/game/gameEngine';

export default function Property() {
  const router = useRouter();
  const { state, dispatch } = useGame();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [view, setView] = useState<'owned' | 'browse'>('owned');
  const [rentInput, setRentInput] = useState<Record<string, string>>({});

  if (!state?.gameStarted) return null;
  const { properties, location, cash, currentPropertyId } = state;

  function showFeedback(msg: string) {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  }

  function rentProperty(defIndex: number) {
    const def = PROPERTY_DEFINITIONS[defIndex];
    if (!def) return;
    if (!def.availableLocations.includes(location)) {
      showFeedback(`⚠️ Not available in ${location}.`); return;
    }
    if (cash < def.rentMonthly) {
      showFeedback(`⚠️ Need ${formatMoney(def.rentMonthly)} for first month.`); return;
    }
    dispatch({ type: 'BUY_PROPERTY', payload: { defIndex, owned: false } });
    showFeedback(`✅ Now renting: ${def.type} in ${location}. Monthly: ${formatMoney(def.rentMonthly)}`);
  }

  function buyProperty(defIndex: number) {
    const def = PROPERTY_DEFINITIONS[defIndex];
    if (!def) return;
    if (!def.availableLocations.includes(location)) {
      showFeedback(`⚠️ Not available in ${location}.`); return;
    }
    if (cash < def.purchasePrice) {
      showFeedback(`⚠️ Need ${formatMoney(def.purchasePrice)} to purchase.`); return;
    }
    dispatch({ type: 'BUY_PROPERTY', payload: { defIndex, owned: true } });
    // If player is currently renting same type, note that rental ends
    const existingRental = properties.find(p => p.type === def.type && !p.owned);
    if (existingRental) {
      showFeedback(`✅ Purchased: ${def.type}! Your rental agreement has ended — no more rent payments.`);
    } else {
      showFeedback(`✅ Purchased: ${def.type} in ${location}!`);
    }
  }

  // Realistic rental price caps per property type
  const RENTAL_CAPS: Record<string, number> = {
    'Shack': 800, 'RDP House': 1200, 'Village House': 2500,
    'Townhouse': 8000, 'Flat': 6000, 'House': 15000,
    'Luxury Apartment': 25000, 'Mansion': 50000, 'Farm': 20000,
    'Commercial Space': 30000,
  };

  function rentOutProperty(propertyId: string) {
    const prop = properties.find(p => p.id === propertyId);
    if (!prop) return;
    const monthlyRent = parseInt(rentInput[propertyId] ?? '0', 10);
    if (!monthlyRent || monthlyRent < 100) {
      showFeedback('⚠️ Enter a valid rental amount (min R100).'); return;
    }
    const cap = RENTAL_CAPS[prop.type] ?? 30000;
    if (monthlyRent > cap) {
      showFeedback(`⚠️ Max realistic rent for ${prop.type} is ${formatMoney(cap)}/month. Tenants won't pay more.`);
      return;
    }
    dispatch({ type: 'RENT_OUT_PROPERTY', payload: { propertyId, monthlyRent } });
    showFeedback(`✅ Property listed for rent at ${formatMoney(monthlyRent)}/month.`);
    setRentInput(prev => ({ ...prev, [propertyId]: '' }));
  }

  function unrentProperty(propertyId: string) {
    dispatch({ type: 'UNRENT_PROPERTY', payload: propertyId });
    showFeedback('Property rental stopped.');
  }

  function setPrimaryResidence(propertyId: string) {
    dispatch({ type: 'SET_PRIMARY_RESIDENCE', payload: propertyId });
    showFeedback('✅ Primary residence updated.');
  }

  const availableProps = PROPERTY_DEFINITIONS.filter(d => d.availableLocations.includes(location));
  const ownedCount = properties.filter(p => p.owned).length;
  const rentingCount = properties.filter(p => !p.owned).length;

  return (
    <View className="flex-1 bg-background">
      <GameHeader title="Property" subtitle="Your homes, farms & rental portfolio" />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View className="px-4 pt-4 pb-10">

          {feedback && (
            <View className="mb-4 p-3" style={{ backgroundColor: feedback.includes('✅') ? '#0D1A0D' : '#1A0A00', borderWidth: 1, borderColor: feedback.includes('✅') ? '#4CAF50' : '#FFB81C' }}>
              <Text className="text-sm" style={{ color: feedback.includes('✅') ? '#4CAF50' : '#FFB81C' }}>{feedback}</Text>
            </View>
          )}

          {/* Summary bar */}
          <View className="mb-4 flex-row gap-3">
            <View className="flex-1 p-3 items-center" style={{ borderWidth: 1, borderColor: '#4CAF50', backgroundColor: '#0A1200' }}>
              <Text className="text-xs text-muted-foreground">OWNED</Text>
              <Text className="font-bold text-lg" style={{ color: '#4CAF50' }}>{ownedCount}</Text>
            </View>
            <View className="flex-1 p-3 items-center" style={{ borderWidth: 1, borderColor: '#FFB81C', backgroundColor: '#0A0800' }}>
              <Text className="text-xs text-muted-foreground">RENTING</Text>
              <Text className="font-bold text-lg" style={{ color: '#FFB81C' }}>{rentingCount}</Text>
            </View>
            <View className="flex-1 p-3 items-center" style={{ borderWidth: 1, borderColor: '#64B5F6', backgroundColor: '#000A1A' }}>
              <Text className="text-xs text-muted-foreground">RENTED OUT</Text>
              <Text className="font-bold text-lg" style={{ color: '#64B5F6' }}>
                {properties.filter(p => p.isRentedOut).length}
              </Text>
            </View>
          </View>

          {/* Tabs */}
          <View className="flex-row gap-3 mb-4">
            {(['owned', 'browse'] as const).map(v => (
              <Pressable key={v} onPress={() => setView(v)} className="flex-1 py-3 items-center"
                style={{ borderWidth: 1, borderColor: view === v ? '#FFB81C' : '#333', backgroundColor: view === v ? '#1A1400' : '#0D0D0D' }}>
                <Text style={{ color: view === v ? '#FFB81C' : '#666' }} className="font-bold text-sm">
                  {v === 'owned' ? `MY PROPERTIES (${properties.length})` : 'BROWSE'}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* MY PROPERTIES */}
          {view === 'owned' && (
            <>
              {properties.length === 0 ? (
                <InfoCard>
                  <Text className="text-muted-foreground text-sm text-center py-4">
                    You don't own or rent any property.{'\n'}Browse and acquire property below.
                  </Text>
                </InfoCard>
              ) : (
                properties.map(prop => (
                  <View key={prop.id} className="mb-4 p-4"
                    style={{ borderWidth: 2, borderColor: currentPropertyId === prop.id ? '#FFB81C' : (prop.isRentedOut ? '#64B5F6' : '#333'), backgroundColor: '#0D0D0D' }}>
                    <View className="flex-row justify-between items-start mb-2">
                      <View className="flex-1">
                        <Text className="text-foreground font-bold text-base">{prop.type}</Text>
                        <Text className="text-muted-foreground text-xs mt-0.5">{prop.location}</Text>
                      </View>
                      <View className="items-end">
                        <Text className="font-bold text-sm" style={{ color: prop.owned ? '#4CAF50' : '#FFB81C' }}>
                          {prop.owned ? '🏠 OWNED' : '🔑 RENTING'}
                        </Text>
                        {!prop.owned && <Text className="text-muted-foreground text-xs">{formatMoney(prop.monthlyPayment)}/month</Text>}
                        {prop.isRentedOut && <Text className="text-xs font-bold" style={{ color: '#64B5F6' }}>📋 RENTED OUT +{formatMoney(prop.tenantRent)}/mo</Text>}
                      </View>
                    </View>

                    <View className="flex-row gap-4 mb-3">
                      <View>
                        <Text className="text-muted-foreground text-xs">STORAGE</Text>
                        <Text className="text-foreground font-bold">{prop.storageSlots} slots</Text>
                      </View>
                      <View>
                        <Text className="text-muted-foreground text-xs">COMFORT</Text>
                        <Text className="text-foreground font-bold">+{prop.comfortBonus}</Text>
                      </View>
                      {prop.type === 'Farm' && (
                        <View>
                          <Text className="text-muted-foreground text-xs">FARMING</Text>
                          <Text style={{ color: '#4CAF50' }} className="font-bold">ENABLED</Text>
                        </View>
                      )}
                    </View>

                    {currentPropertyId === prop.id && (
                      <View className="mb-2 px-2 py-1" style={{ backgroundColor: '#0D0A00', borderWidth: 1, borderColor: '#FFB81C' }}>
                        <Text style={{ color: '#FFB81C' }} className="text-xs">📍 Primary residence</Text>
                      </View>
                    )}

                    {/* Actions */}
                    <View className="gap-2">
                      {/* Set as primary residence (owned only, not rented out) */}
                      {prop.owned && !prop.isRentedOut && currentPropertyId !== prop.id && (
                        <Pressable onPress={() => setPrimaryResidence(prop.id)} className="py-2 items-center"
                          style={{ borderWidth: 1, borderColor: '#FFB81C' }}>
                          <Text className="text-xs font-bold" style={{ color: '#FFB81C' }}>SET AS PRIMARY HOME</Text>
                        </Pressable>
                      )}

                      {/* Rent out (owned, not current primary) */}
                      {prop.owned && !prop.isRentedOut && currentPropertyId !== prop.id && (
                        <View className="gap-1.5">
                          <TextInput
                            value={rentInput[prop.id] ?? ''}
                            onChangeText={v => setRentInput(prev => ({ ...prev, [prop.id]: v.replace(/[^0-9]/g, '') }))}
                            placeholder={`Monthly rent (R100 – R${(RENTAL_CAPS[prop.type] ?? 30000).toLocaleString()})`}
                            placeholderTextColor="#555"
                            keyboardType="numeric"
                            className="p-2 text-sm text-foreground"
                            style={{ borderWidth: 1, borderColor: '#333', backgroundColor: '#111' }}
                          />
                          <Text className="text-xs text-muted-foreground">
                            Max realistic rent: {formatMoney(RENTAL_CAPS[prop.type] ?? 30000)}/mo
                          </Text>
                          <Pressable onPress={() => rentOutProperty(prop.id)} className="py-2 items-center"
                            style={{ borderWidth: 1, borderColor: '#64B5F6' }}>
                            <Text className="text-xs font-bold" style={{ color: '#64B5F6' }}>RENT OUT TO TENANT</Text>
                          </Pressable>
                        </View>
                      )}

                      {/* Stop renting out */}
                      {prop.isRentedOut && (
                        <Pressable onPress={() => unrentProperty(prop.id)} className="py-2 items-center"
                          style={{ borderWidth: 1, borderColor: '#E32636' }}>
                          <Text className="text-xs font-bold" style={{ color: '#E32636' }}>STOP RENTING OUT</Text>
                        </Pressable>
                      )}

                      {/* Sell property (owned only, not current primary, not rented out) */}
                      {prop.owned && currentPropertyId !== prop.id && !prop.isRentedOut && (
                        <Pressable
                          onPress={() => {
                            const resale = Math.floor((prop.purchasePrice ?? prop.monthlyPayment * 12) * 0.6);
                            dispatch({ type: 'SELL_PROPERTY', payload: prop.id });
                            showFeedback(`✅ Sold ${prop.type} for ${formatMoney(resale)} (60% of purchase price).`);
                          }}
                          className="py-2 items-center"
                          style={{ borderWidth: 1, borderColor: '#FF9800' }}
                        >
                          <Text className="text-xs font-bold" style={{ color: '#FF9800' }}>
                            💰 SELL PROPERTY — {formatMoney(Math.floor((prop.purchasePrice ?? prop.monthlyPayment * 12) * 0.6))}
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                ))
              )}
            </>
          )}

          {/* BROWSE */}
          {view === 'browse' && (
            <>
              <InfoCard>
                <Text className="text-muted-foreground text-xs">
                  📍 Properties available in {location}.{'\n'}
                  You can own multiple properties and rent them out to tenants.
                </Text>
              </InfoCard>
              {availableProps.map((def) => {
                const defIdx = PROPERTY_DEFINITIONS.indexOf(def);
                return (
                  <View key={def.type} className="mb-3 p-4" style={{ borderWidth: 1, borderColor: '#222', backgroundColor: '#0D0D0D' }}>
                    <Text className="text-foreground font-bold text-sm mb-1">{def.type}</Text>
                    <Text className="text-muted-foreground text-xs mb-3">{def.description}</Text>
                    <View className="flex-row flex-wrap gap-3 mb-3">
                      <View><Text className="text-muted-foreground text-xs">RENT/MO</Text><Text className="text-foreground font-bold">{formatMoney(def.rentMonthly)}</Text></View>
                      <View><Text className="text-muted-foreground text-xs">BUY PRICE</Text><Text className="text-foreground font-bold">{formatMoney(def.purchasePrice)}</Text></View>
                      <View><Text className="text-muted-foreground text-xs">COMFORT</Text><Text className="text-foreground font-bold">+{def.comfortBonus}</Text></View>
                      <View><Text className="text-muted-foreground text-xs">STORAGE</Text><Text className="text-foreground font-bold">{def.storageSlots}</Text></View>
                    </View>
                    <View className="flex-row gap-2">
                      <Pressable onPress={() => rentProperty(defIdx)} className="flex-1 py-2 items-center"
                        style={{ borderWidth: 1, borderColor: cash >= def.rentMonthly ? '#FFB81C' : '#333', opacity: cash >= def.rentMonthly ? 1 : 0.5 }}>
                        <Text style={{ color: cash >= def.rentMonthly ? '#FFB81C' : '#555' }} className="text-xs font-bold">
                          RENT {formatMoney(def.rentMonthly)}
                        </Text>
                      </Pressable>
                      <Pressable onPress={() => buyProperty(defIdx)} className="flex-1 py-2 items-center"
                        style={{ backgroundColor: cash >= def.purchasePrice ? '#FFB81C' : '#222', opacity: cash >= def.purchasePrice ? 1 : 0.5 }}>
                        <Text className="text-xs font-bold" style={{ color: cash >= def.purchasePrice ? '#0D0D0D' : '#555' }}>
                          BUY {formatMoney(def.purchasePrice)}
                        </Text>
                      </Pressable>
                    </View>
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

