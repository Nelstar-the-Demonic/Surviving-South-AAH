import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useGame } from '@/store/gameContext';
import { GameHeader } from '@/components/game/GameHeader';
import { SHOP_ITEMS, WEAPON_DEFINITIONS, DRUG_DEFINITIONS, HIGH_RISK_LOCATIONS } from '@/lib/game/gameData';
import { formatMoney } from '@/lib/game/gameEngine';

type ShopCategory = 'food' | 'hygiene' | 'clothing' | 'farming' | 'livestock_medical' | 'blackmarket';

const TAB_META: { key: ShopCategory; icon: string; label: string }[] = [
  { key: 'food',            icon: '🍽️',  label: 'FOOD'        },
  { key: 'hygiene',         icon: '🧴',  label: 'HYGIENE'     },
  { key: 'clothing',        icon: '👕',  label: 'CLOTHING'    },
  { key: 'farming',         icon: '🌾',  label: 'FARMING'     },
  { key: 'livestock_medical', icon: '💉', label: 'VET'         },
  { key: 'blackmarket',     icon: '🔫',  label: 'BLACK MARKET'},
];

export default function Shop() {
  const { state, dispatch } = useGame();
  const [tab, setTab] = useState<ShopCategory>('food');
  const [cart, setCart] = useState<{ itemId: string; quantity: number; price: number; category: string }[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!state?.gameStarted) return null;
  const { cash, location } = state;

  const isHighRisk = HIGH_RISK_LOCATIONS.includes(location);

  function showFeedback(msg: string) {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  }

  function addToCart(itemId: string, price: number, category: string) {
    setCart(prev => {
      const existing = prev.find(c => c.itemId === itemId);
      if (existing) return prev.map(c => c.itemId === itemId ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { itemId, quantity: 1, price, category }];
    });
  }

  function removeFromCart(itemId: string) {
    setCart(prev => {
      const existing = prev.find(c => c.itemId === itemId);
      if (!existing) return prev;
      if (existing.quantity <= 1) return prev.filter(c => c.itemId !== itemId);
      return prev.map(c => c.itemId === itemId ? { ...c, quantity: c.quantity - 1 } : c);
    });
  }

  const totalCost = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const canAfford = cash >= totalCost;

  function purchase() {
    if (!canAfford || cart.length === 0) return;
    // Handle black market items separately
    const bmWeapons = cart.filter(c => WEAPON_DEFINITIONS.some(w => w.id === c.itemId));
    const bmDrugs   = cart.filter(c => DRUG_DEFINITIONS.some(d => d.id === c.itemId));
    const normalItems = cart.filter(c => !bmWeapons.includes(c) && !bmDrugs.includes(c));

    if (normalItems.length > 0) dispatch({ type: 'BUY_ITEMS', payload: normalItems });
    bmWeapons.forEach(w => { for (let i = 0; i < w.quantity; i++) dispatch({ type: 'BUY_WEAPON', payload: w.itemId }); });
    bmDrugs.forEach(d => { for (let i = 0; i < d.quantity; i++) dispatch({ type: 'BUY_DRUG', payload: d.itemId }); });

    setCart([]);
    showFeedback('✅ Purchase complete! Items added to inventory.');
  }

  const farmingItems = [...SHOP_ITEMS.farmEquipment, ...SHOP_ITEMS.farmInputs];
  const allItems = [...SHOP_ITEMS.food, ...SHOP_ITEMS.hygiene, ...SHOP_ITEMS.clothing, ...farmingItems];
  const currentItems = tab === 'farming' || tab === 'livestock_medical'
    ? []
    : tab === 'blackmarket'
    ? []
    : (SHOP_ITEMS[tab as 'food' | 'hygiene' | 'clothing'] ?? []) as typeof allItems;

  const medicalItems = (SHOP_ITEMS as any).livestock_medical ?? [];
  const farmingGroups: Record<string, typeof allItems> = tab === 'farming'
    ? {
        tools: SHOP_ITEMS.farmEquipment as typeof allItems,
        animal_feed: SHOP_ITEMS.farmInputs.filter(i => i.id.includes('feed')) as typeof allItems,
        fertilizer: SHOP_ITEMS.farmInputs.filter(i => i.id.includes('fertilizer')) as typeof allItems,
        pest_control: SHOP_ITEMS.farmInputs.filter(i => i.id.includes('pesticide') || i.id.includes('herbicide')) as typeof allItems,
      }
    : {};

  function itemDescription(item: typeof allItems[0]): string {
    const parts: string[] = [];
    if ('unit' in item && item.unit) parts.push(item.unit as string);
    if ('hungerRestore' in item && item.hungerRestore) parts.push(`+${item.hungerRestore} hunger`);
    if ('hygieneRestore' in item && item.hygieneRestore) parts.push(`+${item.hygieneRestore} hygiene`);
    if ('description' in item && item.description) parts.push(item.description as string);
    return parts.join('  ·  ');
  }

  function ItemRow({ item, bmOverride }: { item: typeof allItems[0]; bmOverride?: boolean }) {
    const cartItem = cart.find(c => c.itemId === item.id);
    const qty = cartItem?.quantity ?? 0;
    const catForCart = bmOverride ? 'blackmarket' : tab;
    return (
      <View
        className="mb-2 p-4 flex-row items-center"
        style={{ borderWidth: 1, borderColor: qty > 0 ? '#FFB81C' : '#1E1E1E', backgroundColor: '#0D0D0D' }}
      >
        <View className="flex-1">
          <Text className="text-foreground font-bold text-sm">{item.name}</Text>
          <Text className="text-muted-foreground text-xs mt-0.5">{itemDescription(item)}</Text>
        </View>
        <Text style={{ color: '#FFB81C' }} className="font-bold mr-3">{formatMoney(item.price)}</Text>
        <View className="flex-row items-center gap-2">
          {qty > 0 && (
            <Pressable onPress={() => removeFromCart(item.id)} className="w-8 h-8 items-center justify-center" style={{ borderWidth: 1, borderColor: '#FFB81C' }}>
              <Text style={{ color: '#FFB81C' }} className="font-bold text-lg">−</Text>
            </Pressable>
          )}
          {qty > 0 && <Text className="text-foreground font-bold w-6 text-center">{qty}</Text>}
          <Pressable onPress={() => addToCart(item.id, item.price, catForCart)} className="w-8 h-8 items-center justify-center" style={{ backgroundColor: '#FFB81C' }}>
            <Text className="font-bold text-lg" style={{ color: '#0D0D0D' }}>+</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <GameHeader title="Shop" subtitle={`${location}`} extraStats={[
        { label: 'Cash', value: formatMoney(cash) },
      ]} />

      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View className="px-4 pt-4 pb-10">

          {feedback && (
            <View className="mb-4 p-3" style={{ backgroundColor: feedback.includes('✅') ? '#0D1A0D' : '#1A0800', borderWidth: 1, borderColor: feedback.includes('✅') ? '#4CAF50' : '#FF9800' }}>
              <Text className="text-sm" style={{ color: feedback.includes('✅') ? '#4CAF50' : '#FF9800' }}>{feedback}</Text>
            </View>
          )}

          {/* Category tabs — scrollable row */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            <View className="flex-row gap-2">
              {TAB_META.map(({ key, icon, label }) => (
                <Pressable
                  key={key}
                  onPress={() => setTab(key)}
                  className="items-center py-2 px-3"
                  style={{
                    borderWidth: 1,
                    borderColor: tab === key ? '#FFB81C' : (key === 'blackmarket' ? '#E32636' : '#333'),
                    backgroundColor: tab === key ? (key === 'blackmarket' ? '#1A0000' : '#1A1400') : '#0D0D0D',
                  }}
                >
                  <Text className="text-base">{icon}</Text>
                  <Text className="text-xs font-bold mt-0.5" style={{ color: tab === key ? (key === 'blackmarket' ? '#FF4444' : '#FFB81C') : (key === 'blackmarket' ? '#E32636' : '#666') }}>
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* Black Market Tab */}
          {tab === 'blackmarket' && (
            <>
              {!isHighRisk ? (
                <View className="p-6 items-center" style={{ borderWidth: 1, borderColor: '#E32636', backgroundColor: '#1A0000' }}>
                  <Text className="text-3xl mb-3">🚫</Text>
                  <Text className="font-bold text-center mb-2" style={{ color: '#E32636' }}>Black Market Unavailable</Text>
                  <Text className="text-muted-foreground text-sm text-center">
                    Weapons and drugs are only available in high-risk locations:
                  </Text>
                  <Text className="text-xs text-center mt-2" style={{ color: '#FFB81C' }}>
                    Township · City · Informal Settlement
                  </Text>
                  <Text className="text-muted-foreground text-xs text-center mt-2">
                    Current location: {location}
                  </Text>
                </View>
              ) : (
                <>
                  <View className="mb-4 p-3" style={{ backgroundColor: '#1A0000', borderWidth: 1, borderColor: '#E32636' }}>
                    <Text className="text-xs" style={{ color: '#FF4444' }}>
                      ⚠️ Black Market — HIGH RISK. Firearms carry immediate arrest risk if found by police. Drug possession is illegal.
                    </Text>
                  </View>

                  <Text className="text-muted-foreground text-xs mb-2 tracking-wider">⚔️ WEAPONS</Text>
                  {WEAPON_DEFINITIONS.map(w => {
                    const cartItem = cart.find(c => c.itemId === w.id);
                    const qty = cartItem?.quantity ?? 0;
                    return (
                      <View key={w.id} className="mb-2 p-4" style={{ borderWidth: 1, borderColor: qty > 0 ? '#FFB81C' : (w.isFirearm ? '#E32636' : '#2A1A00'), backgroundColor: '#0D0D0D' }}>
                        <View className="flex-row items-start justify-between mb-1">
                          <View className="flex-1">
                            <Text className="text-foreground font-bold text-sm">{w.name}</Text>
                            <Text className="text-muted-foreground text-xs mt-0.5">{w.description}</Text>
                            <Text className="text-xs mt-1" style={{ color: '#4CAF50' }}>+{w.crimeSuccessBonus}% crime success</Text>
                          </View>
                          <View className="items-end">
                            <Text style={{ color: '#FFB81C' }} className="font-bold">{formatMoney(w.price)}</Text>
                            {w.isFirearm && <Text className="text-xs mt-1" style={{ color: '#E32636' }}>⚠️ FIREARM</Text>}
                          </View>
                        </View>
                        <View className="flex-row items-center justify-end gap-2 mt-2">
                          {qty > 0 && <Pressable onPress={() => removeFromCart(w.id)} className="w-8 h-8 items-center justify-center" style={{ borderWidth: 1, borderColor: '#FFB81C' }}>
                            <Text style={{ color: '#FFB81C' }} className="font-bold text-lg">−</Text>
                          </Pressable>}
                          {qty > 0 && <Text className="text-foreground font-bold w-6 text-center">{qty}</Text>}
                          <Pressable onPress={() => addToCart(w.id, w.price, 'blackmarket')} className="w-8 h-8 items-center justify-center" style={{ backgroundColor: '#3A1A00' }}>
                            <Text className="font-bold text-lg" style={{ color: '#FFB81C' }}>+</Text>
                          </Pressable>
                        </View>
                      </View>
                    );
                  })}

                  <Text className="text-muted-foreground text-xs mb-2 mt-4 tracking-wider">💊 DRUGS</Text>
                  {DRUG_DEFINITIONS.map(d => {
                    const cartItem = cart.find(c => c.itemId === d.id);
                    const qty = cartItem?.quantity ?? 0;
                    return (
                      <View key={d.id} className="mb-2 p-4" style={{ borderWidth: 1, borderColor: qty > 0 ? '#FFB81C' : '#2A0A2A', backgroundColor: '#0D0D0D' }}>
                        <View className="flex-row items-start justify-between mb-1">
                          <View className="flex-1">
                            <Text className="text-foreground font-bold text-sm">{d.name}</Text>
                            <Text className="text-muted-foreground text-xs mt-0.5">{d.description}</Text>
                            <Text className="text-xs mt-1" style={{ color: '#C77DFF' }}>Sell for ~{formatMoney(d.sellPrice)}</Text>
                          </View>
                          <Text style={{ color: '#FFB81C' }} className="font-bold">{formatMoney(d.price)}</Text>
                        </View>
                        <View className="flex-row items-center justify-end gap-2 mt-2">
                          {qty > 0 && <Pressable onPress={() => removeFromCart(d.id)} className="w-8 h-8 items-center justify-center" style={{ borderWidth: 1, borderColor: '#FFB81C' }}>
                            <Text style={{ color: '#FFB81C' }} className="font-bold text-lg">−</Text>
                          </Pressable>}
                          {qty > 0 && <Text className="text-foreground font-bold w-6 text-center">{qty}</Text>}
                          <Pressable onPress={() => addToCart(d.id, d.price, 'blackmarket')} className="w-8 h-8 items-center justify-center" style={{ backgroundColor: '#1A001A' }}>
                            <Text className="font-bold text-lg" style={{ color: '#C77DFF' }}>+</Text>
                          </Pressable>
                        </View>
                      </View>
                    );
                  })}
                </>
              )}
            </>
          )}

          {/* Normal shop tabs */}
          {tab !== 'blackmarket' && tab !== 'farming' && (
            currentItems.map(item => <ItemRow key={item.id} item={item} />)
          )}

          {tab === 'farming' && (
            Object.entries(farmingGroups).map(([groupKey, items]) =>
              items.length > 0 ? (
                <View key={groupKey} className="mb-4">
                  <Text className="text-muted-foreground text-xs mb-2 tracking-wider">
                    {groupKey === 'tools' ? '🪓 TOOLS & EQUIPMENT' :
                     groupKey === 'animal_feed' ? '🌾 ANIMAL FEED' :
                     groupKey === 'fertilizer' ? '🧪 FERTILIZERS' :
                     '💦 PEST & WEED CONTROL'}
                  </Text>
                  {items.map(item => <ItemRow key={item.id} item={item} />)}
                </View>
              ) : null
            )
          )}

          {tab === 'livestock_medical' && (
            <View>
              <View className="mb-4 p-3" style={{ backgroundColor: '#0A1200', borderWidth: 1, borderColor: '#4CAF50' }}>
                <Text className="text-xs" style={{ color: '#4CAF50' }}>
                  💉 Veterinary medical kits treat sick or injured livestock. Each kit treats ONE individual animal. Kits are expensive — keep stock on hand to prevent losses.
                </Text>
              </View>
              <Text className="text-muted-foreground text-xs mb-2 tracking-wider">🩺 LIVESTOCK MEDICAL KITS</Text>
              {medicalItems.length === 0 ? (
                <View className="p-6 items-center" style={{ borderWidth: 1, borderColor: '#333' }}>
                  <Text className="text-muted-foreground text-sm">No medical kits available.</Text>
                </View>
              ) : (
                medicalItems.map((item: any) => <ItemRow key={item.id} item={item} />)
              )}
            </View>
          )}

          {/* Cart / checkout */}
          {cart.length > 0 && (
            <View className="mt-4 p-4" style={{ borderWidth: 2, borderColor: '#FFB81C', backgroundColor: '#1A1400' }}>
              <Text className="text-foreground font-bold mb-2">Cart ({cart.length} item{cart.length !== 1 ? 's' : ''})</Text>
              {cart.map(c => {
                const item = [...allItems, ...WEAPON_DEFINITIONS, ...DRUG_DEFINITIONS].find(i => i.id === c.itemId);
                return (
                  <View key={c.itemId} className="flex-row justify-between mb-1">
                    <Text className="text-muted-foreground text-xs">{item?.name ?? c.itemId} ×{c.quantity}</Text>
                    <Text className="text-xs" style={{ color: '#FFB81C' }}>{formatMoney(c.price * c.quantity)}</Text>
                  </View>
                );
              })}
              <View className="border-t border-border mt-2 pt-2">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-foreground font-bold">Total</Text>
                  <Text className="font-bold text-lg" style={{ color: canAfford ? '#4CAF50' : '#E32636' }}>
                    {formatMoney(totalCost)}
                  </Text>
                </View>
                <Pressable
                  onPress={purchase}
                  disabled={!canAfford}
                  className="py-3 items-center"
                  style={{ backgroundColor: canAfford ? '#D4AF37' : '#333' }}
                >
                  <Text className="font-bold" style={{ color: canAfford ? '#0D0D0D' : '#666' }}>
                    {canAfford ? `BUY NOW — ${formatMoney(totalCost)}` : 'INSUFFICIENT FUNDS'}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

        </View>
      </ScrollView>
    </View>
  );
}
