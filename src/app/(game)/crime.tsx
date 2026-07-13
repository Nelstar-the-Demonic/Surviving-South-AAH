import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useGame } from '@/store/gameContext';
import { GameHeader } from '@/components/game/GameHeader';
import { CRIME_DEFINITIONS } from '@/lib/game/gameData';
import { formatMoney } from '@/lib/game/gameEngine';

export default function CrimeScreen() {
  const { state, dispatch } = useGame();
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null);

  if (!state?.gameStarted) return null;
  const { cash, stats, crimeState, inventory, location } = state;
  const actionsLeft = state.maxActionsPerDay - state.actionsUsedToday.length;

  const hasWeapon = inventory.some(i => i.category === 'weapon' && i.quantity > 0);
  const hasDrugs = inventory.some(i => i.category === 'drug' && i.quantity > 0);
  const hasCannabis = inventory.some(i => (i.id === 'harvest_cannabis' || i.id === 'cannabis') && i.quantity > 0);
  const weaponBonus = inventory
    .filter(i => i.category === 'weapon' && i.quantity > 0)
    .reduce((max, w) => Math.max(max, w.crimeSuccessBonus ?? 0), 0);

  function getStockGateError(crimeId: string): string | null {
    if (crimeId === 'sell_cannabis' && !hasCannabis) return '⚠️ Need cannabis in inventory. Harvest cannabis first.';
    if (crimeId === 'drug_dealing' && !hasDrugs) return '⚠️ Need drugs in inventory. Buy from Black Market.';
    if (crimeId === 'armed_robbery' && !hasWeapon) return '⚠️ Need a weapon. Visit the Black Market.';
    if (crimeId === 'carjacking' && !hasWeapon) return '⚠️ Need a weapon. Visit the Black Market.';
    if (crimeId === 'hit' && !hasWeapon) return '⚠️ Need a weapon. Visit the Black Market.';
    return null;
  }

  function showFeedback(msg: string, ok: boolean) {
    setFeedback({ msg, ok });
    setTimeout(() => setFeedback(null), 4000);
  }

  function attemptCrime(crimeId: string) {
    const def = CRIME_DEFINITIONS.find(c => c.id === crimeId);
    if (!def) return;
    if (actionsLeft <= 0) { showFeedback('⚠️ No actions left today. Advance the day.', false); return; }
    if (stats.energy < def.energyCost) { showFeedback(`⚠️ Not enough energy (need ${def.energyCost}).`, false); return; }
    if (def.requiresWeapon && !hasWeapon) { showFeedback('⚠️ This crime requires a weapon. Visit the Black Market in Shop.', false); return; }
    const stockErr = getStockGateError(crimeId);
    if (stockErr) { showFeedback(stockErr, false); return; }
    if (state.prison.imprisoned) { showFeedback('⚠️ You are in prison.', false); return; }

    const prevCash = state.cash;
    dispatch({ type: 'PERFORM_CRIME', payload: crimeId });

    // Optimistic feedback – actual result applied by reducer
    setTimeout(() => {
      const gained = state.cash - prevCash;
      if (gained > 0) {
        showFeedback(`✅ ${def.name} successful! +${formatMoney(gained)}`, true);
      } else {
        showFeedback(`🚔 You were caught! Check your events.`, false);
      }
    }, 300);

    showFeedback(`⚡ Attempting ${def.name}…`, true);
  }

  const riskColor = (rate: number) =>
    rate >= 70 ? '#4CAF50' : rate >= 50 ? '#FFB81C' : rate >= 35 ? '#FF9800' : '#E32636';

  const crimes = CRIME_DEFINITIONS;

  return (
    <View className="flex-1 bg-background">
      <GameHeader title="Crime" subtitle="High risk, high reward" extraStats={[
        { label: 'Weapon Bonus', value: hasWeapon ? `+${weaponBonus}%` : 'None', color: hasWeapon ? '#FFB81C' : '#666' },
        { label: 'Crimes Done', value: String(crimeState?.totalCrimes ?? 0) },
        { label: 'Location', value: location },
      ]} />

      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View className="px-4 pt-4 pb-10">

          {feedback && (
            <View className="mb-4 p-3" style={{
              backgroundColor: feedback.ok ? '#0D1A0D' : '#1A0A00',
              borderWidth: 1,
              borderColor: feedback.ok ? '#4CAF50' : '#E32636',
            }}>
              <Text className="text-sm font-bold" style={{ color: feedback.ok ? '#4CAF50' : '#E32636' }}>
                {feedback.msg}
              </Text>
            </View>
          )}

          {/* Warning banner */}
          <View className="mb-4 p-3" style={{ backgroundColor: '#1A0800', borderWidth: 1, borderColor: '#E32636' }}>
            <Text className="text-xs" style={{ color: '#FF9800' }}>
              ⚠️  Criminal activities carry serious consequences. Getting caught results in fines or imprisonment. Sentence length scales with crime severity.
              {hasWeapon
                ? ` Your weapon gives +${weaponBonus}% success.`
                : ' Carrying a weapon (from Black Market) boosts success.'}
            </Text>
          </View>

          {/* Cannabis sell count warning */}
          {(crimeState?.cannabisSalesCaught ?? 0) > 0 && (
            <View className="mb-4 p-3" style={{ backgroundColor: '#1A0A00', borderWidth: 1, borderColor: '#FFB81C' }}>
              <Text className="text-xs" style={{ color: '#FFB81C' }}>
                🌿 Cannabis offences: {crimeState.cannabisSalesCaught}/3. On the 3rd catch you face imprisonment.
              </Text>
            </View>
          )}

          {/* Stats bar */}
          <View className="flex-row flex-wrap gap-3 mb-4 p-3"
            style={{ backgroundColor: '#0A0800', borderWidth: 1, borderColor: '#333' }}>
            <Text className="text-xs" style={{ color: '#FFB81C' }}>⚡ Energy: {stats.energy}</Text>
            <Text className="text-xs" style={{ color: '#4CAF50' }}>💰 Cash: {formatMoney(cash)}</Text>
            <Text className="text-xs" style={{ color: '#64B5F6' }}>🎯 Actions left: {actionsLeft}</Text>
          </View>

          <Text className="text-muted-foreground text-xs mb-3 tracking-wider">AVAILABLE CRIMES</Text>

          {crimes.map(crime => {
            const effectiveRate = Math.min(95, crime.baseSuccessRate + weaponBonus);
            const alreadyDoneToday = state.actionsUsedToday.includes(`crime_${crime.id}`);
            const canAttempt = !alreadyDoneToday && actionsLeft > 0 && stats.energy >= crime.energyCost;
            const weaponRequired = crime.requiresWeapon && !hasWeapon;
            const stockError = getStockGateError(crime.id);

            return (
              <View key={crime.id} className="mb-3 p-4"
                style={{ borderWidth: 1, borderColor: alreadyDoneToday ? '#333' : '#2A1A00', backgroundColor: '#0D0D0D' }}>
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-foreground font-bold text-base">
                    {crime.icon} {crime.name}
                  </Text>
                  <Text className="text-xs font-bold" style={{ color: riskColor(effectiveRate) }}>
                    {effectiveRate}% success
                  </Text>
                </View>

                <Text className="text-muted-foreground text-xs mb-2">{crime.description}</Text>

                <View className="flex-row flex-wrap gap-3 mb-3">
                  <Text className="text-xs" style={{ color: '#4CAF50' }}>
                    💰 {formatMoney(crime.baseCashReward.min)}–{formatMoney(crime.baseCashReward.max)}
                  </Text>
                  <Text className="text-xs" style={{ color: '#E32636' }}>
                    Fine: {formatMoney(crime.caughtFine.min)}+
                  </Text>
                  <Text className="text-xs" style={{ color: '#FF9800' }}>
                    Prison: {crime.sentenceDays}d
                  </Text>
                  <Text className="text-xs" style={{ color: '#64B5F6' }}>
                    ⚡ -{crime.energyCost}
                  </Text>
                  {crime.requiresWeapon && (
                    <Text className="text-xs" style={{ color: '#FFB81C' }}>⚔️ Weapon required</Text>
                  )}
                </View>

                <Pressable
                  onPress={() => attemptCrime(crime.id)}
                  disabled={!canAttempt || !!weaponRequired || !!stockError}
                  className="py-2 items-center"
                  style={{
                    borderWidth: 1,
                    borderColor: alreadyDoneToday ? '#333' : (weaponRequired || stockError) ? '#555' : canAttempt ? '#D4AF37' : '#444',
                    backgroundColor: alreadyDoneToday ? '#0A0A0A' : '#1A1000',
                    opacity: canAttempt && !weaponRequired && !stockError ? 1 : 0.5,
                  }}
                >
                  <Text className="text-xs font-bold" style={{
                    color: alreadyDoneToday ? '#555' : (weaponRequired || stockError) ? '#E32636' : canAttempt ? '#D4AF37' : '#666',
                  }}>
                    {alreadyDoneToday ? '✓ Done today' : weaponRequired ? '⚔️ Need weapon' : stockError ? '📦 No stock' : !canAttempt ? '⚡ No energy/actions' : 'ATTEMPT'}
                  </Text>
                </Pressable>
                {stockError && !alreadyDoneToday && (
                  <Text style={{ color: '#E32636', fontSize: 10, marginTop: 4, textAlign: 'center' }}>
                    {stockError}
                  </Text>
                )}
              </View>
            );
          })}

          {/* Crime history */}
          {(crimeState?.crimeRecords ?? []).length > 0 && (
            <View className="mt-4">
              <Text className="text-muted-foreground text-xs mb-2 tracking-wider">RECENT CRIME HISTORY</Text>
              {[...crimeState.crimeRecords].reverse().slice(0, 5).map((r, i) => (
                <View key={i} className="flex-row justify-between items-center py-2"
                  style={{ borderBottomWidth: 1, borderBottomColor: '#222' }}>
                  <Text className="text-xs text-foreground">Day {r.day} — {r.crime}</Text>
                  <Text className="text-xs" style={{ color: r.caught ? '#E32636' : '#4CAF50' }}>
                    {r.caught ? `Caught (-${formatMoney(r.finePaid)})` : `+${formatMoney(r.income)}`}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
