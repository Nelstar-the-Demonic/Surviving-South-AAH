import { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useGame } from '@/store/gameContext';
import { GameHeader } from '@/components/game/GameHeader';
import { CROP_DEFINITIONS, LIVESTOCK_DEFINITIONS, ORCHARD_DEFINITIONS } from '@/lib/game/gameData';
import { formatMoney, getSASeason } from '@/lib/game/gameEngine';
import { useLocationTheme } from '@/lib/locationTheme';

const STAGE_COLORS: Record<string, string> = {
  seedling: '#8BC34A',
  growing:  '#4CAF50',
  ready:    '#FFB81C',
};

export default function Farming() {
  const router = useRouter();
  const { state, dispatch } = useGame();
  const locTheme = useLocationTheme();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [tab, setTab] = useState<'crops' | 'orchard' | 'livestock' | 'labor' | 'harvest' | 'produce'>('crops');
  const [sellQty, setSellQty] = useState<Record<string, string>>({});

  if (!state?.gameStarted) return null;
  const { properties, location, cropPlots, livestock, inventory, cash, farmLaborers, day, orchardPlots } = state;

  const hasFarm = properties.some(p => p.type === 'Farm') || location === 'Farm';
  const season = getSASeason(day);

  function showFeedback(msg: string) {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  }

  // ── Farm inventory helpers ──
  const feedBags     = inventory.find(i => i.id === 'animal_feed_bag')?.quantity ?? 0;
  const fertBags     = inventory.find(i => i.id === 'fertilizer_bag')?.quantity ?? 0;
  const hasHoe       = inventory.some(i => i.id === 'hoe' && i.quantity > 0);
  const hasSprayer   = inventory.some(i => i.id === 'sprayer' && i.quantity > 0);
  const hasPesticide = inventory.some(i => i.id === 'pesticide_bottle' && i.quantity > 0);
  const hasIrrigation= inventory.some(i => i.id === 'irrigation_pipe' && i.quantity > 0);
  const harvestItems = inventory.filter(i => i.category === 'harvest' && i.quantity > 0);
  const produceItems = inventory.filter(i => i.category === 'livestock_product' && i.quantity > 0);
  const cannabisHarvest = inventory.filter(i => i.name === 'Cannabis' && i.quantity > 0);

  // ── Actions ──
  function plantCrop(cropType: string, seedItemId?: string) {
    const def = CROP_DEFINITIONS[cropType as keyof typeof CROP_DEFINITIONS];
    if (!def) return;
    if (!seedItemId && cash < def.seedCost) { showFeedback(`⚠️ Need ${formatMoney(def.seedCost)} for seeds.`); return; }
    dispatch({ type: 'PLANT_CROP', payload: { cropType, seedItemId } });
    if (seedItemId) {
      showFeedback(`✅ Planted special seeds. Faster growth, bigger yield.`);
    } else {
      showFeedback(`✅ Planted ${cropType}. Ready in ${def.daysToHarvest} days.`);
    }
  }

  function harvestCrop(plotId: string) {
    dispatch({ type: 'HARVEST_CROP', payload: plotId });
    showFeedback('✅ Harvested! Check harvest & produce tabs.');
  }

  function applyFertilizer(plotId: string) {
    if (fertBags <= 0) { showFeedback('⚠️ No fertilizer. Buy from Shop → Farming.'); return; }
    dispatch({ type: 'APPLY_FERTILIZER', payload: plotId });
    showFeedback('✅ Fertilizer applied. Yield +20%.');
  }

  function weedPlot(plotId: string) {
    if (!hasHoe) { showFeedback('⚠️ Need a Garden Hoe from Shop → Farming.'); return; }
    dispatch({ type: 'WEED_CROP', payload: plotId });
    showFeedback('✅ Plot weeded. Crop health restored.');
  }

  function clearEvent(plotId: string) {
    if (!hasSprayer) { showFeedback('⚠️ Need a Sprayer from Shop → Farming.'); return; }
    if (!hasPesticide) { showFeedback('⚠️ Need Pesticide/Herbicide from Shop → Farming.'); return; }
    dispatch({ type: 'CLEAR_FARM_EVENT', payload: plotId });
    showFeedback('✅ Pest/disease treated.');
  }

  function applyFeed(livestockType: string) {
    if (feedBags <= 0) { showFeedback('⚠️ No animal feed. Buy from Shop → Farming.'); return; }
    dispatch({ type: 'APPLY_ANIMAL_FEED', payload: { livestockType, feedKg: 25 } });
    showFeedback(`✅ Feed applied to ${livestockType}. Produce boosted for 30 days.`);
  }

  function buyLivestock(type: string, isMale: boolean) {
    const def = LIVESTOCK_DEFINITIONS[type as keyof typeof LIVESTOCK_DEFINITIONS];
    if (!def) return;
    if (cash < def.buyCost) { showFeedback(`⚠️ Need ${formatMoney(def.buyCost)}.`); return; }
    dispatch({ type: 'BUY_LIVESTOCK', payload: { type, isMale } });
    showFeedback(`✅ Bought ${isMale ? '♂' : '♀'} ${type}.`);
  }

  function plantOrchard(treeType: string) {
    const def = ORCHARD_DEFINITIONS[treeType];
    if (!def) return;
    const cost = def.pricePerPlot;
    if (cash < cost) { showFeedback(`⚠️ Need ${formatMoney(cost)} for ${treeType} seedling.`); return; }
    dispatch({ type: 'PLANT_ORCHARD', payload: { treeType, cost } });
    showFeedback(`✅ Planted ${treeType}. Matures in ~${def.matureAfterDays} days, then harvests every ${def.harvestIntervalDays} days.`);
  }

  function harvestOrchard(plotId: string) {
    dispatch({ type: 'HARVEST_ORCHARD', payload: plotId });
    showFeedback('✅ Fruit harvested! Added to inventory. Tree will produce again next cycle.');
  }

  function buyOrchardPlot() {
    if (cash < 5000) { showFeedback('⚠️ Orchard plot costs R5,000.'); return; }
    dispatch({ type: 'BUY_ORCHARD_PLOT' });
    showFeedback('✅ Orchard plot purchased. You can now plant a fruit tree.');
  }

  function slaughterMale(type: string) {
    const group = livestock.find(g => g.type === type);
    if (!group || group.males === 0) { showFeedback(`⚠️ No male ${type} to slaughter.`); return; }
    dispatch({ type: 'SLAUGHTER_LIVESTOCK', payload: { type, isMale: true } });
    showFeedback(`✅ Male ${type} slaughtered. Meat added to inventory.`);
  }

  function slaughterFemale(type: string) {
    const group = livestock.find(g => g.type === type);
    if (!group || group.females === 0) { showFeedback(`⚠️ No female ${type} to slaughter.`); return; }
    const totalFemales = group.females;
    const pregnantCount = group.pregnantFemales ?? 0;
    const breedingFemalesNeeded = 2;
    if (totalFemales - pregnantCount <= breedingFemalesNeeded) {
      showFeedback(`⚠️ Protect breeding females. Keep at least ${breedingFemalesNeeded} non-pregnant females.`);
      return;
    }
    dispatch({ type: 'SLAUGHTER_LIVESTOCK', payload: { type, isMale: false } });
    showFeedback(`✅ Female ${type} slaughtered. Meat added to inventory.`);
  }

  function sellHarvestItem(itemId: string, qty: number) {
    dispatch({ type: 'SELL_HARVEST', payload: { itemId, quantity: qty } });
    showFeedback('✅ Harvest sold for cash.');
  }

  function sellProduceItem(itemId: string, qty: number) {
    if (qty <= 0) { showFeedback('⚠️ Enter a valid quantity.'); return; }
    dispatch({ type: 'SELL_LIVESTOCK_PRODUCE', payload: { itemId, quantity: qty } });
    showFeedback(`✅ Sold ${qty} ${itemId.includes('egg') ? 'eggs' : 'L milk'}.`);
  }

  function sellCannabis(qty: number) {
    if (qty <= 0) { showFeedback('⚠️ Enter a valid quantity.'); return; }
    dispatch({ type: 'SELL_CANNABIS_HARVEST', payload: qty });
    showFeedback('⚡ Cannabis sale attempted… check events.');
  }

  function applyAI(livestockType: string) {
    if (cash < 3000) { showFeedback('⚠️ Artificial Insemination costs R3,000.'); return; }
    dispatch({ type: 'PERFORM_AI', payload: livestockType });
    showFeedback(`✅ AI performed on ${livestockType}. Pregnancy started!`);
  }

  function treatSick(livestockType: string, count: number) {
    const kitId = `medkit_${livestockType.toLowerCase()}`;
    const kitInInv = inventory.find(i => i.id === kitId && i.quantity > 0);
    if (!kitInInv) {
      showFeedback(`⚠️ No ${livestockType} Medical Kit in inventory. Buy from Shop → Vet.`);
      return;
    }
    if (count <= 0) { showFeedback('⚠️ No sick or injured animals to treat.'); return; }
    dispatch({ type: 'TREAT_LIVESTOCK', payload: { livestockType, count: 1 } });
    showFeedback(`✅ Treated 1 ${livestockType}. Kit used.`);
  }

  function hireLaborer() {
    dispatch({ type: 'HIRE_FARM_LABORER' });
    showFeedback('✅ Farm worker hired at R100/day. They handle weeding, irrigation & pest control when equipped.');
  }

  function fireLaborer(id: string) {
    dispatch({ type: 'FIRE_FARM_LABORER', payload: id });
    showFeedback('Worker dismissed.');
  }

  const seasonColor: Record<string, string> = { Summer: '#FF6B35', Spring: '#8BC34A', Autumn: '#FF9800', Winter: '#64B5F6' };

  if (!hasFarm) {
    return (
      <View style={{ flex: 1, backgroundColor: locTheme.bg }}>
        <GameHeader title="Farming" />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-6xl mb-4">🌾</Text>
          <Text className="text-foreground text-xl font-bold text-center mb-3">No Farm</Text>
          <Text className="text-muted-foreground text-center text-sm mb-6">
            Farming requires owning a Farm property or being at a Farm location.
          </Text>
          <Pressable
            onPress={() => router.push('/(game)/property')}
            className="py-3 px-6"
            style={{ borderWidth: 1, borderColor: '#FFB81C' }}
          >
            <Text style={{ color: '#FFB81C' }} className="font-bold">View Properties →</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: locTheme.bg }}>
      <GameHeader title="Farming" subtitle="Crops, livestock & produce management" extraStats={[
        { label: 'Plots', value: String(cropPlots.length) },
        { label: 'Livestock', value: String(livestock.reduce((s, g) => s + g.males + g.females, 0)) },
        { label: 'Produce', value: String(produceItems.length) },
      ]} />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View className="px-4 pt-4 pb-10">

          {feedback && (
            <View className="mb-4 p-3" style={{
              backgroundColor: feedback.includes('✅') ? '#0D1A0D' : '#1A0A00',
              borderWidth: 1,
              borderColor: feedback.includes('✅') ? '#4CAF50' : '#FFB81C',
            }}>
              <Text className="text-sm" style={{ color: feedback.includes('✅') ? '#4CAF50' : '#FFB81C' }}>{feedback}</Text>
            </View>
          )}

          {/* Season + quick inventory bar */}
          <View className="mb-4 p-3 flex-row flex-wrap gap-3 items-center"
            style={{ backgroundColor: '#0A0800', borderWidth: 1, borderColor: '#333' }}>
            <Text className="text-xs font-bold" style={{ color: seasonColor[season] }}>🌍 {season.toUpperCase()}</Text>
            <Text className="text-xs" style={{ color: fertBags > 0 ? '#4CAF50' : '#555' }}>🧪 Fertilizer ×{fertBags}</Text>
            <Text className="text-xs" style={{ color: feedBags > 0 ? '#4CAF50' : '#555' }}>🐄 Feed ×{feedBags}</Text>
            <Text className="text-xs" style={{ color: hasHoe ? '#4CAF50' : '#555' }}>🪓 Hoe: {hasHoe ? 'Yes' : 'No'}</Text>
            <Text className="text-xs" style={{ color: hasSprayer ? '#4CAF50' : '#555' }}>💦 Sprayer: {hasSprayer ? 'Yes' : 'No'}</Text>
            <Text className="text-xs" style={{ color: hasIrrigation ? '#4CAF50' : '#555' }}>🚿 Irrigation: {hasIrrigation ? 'Yes' : 'No'}</Text>
          </View>

          {/* Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            <View className="flex-row gap-1.5">
              {([
                { key: 'crops',    label: `🌱 CROPS (${cropPlots.length})` },
                { key: 'orchard',  label: `🍎 ORCHARD (${(orchardPlots ?? []).length})` },
                { key: 'livestock',label: '🐄 LIVESTOCK' },
                { key: 'produce',  label: `🥚 PRODUCE (${produceItems.length + cannabisHarvest.length})` },
                { key: 'harvest',  label: `📦 HARVEST (${harvestItems.length})` },
                { key: 'labor',    label: `👷 LABOUR (${(farmLaborers ?? []).length})` },
              ] as const).map(({ key, label }) => (
                <Pressable
                  key={key}
                  onPress={() => setTab(key)}
                  className="items-center py-2 px-3"
                  style={{ borderWidth: 1, borderColor: tab === key ? '#FFB81C' : '#333', backgroundColor: tab === key ? '#1A1400' : '#0D0D0D' }}
                >
                  <Text className="text-xs font-bold" style={{ color: tab === key ? '#FFB81C' : '#666' }}>{label}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* ── CROPS TAB ── */}
          {tab === 'crops' && (
            <>
              {/* Plot ownership info + buy button */}
              <View className="mb-4 p-3 flex-row items-center justify-between"
                style={{ backgroundColor: '#0A0800', borderWidth: 1, borderColor: '#333' }}>
                <View>
                  <Text className="text-foreground text-sm font-bold">
                    Plots Owned: {state.cropPlotsOwned ?? 0}
                  </Text>
                  <Text className="text-muted-foreground text-xs">
                    In use: {cropPlots.length} · Available: {Math.max(0, (state.cropPlotsOwned ?? 0) - cropPlots.length)}
                  </Text>
                </View>
                <Pressable
                  onPress={() => {
                    if (cash < 2500) { showFeedback('⚠️ Crop plot costs R2,500.'); return; }
                    dispatch({ type: 'BUY_CROP_PLOT' });
                    showFeedback('✅ Crop plot purchased. Plant a crop to use it.');
                  }}
                  className="py-2 px-3"
                  style={{ backgroundColor: cash >= 2500 ? '#FFB81C' : '#222' }}
                >
                  <Text className="font-bold text-xs" style={{ color: cash >= 2500 ? '#0D0D0D' : '#555' }}>
                    BUY PLOT R2,500
                  </Text>
                </Pressable>
              </View>

              {cropPlots.length > 0 && (
                <View className="mb-4">
                  {/* Harvest All button */}
                  {cropPlots.some(p => p.stage === 'ready') && (
                    <Pressable
                      onPress={() => {
                        dispatch({ type: 'HARVEST_ALL_CROPS' });
                        showFeedback(`✅ All ready crops harvested! Plots returned to available pool.`);
                      }}
                      className="mb-3 py-3 items-center"
                      style={{ backgroundColor: '#FFB81C' }}
                    >
                      <Text className="font-bold text-sm" style={{ color: '#0D0D0D' }}>
                        🌾 HARVEST ALL ({cropPlots.filter(p => p.stage === 'ready').length} READY)
                      </Text>
                    </Pressable>
                  )}

                  <Text className="text-muted-foreground text-xs mb-2 tracking-wider">ACTIVE PLOTS</Text>
                  {cropPlots.map(plot => (
                    <View key={plot.id} className="mb-3 p-4" style={{ borderWidth: 1, borderColor: plot.hasFarmEvent ? '#E32636' : (STAGE_COLORS[plot.stage] || '#333'), backgroundColor: '#0D0D0D' }}>
                      <View className="flex-row items-center justify-between mb-1">
                        <Text className="text-foreground font-bold">{plot.cropType}</Text>
                        <Text className="text-sm font-bold" style={{ color: plot.hasFarmEvent ? '#E32636' : STAGE_COLORS[plot.stage] }}>
                          {plot.hasFarmEvent ? `⚠️ ${plot.farmEventType === 'pest_infestation' ? 'PEST INFESTATION' : 'DISEASE'}` : plot.stage.toUpperCase()}
                        </Text>
                      </View>
                      <Text className="text-muted-foreground text-xs mb-2">
                        Day {plot.daysPlanted}/{plot.daysToHarvest} · Yield boost: {plot.yieldBoostPct > 0 ? '+' : ''}{plot.yieldBoostPct}%
                        {plot.fertilizerApplied ? ' · 🧪 Fertilized' : ''}
                      </Text>
                      <View className="h-1.5 bg-secondary mb-3">
                        <View className="h-1.5" style={{ width: `${Math.min(100, (plot.daysPlanted / plot.daysToHarvest) * 100)}%`, backgroundColor: STAGE_COLORS[plot.stage] }} />
                      </View>
                      <View className="flex-row flex-wrap gap-2 mb-3">
                        {plot.needsWeeding && <Text className="text-xs px-2 py-0.5" style={{ backgroundColor: '#2A1F00', color: '#FFB81C' }}>🌿 Needs Weeding</Text>}
                        {plot.needsWater   && <Text className="text-xs px-2 py-0.5" style={{ backgroundColor: '#001A2A', color: '#64B5F6' }}>💧 Needs Water</Text>}
                        {plot.needsFertilizer && !plot.fertilizerApplied && <Text className="text-xs px-2 py-0.5" style={{ backgroundColor: '#0A1200', color: '#8BC34A' }}>🧪 Needs Fertilizer</Text>}
                        {plot.cropType === 'Cannabis' && <Text className="text-xs px-2 py-0.5" style={{ backgroundColor: '#1A0A1A', color: '#C77DFF' }}>🌿 High Value — Illegal</Text>}
                      </View>
                      <View className="flex-row flex-wrap gap-2">
                        {plot.stage === 'ready' && (
                          <Pressable onPress={() => harvestCrop(plot.id)} className="flex-1 py-2 items-center" style={{ backgroundColor: '#FFB81C' }}>
                            <Text className="font-bold text-xs" style={{ color: '#0D0D0D' }}>HARVEST</Text>
                          </Pressable>
                        )}
                        {plot.hasFarmEvent && (
                          <Pressable onPress={() => clearEvent(plot.id)} className="flex-1 py-2 items-center" style={{ borderWidth: 1, borderColor: '#E32636' }}>
                            <Text className="font-bold text-xs" style={{ color: '#E32636' }}>TREAT PEST/DISEASE</Text>
                          </Pressable>
                        )}
                        {plot.needsWeeding && !plot.hasFarmEvent && (
                          <Pressable onPress={() => weedPlot(plot.id)} className="flex-1 py-2 items-center" style={{ borderWidth: 1, borderColor: '#FFB81C' }}>
                            <Text className="font-bold text-xs" style={{ color: '#FFB81C' }}>WEED PLOT</Text>
                          </Pressable>
                        )}
                        {!plot.fertilizerApplied && plot.stage !== 'ready' && plot.stage !== 'harvested' && (
                          <Pressable onPress={() => applyFertilizer(plot.id)} className="flex-1 py-2 items-center" style={{ borderWidth: 1, borderColor: '#8BC34A' }}>
                            <Text className="font-bold text-xs" style={{ color: '#8BC34A' }}>APPLY FERTILIZER</Text>
                          </Pressable>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Plant — only if available plots exist */}
              {(state.cropPlotsOwned ?? 0) > cropPlots.length ? (
                <>
                  <Text className="text-muted-foreground text-xs mb-2 tracking-wider">PLANT NEW CROP</Text>
                  {Object.entries(CROP_DEFINITIONS).map(([type, def]) => (
                    <Pressable
                      key={type}
                      onPress={() => plantCrop(type)}
                      className="mb-2 p-3 flex-row items-center justify-between"
                      style={{ borderWidth: 1, borderColor: type === 'Cannabis' ? '#6A0DAD' : (cash >= def.seedCost ? '#333' : '#1A0A00'), backgroundColor: '#0D0D0D' }}
                    >
                      <View>
                        <Text className="text-foreground font-bold text-sm">{type === 'Cannabis' ? '🌿 Cannabis ⚠️ Illegal' : type}</Text>
                        <Text className="text-muted-foreground text-xs">
                          {def.daysToHarvest} days · {def.yieldKg}kg yield · {formatMoney(def.sellPricePerKg)}/kg
                        </Text>
                      </View>
                      <Text className="font-bold text-sm" style={{ color: cash >= def.seedCost ? '#4CAF50' : '#E32636' }}>
                        {formatMoney(def.seedCost)} seeds
                      </Text>
                    </Pressable>
                  ))}

                  {/* Special black-market seeds — faster growth, bigger yield, consumed from inventory */}
                  {inventory.filter(i => i.category === 'illegal_seed' && i.quantity > 0 && i.linkedCropType).map(seed => {
                    const def = CROP_DEFINITIONS[seed.linkedCropType as keyof typeof CROP_DEFINITIONS];
                    if (!def) return null;
                    const boostedDays = Math.max(1, Math.round(def.daysToHarvest * (seed.daysToHarvestMultiplier ?? 1)));
                    const boostedYield = Math.round(def.yieldKg * (seed.yieldMultiplier ?? 1) * 10) / 10;
                    return (
                      <Pressable
                        key={seed.id}
                        onPress={() => plantCrop(seed.linkedCropType!, seed.id)}
                        className="mb-2 p-3 flex-row items-center justify-between"
                        style={{ borderWidth: 1.5, borderColor: '#F5C842', backgroundColor: '#1A1400' }}
                      >
                        <View style={{ flex: 1 }}>
                          <Text className="text-foreground font-bold text-sm">⭐ {seed.name} ({seed.quantity} in stock)</Text>
                          <Text className="text-muted-foreground text-xs">
                            {boostedDays} days (faster) · {boostedYield}kg yield (bigger) · {def.sellPricePerKg}/kg
                          </Text>
                        </View>
                        <Text className="font-bold text-sm" style={{ color: '#F5C842' }}>
                          USE SEED
                        </Text>
                      </Pressable>
                    );
                  })}
                </>
              ) : (
                <View className="p-3 items-center" style={{ borderWidth: 1, borderColor: '#333' }}>
                  <Text className="text-muted-foreground text-sm text-center">
                    All plots are in use.{'\n'}Purchase more plots to plant additional crops.
                  </Text>
                </View>
              )}
            </>
          )}

          {/* ── ORCHARD TAB ── */}
          {tab === 'orchard' && (
            <>
              <View className="mb-3 p-3" style={{ backgroundColor: '#0A1200', borderWidth: 1, borderColor: '#8BC34A' }}>
                <Text className="text-xs" style={{ color: '#8BC34A', lineHeight: 18 }}>
                  🍎 Fruit trees remain planted after harvest and produce every season.{'\n'}
                  They take longer to mature but provide recurring income with no replanting cost.
                </Text>
              </View>

              {(orchardPlots ?? []).length > 0 && (
                <View className="mb-4">
                  <Text className="text-muted-foreground text-xs mb-2 tracking-wider">YOUR ORCHARD PLOTS</Text>
                  {(orchardPlots ?? []).map(plot => {
                    const def = ORCHARD_DEFINITIONS[plot.treeType];
                    const isMature = plot.ageDays >= (def?.matureAfterDays ?? 365);
                    const isReady = isMature && state.day >= plot.harvestReadyDay;
                    const progress = isMature
                      ? Math.min(100, Math.round(((def?.harvestIntervalDays ?? 60) - Math.max(0, plot.harvestReadyDay - state.day)) / (def?.harvestIntervalDays ?? 60) * 100))
                      : Math.min(100, Math.round((plot.ageDays / (def?.matureAfterDays ?? 90)) * 100));
                    return (
                      <View key={plot.id} className="mb-3 p-4" style={{ borderWidth: 1, borderColor: isReady ? '#FFB81C' : '#2A3A1A', backgroundColor: '#0D0D0D' }}>
                        <View className="flex-row justify-between items-center mb-1">
                          <Text className="text-foreground font-bold">{def?.icon ?? '🌳'} {plot.treeType}</Text>
                          <Text className="text-xs font-bold" style={{ color: isReady ? '#FFB81C' : isMature ? '#4CAF50' : '#888' }}>
                            {isReady ? '🍎 READY TO HARVEST' : isMature ? '🌿 Growing fruit...' : `🌱 Maturing (day ${plot.ageDays})`}
                          </Text>
                        </View>
                        <View className="h-1.5 bg-secondary mb-2">
                          <View className="h-1.5" style={{ width: `${progress}%`, backgroundColor: isReady ? '#FFB81C' : '#4CAF50' }} />
                        </View>
                        <Text className="text-muted-foreground text-xs mb-3">
                          {isMature
                            ? `Next harvest: day ${plot.harvestReadyDay} · Yield: ~${def?.yieldKg ?? 20}kg · R${def?.sellPricePerKg ?? 8}/kg`
                            : `Maturity: ${plot.ageDays}/${def?.matureAfterDays ?? 90} days`}
                        </Text>
                        {isReady && (
                          <Pressable onPress={() => harvestOrchard(plot.id)} className="py-2 items-center" style={{ backgroundColor: '#FFB81C' }}>
                            <Text className="font-bold text-xs" style={{ color: '#0D0D0D' }}>
                              HARVEST {plot.treeType} — ~{formatMoney((def?.yieldKg ?? 20) * (def?.sellPricePerKg ?? 8))}
                            </Text>
                          </Pressable>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}

              <Text className="text-muted-foreground text-xs mb-2 tracking-wider">PLANT NEW FRUIT TREE</Text>
              {Object.entries(ORCHARD_DEFINITIONS).map(([treeType, def]) => {
                const alreadyPlanted = (orchardPlots ?? []).filter(p => p.treeType === treeType).length;
                return (
                  <View key={treeType} className="mb-2 p-3" style={{ borderWidth: 1, borderColor: '#2A3A1A', backgroundColor: '#0D0D0D' }}>
                    <View className="flex-row justify-between items-center mb-1">
                      <Text className="text-foreground font-bold text-sm">{def.icon} {treeType}</Text>
                      <Text style={{ color: '#FFB81C' }} className="font-bold">{formatMoney(def.pricePerPlot)}</Text>
                    </View>
                    <Text className="text-muted-foreground text-xs mb-2">
                      Matures: {def.matureAfterDays} days · Harvest every {def.harvestIntervalDays} days · {def.yieldKg}kg yield · R{def.sellPricePerKg}/kg
                    </Text>
                    {alreadyPlanted > 0 && (
                      <Text className="text-xs mb-2" style={{ color: '#8BC34A' }}>✅ {alreadyPlanted} tree(s) already planted</Text>
                    )}
                    <Pressable
                      onPress={() => plantOrchard(treeType)}
                      disabled={cash < def.pricePerPlot}
                      className="py-2 items-center"
                      style={{ borderWidth: 1, borderColor: cash >= def.pricePerPlot ? '#8BC34A' : '#333', opacity: cash >= def.pricePerPlot ? 1 : 0.5 }}
                    >
                      <Text className="text-xs font-bold" style={{ color: cash >= def.pricePerPlot ? '#8BC34A' : '#555' }}>
                        PLANT {treeType.toUpperCase()} — {formatMoney(def.pricePerPlot)}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}

              <View className="mt-3 p-3" style={{ borderWidth: 1, borderColor: '#333', backgroundColor: '#0A0A0A' }}>
                <Text className="text-muted-foreground text-xs mb-2">Buy additional orchard plots to plant more trees.</Text>
                <Pressable
                  onPress={buyOrchardPlot}
                  disabled={cash < 5000}
                  className="py-2 items-center"
                  style={{ borderWidth: 1, borderColor: cash >= 5000 ? '#FFB81C' : '#333', opacity: cash >= 5000 ? 1 : 0.5 }}
                >
                  <Text className="text-xs font-bold" style={{ color: cash >= 5000 ? '#FFB81C' : '#555' }}>
                    BUY ORCHARD PLOT — R5,000 ({(orchardPlots ?? []).length} owned)
                  </Text>
                </Pressable>
              </View>
            </>
          )}

          {/* ── LIVESTOCK TAB ── */}
          {tab === 'livestock' && (
            <>
              {livestock.length > 0 && (
                <View className="mb-4">
                  <Text className="text-muted-foreground text-xs mb-2 tracking-wider">YOUR LIVESTOCK</Text>
                  {livestock.map(group => {
                    const def = LIVESTOCK_DEFINITIONS[group.type as keyof typeof LIVESTOCK_DEFINITIONS];
                    const needsPregnancy = def?.needsPregnancy ?? false;
                    const isPregnant = (group.pregnantFemales ?? 0) > 0;
                    const eggStock = inventory.find(i => i.id === 'farm_eggs')?.quantity ?? 0;
                    const daysLeft = group.pregnancyDaysLeft ?? 0;
                    return (
                      <View key={group.type} className="mb-3 p-4" style={{ borderWidth: 1, borderColor: '#333', backgroundColor: '#0D0D0D' }}>
                        <View className="flex-row justify-between items-center mb-2">
                          <Text className="text-foreground font-bold">{group.type}</Text>
                          <Text className="text-muted-foreground text-xs">♂{group.males} ♀{group.females}</Text>
                        </View>
                        <Text className="text-muted-foreground text-xs mb-1">
                          Feed stock: {group.animalFeedStockKg}kg
                          {group.dailyProduceBoostDays > 0 ? ` · Boost active: ${group.dailyProduceBoostDays} days` : ' · No feed boost'}
                        </Text>
                        {/* Health status */}
                        {((group.sickCount ?? 0) > 0 || (group.injuredCount ?? 0) > 0) && (
                          <View className="mb-2 p-2" style={{ backgroundColor: '#1A0500', borderWidth: 1, borderColor: '#E32636' }}>
                            <Text className="text-xs font-bold mb-1" style={{ color: '#E32636' }}>🩺 HEALTH ALERT</Text>
                            {(group.sickCount ?? 0) > 0 && (
                              <Text className="text-xs" style={{ color: '#FF6B35' }}>
                                🤒 Sick: {group.sickCount} animal{(group.sickCount ?? 0) > 1 ? 's' : ''} — losing produce & health daily
                                {group.type === 'Chicken' ? ' · Untreated chickens can die!' : ''}
                              </Text>
                            )}
                            {group.type !== 'Chicken' && (group.injuredCount ?? 0) > 0 && (
                              <Text className="text-xs mt-0.5" style={{ color: '#FF9800' }}>
                                🤕 Injured: {group.injuredCount} animal{(group.injuredCount ?? 0) > 1 ? 's' : ''}
                              </Text>
                            )}
                            <Text className="text-xs mt-1 text-muted-foreground">
                              Use the Heal All button below to treat all at once.
                            </Text>
                          </View>
                        )}
                        {(group.averageAge ?? 0) > 0 && (
                          <Text className="text-xs mb-1" style={{ color: '#888' }}>
                            Avg age: {Math.floor((group.averageAge ?? 0) / 30)} months
                          </Text>
                        )}
                        {group.type === 'Chicken' && (
                          <Text className="text-xs mb-1" style={{ color: '#FFB81C' }}>
                            🥚 Each hen lays 1–3 eggs/day. Eggs must be set to incubate to hatch — 7 days, ~1 in 5 chicks hatch male.
                            {group.dailyProduceBoostDays > 0 ? ' Feed active (+40%).' : ''}
                          </Text>
                        )}
                        {group.type === 'Chicken' && (group.incubatingEggs ?? 0) > 0 && group.incubationStartDay !== null && (
                          <View className="mb-2 p-2" style={{ borderWidth: 1, borderColor: '#F5C842', backgroundColor: '#1A1400' }}>
                            <Text className="text-xs font-bold" style={{ color: '#F5C842' }}>
                              🐣 {group.incubatingEggs} egg{group.incubatingEggs !== 1 ? 's' : ''} incubating — hatch day {group.incubationStartDay + 7} (day {state.day} now)
                            </Text>
                          </View>
                        )}
                        {group.type === 'Chicken' && eggStock > 0 && (
                          <Pressable
                            onPress={() => {
                              dispatch({ type: 'INCUBATE_EGGS', payload: { livestockType: 'Chicken', quantity: eggStock } });
                              showFeedback(`🐣 Set ${eggStock} eggs to incubate. Hatches in 7 days.`);
                            }}
                            className="mb-2 py-1.5 px-3 self-start"
                            style={{ borderWidth: 1, borderColor: '#F5C842' }}
                          >
                            <Text className="text-xs font-bold" style={{ color: '#F5C842' }}>
                              🐣 INCUBATE ALL EGGS ({eggStock} in stock)
                            </Text>
                          </Pressable>
                        )}
                        {needsPregnancy && (
                          <Text className="text-xs mb-2" style={{ color: isPregnant ? '#4CAF50' : '#FF9800' }}>
                            {isPregnant
                              ? `🤰 ${group.pregnantFemales} pregnant · Birth in ${daysLeft} days`
                              : '⚠️ Not pregnant. Needs AI to produce milk.'}
                          </Text>
                        )}
                        <View className="flex-row flex-wrap gap-2 mt-2">
                          <Pressable onPress={() => applyFeed(group.type)} className="py-1.5 px-3" style={{ borderWidth: 1, borderColor: feedBags > 0 ? '#4CAF50' : '#333' }}>
                            <Text className="text-xs font-bold" style={{ color: feedBags > 0 ? '#4CAF50' : '#555' }}>
                              🌾 APPLY FEED {feedBags <= 0 ? '(none)' : ''}
                            </Text>
                          </Pressable>
                          {needsPregnancy && !isPregnant && group.females > 0 && (
                            <Pressable onPress={() => applyAI(group.type)} className="py-1.5 px-3"
                              style={{ borderWidth: 1, borderColor: cash >= 3000 ? '#C77DFF' : '#333' }}>
                              <Text className="text-xs font-bold" style={{ color: cash >= 3000 ? '#C77DFF' : '#555' }}>
                                💉 ARTIFICIAL INSEMINATION (R3,000)
                              </Text>
                            </Pressable>
                          )}
                          {group.males > 0 && (
                            <Pressable onPress={() => slaughterMale(group.type)} className="py-1.5 px-3" style={{ borderWidth: 1, borderColor: '#E32636' }}>
                              <Text className="text-xs font-bold" style={{ color: '#E32636' }}>SLAUGHTER ♂ → 🥩 Meat</Text>
                            </Pressable>
                          )}
                          {group.females > 0 && (
                            <Pressable onPress={() => slaughterFemale(group.type)} className="py-1.5 px-3" style={{ borderWidth: 1, borderColor: '#E32636' }}>
                              <Text className="text-xs font-bold" style={{ color: '#E32636' }}>SLAUGHTER ♀ → 🥩 Meat</Text>
                            </Pressable>
                          )}
                        </View>
                        {/* Heal All + Bulk Sell buttons */}
                        {def && (
                          <View className="mt-2 gap-2">
                            {/* Heal All */}
                            {((group.sickCount ?? 0) > 0 || (group.type !== 'Chicken' && (group.injuredCount ?? 0) > 0)) && (
                              <Pressable
                                onPress={() => {
                                  dispatch({ type: 'HEAL_ALL_LIVESTOCK', payload: group.type });
                                  showFeedback(`✅ All sick/injured ${group.type} treated.`);
                                }}
                                className="py-2 items-center"
                                style={{ borderWidth: 1, borderColor: '#FF6B35', backgroundColor: '#2A0A00' }}
                              >
                                <Text className="text-xs font-bold" style={{ color: '#FF6B35' }}>
                                  💉 HEAL ALL {group.type === 'Chicken' ? `(${group.sickCount ?? 0} sick)` : `(sick + injured)`}
                                </Text>
                              </Pressable>
                            )}
                            {/* Sell one */}
                            <View className="flex-row gap-2">
                              {group.males > 1 && (
                                <Pressable
                                  onPress={() => {
                                    dispatch({ type: 'SELL_LIVESTOCK_BULK', payload: { type: group.type, isMale: true, count: 1, sellExcessOnly: false } });
                                    showFeedback(`✅ Sold 1 ♂ ${group.type} for ${formatMoney(def.sellPrice)}.`);
                                  }}
                                  className="flex-1 py-1.5 items-center"
                                  style={{ borderWidth: 1, borderColor: '#FFB81C' }}
                                >
                                  <Text className="text-xs font-bold" style={{ color: '#FFB81C' }}>SELL 1 ♂</Text>
                                </Pressable>
                              )}
                              {group.females > 2 && (
                                <Pressable
                                  onPress={() => {
                                    dispatch({ type: 'SELL_LIVESTOCK_BULK', payload: { type: group.type, isMale: false, count: 1, sellExcessOnly: false } });
                                    showFeedback(`✅ Sold 1 ♀ ${group.type} for ${formatMoney(def.sellPrice)}.`);
                                  }}
                                  className="flex-1 py-1.5 items-center"
                                  style={{ borderWidth: 1, borderColor: '#FFB81C' }}
                                >
                                  <Text className="text-xs font-bold" style={{ color: '#FFB81C' }}>SELL 1 ♀</Text>
                                </Pressable>
                              )}
                            </View>
                            {/* Sell All Excess — leaves min breeding stock (1♂ + 2♀) */}
                            {(group.males > 1 || group.females > 2) && (
                              <Pressable
                                onPress={() => {
                                  const excessM = Math.max(0, group.males - 1);
                                  const excessF = Math.max(0, group.females - 2);
                                  if (excessM > 0) dispatch({ type: 'SELL_LIVESTOCK_BULK', payload: { type: group.type, isMale: true, count: excessM, sellExcessOnly: true } });
                                  if (excessF > 0) dispatch({ type: 'SELL_LIVESTOCK_BULK', payload: { type: group.type, isMale: false, count: excessF, sellExcessOnly: true } });
                                  showFeedback(`✅ Sold all excess ${group.type}. Breeding stock (1♂ + 2♀) retained.`);
                                }}
                                className="py-2 items-center"
                                style={{ backgroundColor: '#1A1000', borderWidth: 1, borderColor: '#FF9800' }}
                              >
                                <Text className="text-xs font-bold" style={{ color: '#FF9800' }}>
                                  SELL ALL EXCESS ♂+♀ (keep 1♂ + 2♀)
                                </Text>
                              </Pressable>
                            )}
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
              <Text className="text-muted-foreground text-xs mb-2 tracking-wider">BUY LIVESTOCK</Text>
              {Object.entries(LIVESTOCK_DEFINITIONS).map(([type, def]) => (
                <View key={type} className="mb-2 p-3" style={{ borderWidth: 1, borderColor: '#1E1E1E', backgroundColor: '#0D0D0D' }}>
                  <Text className="text-foreground font-bold text-sm mb-1">{type}</Text>
                  <Text className="text-muted-foreground text-xs mb-2">
                    {type === 'Chicken' ? 'Produces 3–5 eggs/day each. No males needed.' :
                     type === 'Goat' ? 'Produces 5–8L milk/day when pregnant. AI (R3,000) triggers pregnancy.' :
                     type === 'Cattle' ? 'Produces 15–25L milk/day when pregnant.' :
                     type === 'Pig' ? 'Meat only. No daily produce.' : ''}
                  </Text>
                  <View className="flex-row gap-2">
                    <Pressable onPress={() => buyLivestock(type, true)} className="flex-1 py-2 items-center" style={{ borderWidth: 1, borderColor: cash >= def.buyCost ? '#FFB81C' : '#333' }}>
                      <Text className="text-xs font-bold" style={{ color: cash >= def.buyCost ? '#FFB81C' : '#555' }}>♂ BUY {formatMoney(def.buyCost)}</Text>
                    </Pressable>
                    <Pressable onPress={() => buyLivestock(type, false)} className="flex-1 py-2 items-center" style={{ borderWidth: 1, borderColor: cash >= def.buyCost ? '#FFB81C' : '#333' }}>
                      <Text className="text-xs font-bold" style={{ color: cash >= def.buyCost ? '#FFB81C' : '#555' }}>♀ BUY {formatMoney(def.buyCost)}</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </>
          )}

          {/* ── PRODUCE TAB (Eggs / Milk / Cannabis) ── */}
          {tab === 'produce' && (
            <>
              <View className="mb-3 p-3" style={{ backgroundColor: '#0A1000', borderWidth: 1, borderColor: '#4CAF50' }}>
                <Text className="text-xs" style={{ color: '#4CAF50' }}>
                  🥚 Daily produce is added here automatically. Sell in small units or bulk. Eggs & milk can also be used as cooking ingredients.
                </Text>
              </View>

              {/* Livestock produce: eggs & milk */}
              {produceItems.length === 0 && cannabisHarvest.length === 0 ? (
                <View className="p-6 items-center" style={{ borderWidth: 1, borderColor: '#1E1E1E' }}>
                  <Text className="text-muted-foreground text-sm">No produce yet. Chickens lay eggs daily; goats/cows need AI for milk.</Text>
                </View>
              ) : (
                <>
                  {produceItems.map(item => {
                    const priceMap: Record<string, number> = { farm_eggs: 4, farm_goat_milk: 15, farm_cow_milk: 12 };
                    const unitPrice = priceMap[item.id] ?? 5;
                    const isEgg = item.id === 'farm_eggs';
                    const qty = parseFloat(sellQty[item.id] ?? '0') || 0;
                    const singleQty = isEgg ? 1 : 0.5;
                    const bulkQty = isEgg ? 12 : 5;

                    return (
                      <View key={item.id} className="mb-4 p-4" style={{ borderWidth: 1, borderColor: '#4CAF50', backgroundColor: '#0D0D0D' }}>
                        <View className="flex-row justify-between items-center mb-2">
                          <Text className="text-foreground font-bold">{item.name}</Text>
                          <Text className="font-bold text-sm" style={{ color: '#4CAF50' }}>
                            {item.quantity} {item.unit} available
                          </Text>
                        </View>
                        <Text className="text-muted-foreground text-xs mb-3">
                          Price: R{unitPrice}/{item.unit} · {isEgg ? 'Used in recipes (fried eggs, vetkoek, etc.)' : 'Used in recipes (porridge, tea, etc.)'}
                        </Text>
                        <View className="flex-row gap-2 mb-3">
                          <Pressable
                            onPress={() => sellProduceItem(item.id, singleQty)}
                            disabled={item.quantity < singleQty}
                            className="flex-1 py-2 items-center"
                            style={{ borderWidth: 1, borderColor: item.quantity >= singleQty ? '#FFB81C' : '#333' }}
                          >
                            <Text className="text-xs font-bold" style={{ color: item.quantity >= singleQty ? '#FFB81C' : '#555' }}>
                              SELL {singleQty} {item.unit} — {formatMoney(singleQty * unitPrice)}
                            </Text>
                          </Pressable>
                          <Pressable
                            onPress={() => sellProduceItem(item.id, bulkQty)}
                            disabled={item.quantity < bulkQty}
                            className="flex-1 py-2 items-center"
                            style={{ borderWidth: 1, borderColor: item.quantity >= bulkQty ? '#FFB81C' : '#333' }}
                          >
                            <Text className="text-xs font-bold" style={{ color: item.quantity >= bulkQty ? '#FFB81C' : '#555' }}>
                              SELL {bulkQty} {item.unit} — {formatMoney(bulkQty * unitPrice)}
                            </Text>
                          </Pressable>
                        </View>
                        <View className="flex-row items-center gap-2">
                          <TextInput
                            className="flex-1 py-2 px-3 text-sm"
                            style={{ borderWidth: 1, borderColor: '#444', backgroundColor: '#1A1A1A', color: '#EAEAEA' }}
                            placeholder="Custom qty"
                            placeholderTextColor="#666"
                            keyboardType="numeric"
                            value={sellQty[item.id] ?? ''}
                            onChangeText={t => setSellQty(prev => ({ ...prev, [item.id]: t }))}
                          />
                          <Pressable
                            onPress={() => sellProduceItem(item.id, qty)}
                            className="py-2 px-4"
                            style={{ borderWidth: 1, borderColor: '#4CAF50', backgroundColor: '#0D1A0D' }}
                          >
                            <Text className="text-xs font-bold" style={{ color: '#4CAF50' }}>SELL</Text>
                          </Pressable>
                        </View>
                      </View>
                    );
                  })}

                  {/* Cannabis harvest sell */}
                  {cannabisHarvest.map(item => {
                    const qty = parseFloat(sellQty['cannabis'] ?? '0') || 0;
                    return (
                      <View key={item.id} className="mb-4 p-4" style={{ borderWidth: 1, borderColor: '#6A0DAD', backgroundColor: '#0D0D0D' }}>
                        <View className="flex-row justify-between items-center mb-2">
                          <Text className="text-foreground font-bold">🌿 Cannabis</Text>
                          <Text className="font-bold text-sm" style={{ color: '#C77DFF' }}>{item.quantity}kg available</Text>
                        </View>
                        <Text className="text-xs mb-2" style={{ color: '#FF9800' }}>
                          ⚠️ Illegal. Selling carries 35% risk of a fine (R1,000–R4,000). 3rd offence = prison.
                        </Text>
                        <Text className="text-muted-foreground text-xs mb-3">Market price: R600/kg</Text>
                        <View className="flex-row gap-2 mb-3">
                          <Pressable onPress={() => sellCannabis(0.1)} disabled={item.quantity < 0.1} className="flex-1 py-2 items-center" style={{ borderWidth: 1, borderColor: '#6A0DAD' }}>
                            <Text className="text-xs font-bold" style={{ color: '#C77DFF' }}>SELL 100g — R60</Text>
                          </Pressable>
                          <Pressable onPress={() => sellCannabis(0.5)} disabled={item.quantity < 0.5} className="flex-1 py-2 items-center" style={{ borderWidth: 1, borderColor: '#6A0DAD' }}>
                            <Text className="text-xs font-bold" style={{ color: '#C77DFF' }}>SELL 500g — R300</Text>
                          </Pressable>
                          <Pressable onPress={() => sellCannabis(1)} disabled={item.quantity < 1} className="flex-1 py-2 items-center" style={{ borderWidth: 1, borderColor: '#6A0DAD' }}>
                            <Text className="text-xs font-bold" style={{ color: '#C77DFF' }}>SELL 1kg — R600</Text>
                          </Pressable>
                        </View>
                        <View className="flex-row items-center gap-2">
                          <TextInput
                            className="flex-1 py-2 px-3 text-sm"
                            style={{ borderWidth: 1, borderColor: '#444', backgroundColor: '#1A1A1A', color: '#EAEAEA' }}
                            placeholder="Custom kg"
                            placeholderTextColor="#666"
                            keyboardType="numeric"
                            value={sellQty['cannabis'] ?? ''}
                            onChangeText={t => setSellQty(prev => ({ ...prev, cannabis: t }))}
                          />
                          <Pressable onPress={() => sellCannabis(qty)} className="py-2 px-4" style={{ borderWidth: 1, borderColor: '#6A0DAD', backgroundColor: '#1A001A' }}>
                            <Text className="text-xs font-bold" style={{ color: '#C77DFF' }}>SELL</Text>
                          </Pressable>
                        </View>
                      </View>
                    );
                  })}
                </>
              )}
            </>
          )}

          {/* ── HARVEST TAB ── */}
          {tab === 'harvest' && (
            <>
              {harvestItems.length === 0 ? (
                <View className="p-6 items-center" style={{ borderWidth: 1, borderColor: '#1E1E1E' }}>
                  <Text className="text-muted-foreground text-sm">No harvested crops yet. Grow and harvest crops to sell here.</Text>
                </View>
              ) : (
                harvestItems.map(item => {
                  const cropName = item.name.split(' ')[0];
                  const def = CROP_DEFINITIONS[cropName as keyof typeof CROP_DEFINITIONS];
                  const value = def ? Math.floor(item.quantity * def.sellPricePerKg) : 0;
                  return (
                    <View key={item.id} className="mb-3 p-4" style={{ borderWidth: 1, borderColor: '#4CAF50', backgroundColor: '#0D0D0D' }}>
                      <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-foreground font-bold">{item.name}</Text>
                        <Text className="font-bold" style={{ color: '#4CAF50' }}>{formatMoney(value)}</Text>
                      </View>
                      <Text className="text-muted-foreground text-xs mb-3">{item.quantity}kg · {formatMoney(def?.sellPricePerKg ?? 0)}/kg</Text>
                      <View className="flex-row gap-2">
                        <Pressable
                          onPress={() => sellHarvestItem(item.id, Math.floor(item.quantity / 2))}
                          disabled={item.quantity < 1}
                          className="flex-1 py-2 items-center"
                          style={{ borderWidth: 1, borderColor: '#FFB81C', backgroundColor: '#1A1000' }}
                        >
                          <Text className="font-bold text-xs" style={{ color: '#FFB81C' }}>
                            SELL HALF ({formatMoney(Math.floor(value / 2))})
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() => sellHarvestItem(item.id, item.quantity)}
                          className="flex-1 py-2 items-center"
                          style={{ backgroundColor: '#4CAF50' }}
                        >
                          <Text className="font-bold text-xs" style={{ color: '#0D0D0D' }}>SELL ALL {formatMoney(value)}</Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                })
              )}
            </>
          )}

          {/* ── LABOUR TAB ── */}
          {tab === 'labor' && (
            <>
              <View className="mb-4 p-3" style={{ backgroundColor: '#0A1200', borderWidth: 1, borderColor: '#4CAF50' }}>
                <Text className="text-xs" style={{ color: '#4CAF50' }}>
                  👷 Farm workers are paid R100/day. They auto-weed (with Garden Hoe), irrigate (with Irrigation Pipe) and treat pests (with Sprayer + Pesticide).
                </Text>
              </View>
              <View className="mb-4 p-3 flex-row flex-wrap gap-3" style={{ borderWidth: 1, borderColor: '#1E1E1E', backgroundColor: '#0D0D0D' }}>
                <Text className="text-xs text-muted-foreground">Labor tools:</Text>
                <Text className="text-xs" style={{ color: hasHoe ? '#4CAF50' : '#E32636' }}>🪓 Hoe: {hasHoe ? 'Ready' : 'Missing'}</Text>
                <Text className="text-xs" style={{ color: hasIrrigation ? '#4CAF50' : '#E32636' }}>🚿 Irrigation: {hasIrrigation ? 'Ready' : 'Missing'}</Text>
                <Text className="text-xs" style={{ color: hasSprayer && hasPesticide ? '#4CAF50' : '#E32636' }}>💦 Sprayer: {hasSprayer && hasPesticide ? 'Ready' : 'Missing'}</Text>
              </View>
              {(farmLaborers ?? []).length > 0 ? (
                <View className="mb-4">
                  <Text className="text-muted-foreground text-xs mb-2 tracking-wider">CURRENT WORKERS — R{(farmLaborers ?? []).reduce((s, l) => s + l.dailyWage, 0)}/DAY TOTAL</Text>
                  {(farmLaborers ?? []).map(laborer => (
                    <View key={laborer.id} className="mb-2 p-3 flex-row items-center justify-between" style={{ borderWidth: 1, borderColor: '#333', backgroundColor: '#0D0D0D' }}>
                      <View>
                        <Text className="text-foreground font-bold text-sm">{laborer.name}</Text>
                        <Text className="text-muted-foreground text-xs">Hired day {laborer.hiredDay} · R{laborer.dailyWage}/day</Text>
                      </View>
                      <Pressable onPress={() => fireLaborer(laborer.id)} className="py-1.5 px-3" style={{ borderWidth: 1, borderColor: '#E32636' }}>
                        <Text className="text-xs font-bold" style={{ color: '#E32636' }}>DISMISS</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              ) : (
                <View className="mb-4 p-4 items-center" style={{ borderWidth: 1, borderColor: '#1E1E1E' }}>
                  <Text className="text-muted-foreground text-sm">No farm workers hired.</Text>
                </View>
              )}
              <Pressable onPress={hireLaborer} className="py-3 items-center" style={{ borderWidth: 2, borderColor: '#FFB81C', backgroundColor: '#1A1400' }}>
                <Text className="font-bold" style={{ color: '#FFB81C' }}>+ HIRE FARM WORKER (R100/day)</Text>
              </Pressable>
            </>
          )}

        </View>
      </ScrollView>
    </View>
  );
}

