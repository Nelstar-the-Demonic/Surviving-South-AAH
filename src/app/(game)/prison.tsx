import { useState } from 'react';
import { View, Text, ScrollView, Pressable, BackHandler } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { useGame } from '@/store/gameContext';
import { GameHeader } from '@/components/game/GameHeader';
import { InfoCard } from '@/components/game/InfoCard';
import { GameButton } from '@/components/game/GameButton';
import { formatMoney } from '@/lib/game/gameEngine';

const PRISON_ACTIONS = [
  {
    id: 'prison_labour',
    label: 'Do Prison Labour',
    icon: '⛏️',
    desc: 'Break rocks / clean facilities. Earns R20-R50. -Energy. Rough crowd — incidents happen here most.',
  },
  {
    id: 'prison_exercise',
    label: 'Exercise in Yard',
    icon: '💪',
    desc: '+Fitness, +Health. Yard politics — incidents happen here most too.',
  },
  {
    id: 'prison_study',
    label: 'Study in Library',
    icon: '📚',
    desc: '+Intelligence. Safer, but not risk-free — occasional bullying.',
  },
  {
    id: 'prison_socialize',
    label: 'Socialize with Inmates',
    icon: '🗣️',
    desc: '+Happiness, -Stress. How gang contacts are made — but joining is always your choice.',
  },
  {
    id: 'prison_rest',
    label: 'Rest in Cell',
    icon: '😴',
    desc: '+Energy. Time passes.',
  },
];

export default function Prison() {
  const router = useRouter();
  const { state, dispatch } = useGame();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [dayAdvanced, setDayAdvanced] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Block Android hardware back button while imprisoned
  useFocusEffect(
    useCallback(() => {
      if (!state?.prison?.imprisoned) return;
      const sub = BackHandler.addEventListener('hardwareBackPress', () => true); // return true = block
      return () => sub.remove();
    }, [state?.prison?.imprisoned])
  );

  if (!state?.gameStarted) return null;
  const { prison, stats, actionsUsedToday, maxActionsPerDay, cash, day } = state;

  function showFeedback(msg: string) {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  }

  function doAction(actionId: string) {
    if (isProcessing) return; // prevents rapid multi-tap from queueing duplicate dispatches
    // Prison gets max 3 actions/day — enforced here and in reducer
    const prisonActionsUsed = actionsUsedToday.filter(a => a !== 'rest' && a !== 'shower').length;
    if (prisonActionsUsed >= 3 && actionId !== 'prison_rest') {
      showFeedback('⛔ No actions remaining today. Rest or advance the day.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => setIsProcessing(false), 400); // brief lock, long enough to absorb accidental double-taps

    if (actionId === 'prison_labour') {
      dispatch({ type: 'PRISON_LABOUR' });
      showFeedback('⛏️ Worked hard. Earned small wages. Businesses continue outside.');
    } else if (actionId === 'prison_exercise') {
      dispatch({ type: 'PRISON_EXERCISE' });
      showFeedback('💪 Exercised in the yard. Fitness improved.');
    } else if (actionId === 'prison_study') {
      dispatch({ type: 'PRISON_STUDY' });
      showFeedback('📚 Studied in the library. Intelligence improved.');
    } else if (actionId === 'prison_socialize') {
      dispatch({ type: 'PRISON_SOCIALIZE' });
      showFeedback('🗣️ Chatted with inmates. Happiness up.');
    } else {
      // REST — never consumes action
      dispatch({ type: 'REST' });
      showFeedback('😴 Rested in cell. Energy restored. (Free — no action used)');
    }
  }

  // Prison uses 3 productive actions/day; REST is always free
  const productiveActionsUsed = actionsUsedToday.filter(a => a !== 'rest' && a !== 'shower').length;
  const prisonMax = 3;
  const actionsLeft = Math.max(0, prisonMax - productiveActionsUsed);
  const pct = Math.round((prison.daysServed / prison.sentenceDays) * 100);
  const daysLeft = prison.sentenceDays - prison.daysServed;
  const avgDailyLabour = prison.daysServed > 0 ? prison.prisonEarnings / prison.daysServed : 0;

  function handleAdvanceDay() {
    if (isProcessing || dayAdvanced) return;
    setIsProcessing(true);
    dispatch({ type: 'ADVANCE_DAY' });
    setDayAdvanced(true);
    setFeedback(`📅 Day advanced. ${Math.max(0, daysLeft - 1)} days remaining in sentence.`);
    setTimeout(() => {
      setDayAdvanced(false);
      setIsProcessing(false);
      setFeedback(null);
    }, 2500);
  }

  if (!prison.imprisoned) {
    return (
      <View className="flex-1 bg-background">
        <GameHeader title="Prison" />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-6xl mb-4">🔓</Text>
          <Text className="text-foreground text-xl font-bold text-center mb-2">You are not imprisoned</Text>
          <Text className="text-muted-foreground text-center text-sm mb-6">
            Stay out of trouble and this screen stays empty.
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="py-3 px-8"
            style={{ borderWidth: 1, borderColor: '#FFB81C' }}
          >
            <Text className="font-bold" style={{ color: '#FFB81C' }}>← BACK</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View
        className="bg-card px-4 pt-12 pb-4 z-10"
        style={{ borderBottomWidth: 2, borderBottomColor: '#E32636', zIndex: 10 }}
      >
        <Text className="text-2xl font-bold" style={{ color: '#E32636' }}>🔒 CORRECTIONAL SERVICES</Text>
        <Text className="text-muted-foreground text-sm mt-1">{prison.facility ?? 'Pollsmoor Correctional Centre'}</Text>
      </View>

      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View className="px-4 pt-4 pb-10">

          {feedback && (
            <View className="mb-4 p-3" style={{
              backgroundColor: feedback.includes('⚠️') ? '#1A0A00' : '#0D1A0D',
              borderWidth: 1,
              borderColor: feedback.includes('⚠️') ? '#FFB81C' : '#4CAF50',
            }}>
              <Text className="text-sm" style={{ color: feedback.includes('⚠️') ? '#FFB81C' : '#4CAF50' }}>
                {feedback}
              </Text>
            </View>
          )}

          {/* Sentence status */}
          <View
            className="mb-4 p-5"
            style={{ backgroundColor: '#1A0000', borderWidth: 2, borderColor: '#E32636' }}
          >
            <Text className="text-muted-foreground text-xs mb-1 tracking-wider">CONVICTION</Text>
            <Text className="text-foreground font-bold text-base mb-3">{prison.crime}</Text>

            <View className="flex-row justify-between mb-2">
              <Text className="text-muted-foreground text-xs">SENTENCE</Text>
              <Text className="text-foreground font-bold">{prison.sentenceDays} days</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-muted-foreground text-xs">DAYS SERVED</Text>
              <Text style={{ color: '#4CAF50' }} className="font-bold">{prison.daysServed} days</Text>
            </View>
            <View className="flex-row justify-between mb-3">
              <Text className="text-muted-foreground text-xs">REMAINING</Text>
              <Text style={{ color: '#E32636' }} className="font-bold">{daysLeft} days</Text>
            </View>

            <View className="h-3 bg-secondary mb-1">
              <View
                className="h-3"
                style={{
                  width: `${pct}%`,
                  backgroundColor: pct >= 75 ? '#4CAF50' : '#E32636',
                }}
              />
            </View>
            <Text className="text-muted-foreground text-xs text-right">{pct}% complete</Text>
          </View>

          {/* Stats in prison */}
          <InfoCard title="Current State">
            <View className="flex-row gap-3 flex-wrap">
              {[
                { label: 'Energy', val: stats.energy, icon: '⚡' },
                { label: 'Health', val: stats.health, icon: '❤️' },
                { label: 'Hunger', val: stats.hunger, icon: '🍽️' },
                { label: 'Fitness', val: stats.fitness, icon: '💪' },
              ].map(s => (
                <View key={s.label} className="flex-1" style={{ minWidth: '45%' }}>
                  <View className="flex-row justify-between mb-0.5">
                    <Text className="text-xs">{s.icon} {s.label}</Text>
                    <Text className="text-xs font-bold" style={{
                      color: s.val >= 70 ? '#4CAF50' : s.val >= 35 ? '#FFB81C' : '#E32636'
                    }}>{s.val}</Text>
                  </View>
                  <View className="h-1.5 bg-secondary">
                    <View className="h-1.5" style={{
                      width: `${s.val}%`,
                      backgroundColor: s.val >= 70 ? '#4CAF50' : s.val >= 35 ? '#FFB81C' : '#E32636',
                    }} />
                  </View>
                </View>
              ))}
            </View>
          </InfoCard>

          {/* Prison Labour Earnings Panel */}
          <View className="mb-4 p-4" style={{ backgroundColor: '#0A0500', borderWidth: 1, borderColor: '#FF6B35' }}>
            <Text className="text-xs font-bold tracking-wider mb-3" style={{ color: '#FF6B35' }}>⛏️ PRISON LABOUR EARNINGS</Text>
            <View className="flex-row gap-3">
              <View className="flex-1 p-3 items-center" style={{ backgroundColor: '#111', borderWidth: 1, borderColor: '#333' }}>
                <Text className="text-xs text-muted-foreground mb-1">TOTAL EARNED</Text>
                <Text className="font-bold text-lg" style={{ color: '#4CAF50' }}>{formatMoney(prison.prisonEarnings)}</Text>
              </View>
              <View className="flex-1 p-3 items-center" style={{ backgroundColor: '#111', borderWidth: 1, borderColor: '#333' }}>
                <Text className="text-xs text-muted-foreground mb-1">AVG PER DAY</Text>
                <Text className="font-bold text-lg" style={{ color: '#4CAF50' }}>{formatMoney(avgDailyLabour)}</Text>
              </View>
            </View>
            <Text className="text-xs text-muted-foreground mt-2">
              💼 Your businesses continue operating while imprisoned.{'\n'}
              📅 Monthly expenses (rent, utilities) still apply.{'\n'}
              ⚠️ Formal employment was lost on arrest.
            </Text>
            {prison.gangMember && (
              <View className="mt-2 px-2 py-1" style={{ backgroundColor: '#1A0000', borderWidth: 1, borderColor: '#E32636' }}>
                <Text style={{ color: '#E32636' }} className="text-xs">
                  ⚠️ Gang Member — reputation will suffer on release
                </Text>
              </View>
            )}
          </View>

          {/* Gang Affiliation */}
          <View className="mb-4 p-4" style={{ backgroundColor: '#0A0A0A', borderWidth: 1, borderColor: '#444' }}>
            <Text className="text-xs font-bold tracking-wider mb-3" style={{ color: '#B0B0B0' }}>🏴 WING AFFILIATION</Text>
            {prison.gang === 'none' ? (
              <>
                <Text className="text-muted-foreground text-xs mb-3">
                  You're not affiliated with anyone. The numbers gangs (26, 27, 28) will approach you in time —
                  it's always your choice whether to accept. You can also choose to join a lower-risk group directly:
                </Text>
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={() => { dispatch({ type: 'JOIN_GANG', payload: 'amajita' }); showFeedback('💪 You joined AmaJita — the gym crew.'); }}
                    className="flex-1 p-3 items-center"
                    style={{ borderWidth: 1, borderColor: '#8BC34A', backgroundColor: '#0D1A0D' }}
                  >
                    <Text style={{ color: '#8BC34A' }} className="font-bold text-xs">💪 AmaJita</Text>
                    <Text className="text-muted-foreground text-xs text-center mt-1">Gym crew. Respect through strength, not violence.</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => { dispatch({ type: 'JOIN_GANG', payload: 'reformers' }); showFeedback('🕊️ You joined the Reformers.'); }}
                    className="flex-1 p-3 items-center"
                    style={{ borderWidth: 1, borderColor: '#64B5F6', backgroundColor: '#0A1420' }}
                  >
                    <Text style={{ color: '#64B5F6' }} className="font-bold text-xs">🕊️ Reformers</Text>
                    <Text className="text-muted-foreground text-xs text-center mt-1">Focused on rehabilitation and a clean record.</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <Text className="text-sm font-bold" style={{
                color: prison.gang === '26' ? '#F5C842' : prison.gang === '27' ? '#E32636' : prison.gang === '28' ? '#9C27B0' : prison.gang === 'amajita' ? '#8BC34A' : '#64B5F6'
              }}>
                {prison.gang === '26' && '💰 The 26s — money and hustle run the wing economy.'}
                {prison.gang === '27' && '🩸 The 27s — enforcers, respected and feared.'}
                {prison.gang === '28' && '⚔️ The 28s — control the section, territory and protection.'}
                {prison.gang === 'amajita' && '💪 AmaJita — the gym crew. Strength earns respect here.'}
                {prison.gang === 'reformers' && '🕊️ The Reformers — focused on rehabilitation.'}
              </Text>
            )}
          </View>

          {/* Action counter */}
          <View className="mb-3 p-3 flex-row items-center justify-between"
            style={{ backgroundColor: '#0D0D0D', borderWidth: 1, borderColor: actionsLeft > 0 ? '#333' : '#E32636' }}>
            <Text className="text-muted-foreground text-xs tracking-wider">
              DAILY ACTIVITIES — 3 ACTIONS / DAY
            </Text>
            <View className="flex-row gap-1">
              {[0, 1, 2].map(i => (
                <View key={i} className="w-5 h-5 rounded"
                  style={{ backgroundColor: i < actionsLeft ? '#FFB81C' : '#222', borderWidth: 1, borderColor: '#333' }} />
              ))}
            </View>
          </View>

          {actionsLeft === 0 && (
            <View className="mb-3 p-3" style={{ backgroundColor: '#1A0A00', borderWidth: 1, borderColor: '#E32636' }}>
              <Text className="text-sm font-bold text-center" style={{ color: '#E32636' }}>
                ⛔ No actions remaining — Advance the day to continue.
              </Text>
            </View>
          )}

          {PRISON_ACTIONS.map(action => {
            const isRest = action.id === 'prison_rest';
            const disabled = (!isRest && actionsLeft === 0) || isProcessing;
            return (
              <Pressable
                key={action.id}
                className="mb-3 p-4 flex-row items-center"
                style={{
                  borderWidth: 1,
                  borderColor: disabled ? '#1A1A1A' : isRest ? '#64B5F6' : '#222',
                  backgroundColor: disabled ? '#080808' : '#0D0D0D',
                  opacity: disabled ? 0.5 : 1,
                }}
                onPress={() => doAction(action.id)}
                disabled={disabled}
              >
                <Text className="text-2xl mr-3">{action.icon}</Text>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-foreground font-bold text-sm"
                      style={{ color: disabled ? '#555' : '#fff' }}>{action.label}</Text>
                    {isRest && (
                      <View className="px-1.5 py-0.5 rounded" style={{ backgroundColor: '#001A2A' }}>
                        <Text className="text-xs" style={{ color: '#64B5F6' }}>FREE</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-muted-foreground text-xs">{action.desc}</Text>
                </View>
                <Text style={{ color: disabled ? '#333' : '#FFB81C' }}>›</Text>
              </Pressable>
            );
          })}

          {/* ── ADVANCE DAY ── */}
          <View className="mt-2 mb-4">
            <Pressable
              onPress={handleAdvanceDay}
              disabled={dayAdvanced}
              className="py-4 items-center"
              style={{
                backgroundColor: dayAdvanced ? '#111' : '#1A0000',
                borderWidth: 2,
                borderColor: dayAdvanced ? '#333' : '#E32636',
                opacity: dayAdvanced ? 0.6 : 1,
              }}
            >
              <Text className="text-lg font-bold" style={{ color: dayAdvanced ? '#555' : '#E32636' }}>
                {dayAdvanced ? '⏳ Day Advanced…' : `📅 END PRISON DAY ${day} → DAY ${day + 1}`}
              </Text>
              <Text className="text-xs mt-1" style={{ color: '#666' }}>
                {daysLeft <= 1
                  ? '🔓 Sentence ends — you will be released on advance'
                  : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining · Businesses continue outside`}
              </Text>
            </Pressable>

            {/* Locked notice — cannot leave until released */}
            <View className="mt-2 p-3 flex-row items-center gap-2"
              style={{ backgroundColor: '#0A0000', borderWidth: 1, borderColor: '#3A0000' }}>
              <Text className="text-lg">🔒</Text>
              <Text className="text-xs text-muted-foreground flex-1 leading-5">
                You cannot leave prison until your sentence is complete.
                Use the button above to advance each day. Release is automatic when sentence ends.
              </Text>
            </View>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}
