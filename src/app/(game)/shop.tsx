import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useGame } from '@/store/gameContext';
import { GameHeader } from '@/components/game/GameHeader';
import { SHOP_ITEMS, WEAPON_DEFINITIONS, DRUG_DEFINITIONS, HIGH_RISK_LOCATIONS } from '@/lib/game/gameData';
import { formatMoney } from '@/lib/game/gameEngine';

const C = {
  bg:         '#0A0A0F',
  surface:    '#13131A',
  border:     '#2A2A3A',
  gold:       '#F5C842',
  green:      '#4ADE80',
  red:        '#F87171',
  textPrimary:'#F1F0FF',
  textSub:    '#9B9BB8',
};

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
        style={{
          flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 8,
          backgroundColor: C.surface, borderWidth: 1, borderColor: qty > 0 ? C.gold : C.border, borderRadius: 10
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ color: C.textPrimary, fontWeight: '800', fontSize: 14 }}>{item.name}</Text>
          <Text style={{ color: C.textSub, fontSize: 12, marginTop: 4 }}>{itemDescription(item)}</Text>
        </View>
        <Text style={{ color: C.gold, fontWeight: '800', fontSize: 15, marginRight: 16 }}>
          {formatMoney(item.price)}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {qty > 0 && (
            <Pressable onPress={() => removeFromCart(item.id)} style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.gold, borderRadius: 6 }}>
              <Text style={{ color: C.gold, fontWeight: '800', fontSize: 20, marginTop: -2 }}>−</Text>
            </Pressable>
          )}
          {qty > 0 && <Text style={{ color: C.textPrimary, fontWeight: '800', width: 24, textAlign: 'center' }}>{qty}</Text>}
          <Pressable onPress={() => addToCart(item.id, item.price, catForCart)} style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: C.gold, borderRadius: 6 }}>
            <Text style={{ color: C.bg, fontWeight: '800', fontSize: 20, marginTop: -2 }}>+</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <GameHeader title="Shop" subtitle={`${location}`} extraStats={[{ label: 'Cash', value: formatMoney(cash) }]} />

      <ScrollView contentInsetAdjustmentBehavior="automatic">
        {/* ADDED SUBSTANTIAL BOTTOM PADDING SO THE CART DOES NOT GET CUT OFF */}
        <View style={{ padding: 16, paddingBottom: 160 }}> 

          {feedback && (
            <View style={{ marginBottom: 16, padding: 12, backgroundColor: feedback.includes('✅') ? '#0D1A0D' : '#1A0800', borderWidth: 1, borderColor: feedback.includes('✅') ? C.green : C.orange, borderRadius: 8 }}>
              <Text style={{ color: feedback.includes('✅') ? C.green : C.orange, fontSize: 13, fontWeight: '600' }}>{feedback}</Text>
            </View>
          )}

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {TAB_META.map(({ key, icon, label }) => (
                <Pressable
                  key={key}
                  onPress={() => setTab(key)}
                  style={{
                    alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16,
                    borderWidth: 1, borderRadius: 8,
                    borderColor: tab === key ? C.gold : (key === 'blackmarket' ? C.red : C.border),
                    backgroundColor: tab === key ? (key === 'blackmarket' ? '#1A0808' : '#1A1400') : C.surface,
                  }}
                >
                  <Text style={{ fontSize: 18 }}>{icon}</Text>
                  <Text style={{ fontSize: 10, fontWeight: '800', marginTop: 4, letterSpacing: 0.5, color: tab === key ? (key === 'blackmarket' ? '#FF4444' : C.gold) : (key === 'blackmarket' ? C.red : C.textSub) }}>
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* Black Market */}
          {tab === 'blackmarket' && (
            <>
              {!isHighRisk ? (
                <View style={{ padding: 24, alignItems: 'center', borderWidth: 1, borderColor: C.red, backgroundColor: '#1A0808', borderRadius: 10 }}>
                  <Text style={{ fontSize: 32, marginBottom: 12 }}>🚫</Text>
                  <Text style={{ fontWeight: '800', color: C.red, fontSize: 16, marginBottom: 8 }}>Black Market Unavailable</Text>
                  <Text style={{ color: C.textSub, fontSize: 13, textAlign: 'center' }}>Weapons and drugs are only available in high-risk locations.</Text>
                  <Text style={{ color: C.gold, fontSize: 12, textAlign: 'center', marginTop: 12 }}>Township · City · Informal Settlement</Text>
                </View>
              ) : (
                <>
                  <View style={{ marginBottom: 16, padding: 12, backgroundColor: '#1A0808', borderWidth: 1, borderColor: C.red, borderRadius: 8 }}>
                    <Text style={{ color: '#FF6B6B', fontSize: 12, fontWeight: '600' }}>⚠️ HIGH RISK. Firearms carry immediate arrest risk if found by police. Drug possession is illegal.</Text>
                  </View>

                  <Text style={{ color: C.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 }}>⚔️ WEAPONS</Text>
                  {WEAPON_DEFINITIONS.map(w => {
                    const cartItem = cart.find(c => c.itemId === w.id);
                    const qty = cartItem?.quantity ?? 0;
                    return (
                      <View key={w.id} style={{ flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 8, backgroundColor: C.surface, borderWidth: 1, borderColor: qty > 0 ? C.gold : (w.isFirearm ? C.red : C.border), borderRadius: 10 }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: C.textPrimary, fontWeight: '800', fontSize: 14 }}>{w.name}</Text>
                          <Text style={{ color: C.textSub, fontSize: 12, marginTop: 4 }}>{w.description}</Text>
                          <Text style={{ color: C.green, fontSize: 11, marginTop: 6, fontWeight: '600' }}>+{w.crimeSuccessBonus}% crime success</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end', marginRight: 16 }}>
                          <Text style={{ color: C.gold, fontWeight: '800', fontSize: 15 }}>{formatMoney(w.price)}</Text>
                          {w.isFirearm && <Text style={{ color: C.red, fontSize: 10, fontWeight: '800', marginTop: 4 }}>⚠️ FIREARM</Text>}
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          {qty > 0 && <Pressable onPress={() => removeFromCart(w.id)} style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.gold, borderRadius: 6 }}><Text style={{ color: C.gold, fontWeight: '800', fontSize: 20, marginTop: -2 }}>−</Text></Pressable>}
                          {qty > 0 && <Text style={{ color: C.textPrimary, fontWeight: '800', width: 24, textAlign: 'center' }}>{qty}</Text>}
                          <Pressable onPress={() => addToCart(w.id, w.price, 'blackmarket')} style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: '#3A2800', borderWidth: 1, borderColor: C.gold, borderRadius: 6 }}><Text style={{ color: C.gold, fontWeight: '800', fontSize: 20, marginTop: -2 }}>+</Text></Pressable>
                        </View>
                      </View>
                    );
                  })}
                </>
              )}
            </>
          )}

          {tab !== 'blackmarket' && tab !== 'farming' && tab !== 'livestock_medical' && (
            currentItems.map(item => <ItemRow key={item.id} item={item} />)
          )}

          {tab === 'farming' && (
            Object.entries(farmingGroups).map(([groupKey, items]) =>
              items.length > 0 ? (
                <View key={groupKey} style={{ marginBottom: 16 }}>
                  <Text style={{ color: C.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 }}>
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
              <View style={{ marginBottom: 16, padding: 12, backgroundColor: '#0A1200', borderWidth: 1, borderColor: C.green, borderRadius: 8 }}>
                <Text style={{ color: C.green, fontSize: 12, fontWeight: '600' }}>
                  💉 Veterinary medical kits treat sick or injured livestock. Each kit treats ONE individual animal. Kits are expensive — keep stock on hand to prevent losses.
                </Text>
              </View>
              <Text style={{ color: C.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 }}>🩺 LIVESTOCK MEDICAL KITS</Text>
              {medicalItems.length === 0 ? (
                <View style={{ padding: 24, alignItems: 'center', borderWidth: 1, borderColor: C.border, borderRadius: 10 }}>
                  <Text style={{ color: C.textSub, fontSize: 13 }}>No medical kits available.</Text>
                </View>
              ) : (
                medicalItems.map((item: any) => <ItemRow key={item.id} item={item} />)
              )}
            </View>
          )}

        </View>
      </ScrollView>

      {/* Cart (Fixed to bottom for easy checkout) */}
      {cart.length > 0 && (
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: C.bg, borderTopWidth: 1, borderTopColor: C.border, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 10 }}>
          <Text style={{ color: C.textPrimary, fontWeight: '800', marginBottom: 8, fontSize: 15 }}>🛒 Cart ({cart.length} item{cart.length !== 1 ? 's' : ''})</Text>
          <ScrollView style={{ maxHeight: 100 }}>
            {cart.map(c => {
              const item = [...allItems, ...WEAPON_DEFINITIONS, ...DRUG_DEFINITIONS].find(i => i.id === c.itemId);
              return (
                <View key={c.itemId} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ color: C.textSub, fontSize: 12 }}>{item?.name ?? c.itemId} ×{c.quantity}</Text>
                  <Text style={{ color: C.gold, fontSize: 12, fontWeight: '600' }}>{formatMoney(c.price * c.quantity)}</Text>
                </View>
              );
            })}
          </ScrollView>
          <View style={{ borderTopWidth: 1, borderTopColor: C.border, marginTop: 12, paddingTop: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ color: C.textPrimary, fontWeight: '800', fontSize: 16 }}>Total</Text>
              <Text style={{ color: canAfford ? C.green : C.red, fontWeight: '900', fontSize: 20 }}>
                {formatMoney(totalCost)}
              </Text>
            </View>
            <Pressable
              onPress={purchase}
              disabled={!canAfford}
              style={{ padding: 16, alignItems: 'center', borderRadius: 8, backgroundColor: canAfford ? C.gold : C.surface, opacity: canAfford ? 1 : 0.6 }}
            >
              <Text style={{ color: canAfford ? C.bg : C.textSub, fontWeight: '900', fontSize: 16, letterSpacing: 0.5 }}>
                {canAfford ? 'CHECKOUT NOW' : 'INSUFFICIENT FUNDS'}
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
