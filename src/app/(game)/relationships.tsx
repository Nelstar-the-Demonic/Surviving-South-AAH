import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useGame } from '@/store/gameContext';
import { GameHeader } from '@/components/game/GameHeader';
import { InfoCard } from '@/components/game/InfoCard';
import type { NPC } from '@/types/game';

const REL_LABELS = ['Stranger', 'Acquaintance', 'Friend', 'Close Friend', 'Trusted Ally'];
function getRelLabel(l: number) { return l >= 80 ? REL_LABELS[4] : l >= 60 ? REL_LABELS[3] : l >= 40 ? REL_LABELS[2] : l >= 20 ? REL_LABELS[1] : REL_LABELS[0]; }
function getRelColor(l: number) { return l >= 70 ? '#4CAF50' : l >= 40 ? '#FFB81C' : l >= 20 ? '#FF9800' : '#E32636'; }

const BG_ICONS: Record<string, string> = { family: '👨‍👩‍👧', farmer: '🌾', business: '💼', professional: '🎓', hustler: '⚡', gangster: '💀', dealer: '💊', criminal: '🔪', neighbour: '🏘️', default: '👤' };
const ROMANCE_LABELS: Record<string, string> = { none: '', interest: '❤️ Interest', dating: '💕 Dating', partner: '💍 Partner' };

function NpcCard({ npc, onInteract, onFlirt, onRomance, onBenefit, onRemove, onGift }: {
  npc: NPC;
  onInteract: (id: string, action: 'greet' | 'help' | 'conflict') => void;
  onFlirt: (id: string) => void;
  onRomance: (id: string) => void;
  onBenefit: (id: string, benefit: string) => void;
  onRemove: (id: string) => void;
  onGift: (id: string) => void;
}) {
  const bgIcon = BG_ICONS[npc.npcBackground ?? 'default'] ?? BG_ICONS.default;
  const relLabel = getRelLabel(npc.relationshipLevel);
  const relColor = getRelColor(npc.relationshipLevel);
  const romanceLabel = ROMANCE_LABELS[npc.romanticStage ?? 'none'];
  const isAdult = (npc.age ?? 25) >= 18;
  const canFlirt = isAdult && !npc.hasFlirted && (npc.romanticStage === 'none' || !npc.romanticStage) && npc.relationshipLevel >= 30 && !npc.isPermanent;
  const canAdvanceRomance = isAdult && (npc.romanticStage === 'interest' || npc.romanticStage === 'dating');
  const canBenefit = npc.relationshipLevel >= 40 && (npc.canOffer?.length ?? 0) > 0;

  return (
    <View className="mb-3 p-4" style={{ borderWidth: 1, borderColor: npc.romanticStage === 'partner' ? '#FF69B4' : npc.relationshipLevel >= 60 ? '#D4AF37' : '#1E1E1E', backgroundColor: '#0D0D0D' }}>
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-row items-center gap-3 flex-1">
          <Text className="text-3xl">{bgIcon}</Text>
          <View className="flex-1">
            <View className="flex-row items-center gap-2 flex-wrap">
              <Text className="text-foreground font-bold text-sm">{npc.name}</Text>
              {romanceLabel ? <Text className="text-xs" style={{ color: '#FF69B4' }}>{romanceLabel}</Text> : null}
              {npc.isPermanent && <Text className="text-xs px-1.5" style={{ backgroundColor: '#1A1400', color: '#D4AF37', borderWidth: 1, borderColor: '#3A2A00' }}>FAMILY</Text>}
            </View>
            <Text className="text-muted-foreground text-xs">{npc.age ? `Age ${npc.age} · ` : ''}{npc.role ?? npc.npcBackground ?? 'Unknown'}</Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-xs font-bold" style={{ color: relColor }}>{relLabel}</Text>
          <Text className="text-xs" style={{ color: relColor }}>{npc.relationshipLevel}/100</Text>
        </View>
      </View>
      <View className="h-1.5 bg-secondary mb-3">
        <View className="h-1.5" style={{ width: `${npc.relationshipLevel}%`, backgroundColor: relColor }} />
      </View>
      {(npc.canOffer?.length ?? 0) > 0 && (
        <View className="flex-row flex-wrap gap-1 mb-3">
          {npc.canOffer!.slice(0, 3).map(offer => (
            <View key={offer} className="px-2 py-0.5" style={{ backgroundColor: '#1A1400', borderWidth: 1, borderColor: '#3A2A00' }}>
              <Text className="text-xs" style={{ color: '#D4AF37' }}>{offer}</Text>
            </View>
          ))}
        </View>
      )}
      <View className="flex-row gap-2 flex-wrap">
        <Pressable onPress={() => onInteract(npc.id, 'greet')} className="px-3 py-1.5" style={{ backgroundColor: '#0D1A0D', borderWidth: 1, borderColor: '#4CAF50' }}>
          <Text className="text-xs font-bold" style={{ color: '#4CAF50' }}>👋 Greet</Text>
        </Pressable>
        <Pressable onPress={() => onInteract(npc.id, 'help')} className="px-3 py-1.5" style={{ backgroundColor: '#0A0D1A', borderWidth: 1, borderColor: '#64B5F6' }}>
          <Text className="text-xs font-bold" style={{ color: '#64B5F6' }}>🤝 Help</Text>
        </Pressable>
        <Pressable onPress={() => onGift(npc.id)} className="px-3 py-1.5" style={{ backgroundColor: '#1A1400', borderWidth: 1, borderColor: '#FFB81C' }}>
          <Text className="text-xs font-bold" style={{ color: '#FFB81C' }}>🎁 Gift</Text>
        </Pressable>
        {canFlirt && (
          <Pressable onPress={() => onFlirt(npc.id)} className="px-3 py-1.5" style={{ backgroundColor: '#1A0010', borderWidth: 1, borderColor: '#FF69B4' }}>
            <Text className="text-xs font-bold" style={{ color: '#FF69B4' }}>😉 Flirt</Text>
          </Pressable>
        )}
        {canAdvanceRomance && (
          <Pressable onPress={() => onRomance(npc.id)} className="px-3 py-1.5" style={{ backgroundColor: '#1A0010', borderWidth: 1, borderColor: '#FF69B4' }}>
            <Text className="text-xs font-bold" style={{ color: '#FF69B4' }}>{npc.romanticStage === 'interest' ? '💕 Ask Out' : '💍 Commit'}</Text>
          </Pressable>
        )}
        {canBenefit && (
          <Pressable onPress={() => onBenefit(npc.id, npc.canOffer![0])} className="px-3 py-1.5" style={{ backgroundColor: '#1A1400', borderWidth: 1, borderColor: '#D4AF37' }}>
            <Text className="text-xs font-bold" style={{ color: '#D4AF37' }}>⭐ Favour</Text>
          </Pressable>
        )}
        {!npc.isPermanent && (
          <Pressable onPress={() => onRemove(npc.id)} className="px-3 py-1.5" style={{ backgroundColor: '#1A0000', borderWidth: 1, borderColor: '#E32636' }}>
            <Text className="text-xs font-bold" style={{ color: '#E32636' }}>✕ Remove</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

export default function Relationships() {
  const { state, dispatch } = useGame();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [giftTargetId, setGiftTargetId] = useState<string | null>(null);

  if (!state?.gameStarted) return null;
  const { npcs, stats, inventory } = state;

  function showFeedback(msg: string) { setFeedback(msg); setTimeout(() => setFeedback(null), 2500); }
  function interact(npcId: string, action: 'greet' | 'help' | 'conflict') {
    dispatch({ type: 'INTERACT_NPC', payload: { npcId, action } });
    showFeedback(action === 'greet' ? '👋 Greeted. Relationship improved.' : action === 'help' ? '🤝 Helped them out. Friendship grew.' : '⚠️ Conflict! Relationship damaged.');
  }
  function flirtNpc(npcId: string) { dispatch({ type: 'FLIRT_NPC', payload: npcId }); showFeedback('😉 You flirted. Watch Events for their response.'); }
  function advanceRomance(npcId: string) { dispatch({ type: 'ADVANCE_ROMANCE', payload: npcId }); showFeedback('❤️ Romantic status updated!'); }
  function applyBenefit(npcId: string, benefit: string) { dispatch({ type: 'NPC_BENEFIT', payload: { npcId, benefit } }); showFeedback('✅ Benefit applied. Check Events.'); }
  function removeNpc(npcId: string) { dispatch({ type: 'REMOVE_NPC', payload: npcId }); showFeedback('Contact removed from your network.'); }
  function handleGift(itemId: string, itemName: string) {
    if (!giftTargetId) return;
    dispatch({ type: 'GIFT_NPC', payload: { npcId: giftTargetId, itemId } });
    showFeedback(`🎁 Gave ${itemName} as a gift!`);
    setGiftTargetId(null);
  }

  const permanentNpcs = npcs.filter(n => n.isPermanent);
  const partnerNpc = npcs.find(n => n.romanticStage === 'partner');
  const romanticNpcs = npcs.filter(n => ['interest', 'dating'].includes(n.romanticStage ?? ''));
  const contactNpcs = npcs.filter(n => !n.isPermanent && (n.romanticStage === 'none' || !n.romanticStage));
  const totalNpcs = npcs.length;
  const maxNpcs = 7;
  const slotsLeft = maxNpcs - totalNpcs;
  const isFeedbackWarn = !!(feedback?.includes('⚠️') || feedback?.includes('removed') || feedback?.includes('Contact removed'));

  return (
    <View className="flex-1 bg-background">
      <GameHeader
        title="Relationships"
        subtitle="Family, friends & associates"
        extraStats={[
          { label: 'Contacts', value: `${totalNpcs}/${maxNpcs}`, color: slotsLeft <= 1 ? '#E32636' : '#FFB81C' },
          { label: 'Happiness', value: String(stats.happiness), color: stats.happiness >= 60 ? '#4CAF50' : '#FFB81C' },
          { label: 'Partner', value: partnerNpc ? partnerNpc.name : 'None', color: partnerNpc ? '#FF69B4' : '#888' },
        ]}
      />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View className="px-4 pt-4 pb-10">
          {feedback && (
            <View className="mb-4 p-3" style={{ backgroundColor: isFeedbackWarn ? '#1A0A00' : '#0D1A0D', borderWidth: 1, borderColor: isFeedbackWarn ? '#FFB81C' : '#4CAF50' }}>
              <Text className="text-sm" style={{ color: isFeedbackWarn ? '#FFB81C' : '#4CAF50' }}>{feedback}</Text>
            </View>
          )}

          <View className="mb-4 p-3 flex-row items-center justify-between" style={{ borderWidth: 1, borderColor: slotsLeft <= 0 ? '#E32636' : '#333', backgroundColor: '#0D0D0D' }}>
            <Text className="text-muted-foreground text-xs">Slots: {totalNpcs}/{maxNpcs} · 4 permanent · {contactNpcs.length}/3 dynamic</Text>
            <Text className="text-xs font-bold" style={{ color: slotsLeft <= 0 ? '#E32636' : slotsLeft <= 1 ? '#FF9800' : '#4CAF50' }}>{slotsLeft <= 0 ? 'FULL' : `${slotsLeft} open`}</Text>
          </View>

          <InfoCard>
            <Text className="text-muted-foreground text-xs leading-5">
              💡 Socialise daily (25% chance to meet someone). Accept contact in the Event popup. Flirt when rel ≥ 30. Max 7 total (4 family + 3 dynamic). Remove dynamic contacts to make space.
            </Text>
          </InfoCard>

          {partnerNpc && (
            <>
              <Text className="text-muted-foreground text-xs mb-2 mt-3 tracking-wider">💍 PARTNER</Text>
              <NpcCard npc={partnerNpc} onInteract={interact} onFlirt={flirtNpc} onRomance={advanceRomance} onBenefit={applyBenefit} onRemove={removeNpc} onGift={setGiftTargetId} />
            </>
          )}
          {romanticNpcs.length > 0 && (
            <>
              <Text className="text-muted-foreground text-xs mb-2 mt-3 tracking-wider">❤️ ROMANTIC INTERESTS</Text>
              {romanticNpcs.map(npc => <NpcCard key={npc.id} npc={npc} onInteract={interact} onFlirt={flirtNpc} onRomance={advanceRomance} onBenefit={applyBenefit} onRemove={removeNpc} onGift={setGiftTargetId} />)}
            </>
          )}

          <Text className="text-muted-foreground text-xs mb-2 mt-3 tracking-wider">FAMILY & NEIGHBOURS</Text>
          {permanentNpcs.length === 0
            ? <InfoCard><Text className="text-muted-foreground text-xs">No permanent contacts loaded.</Text></InfoCard>
            : permanentNpcs.map(npc => <NpcCard key={npc.id} npc={npc} onInteract={interact} onFlirt={flirtNpc} onRomance={advanceRomance} onBenefit={applyBenefit} onRemove={removeNpc} onGift={setGiftTargetId} />)
          }

          <Text className="text-muted-foreground text-xs mb-2 mt-3 tracking-wider">CONTACTS ({contactNpcs.length}/3)</Text>
          {contactNpcs.length === 0
            ? <InfoCard><Text className="text-muted-foreground text-sm text-center py-2">No contacts yet.{'\n'}Socialise daily to meet people in your area.</Text></InfoCard>
            : contactNpcs.map(npc => <NpcCard key={npc.id} npc={npc} onInteract={interact} onFlirt={flirtNpc} onRomance={advanceRomance} onBenefit={applyBenefit} onRemove={removeNpc} onGift={setGiftTargetId} />)
          }
        </View>
      </ScrollView>

      {giftTargetId && (
        <View className="absolute inset-0 justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
          <View className="bg-background max-h-3/4 p-4 rounded-xl border border-warning">
            <Text className="text-warning text-lg font-bold text-center mb-4">Select a Gift</Text>
            <ScrollView className="mb-4">
              {inventory.filter(i => i.quantity > 0).length === 0 ? (
                <Text className="text-muted-foreground text-center py-4">Your inventory is empty.</Text>
              ) : (
                inventory.filter(i => i.quantity > 0).map(item => (
                  <Pressable
                    key={item.id}
                    onPress={() => handleGift(item.id, item.name)}
                    className="p-3 mb-2 flex-row justify-between items-center"
                    style={{ backgroundColor: '#111', borderWidth: 1, borderColor: '#333' }}
                  >
                    <View>
                      <Text className="text-foreground font-bold">{item.name}</Text>
                      <Text className="text-muted-foreground text-xs">Value: R{item.sellPrice ?? 0}</Text>
                    </View>
                    <Text className="text-warning font-bold">GIVE</Text>
                  </Pressable>
                ))
              )}
            </ScrollView>
            <Pressable onPress={() => setGiftTargetId(null)} className="py-3 items-center" style={{ backgroundColor: '#1A0000', borderWidth: 1, borderColor: '#E32636' }}>
              <Text className="text-destructive font-bold">CANCEL</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
