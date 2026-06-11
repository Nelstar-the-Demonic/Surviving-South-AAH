import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useGame } from '@/store/gameContext';
import { StatBar } from '@/components/game/StatBar';
import { InfoCard } from '@/components/game/InfoCard';
import { GameButton } from '@/components/game/GameButton';
import { DaySummaryModal } from '@/components/game/DaySummaryModal';
import { formatMoney, getLocationIcon, getDayName } from '@/lib/game/gameEngine';
import { AD_REWARD_DEFS, canClaimAdReward } from '@/lib/game/adRewards';
import type { AdRewardType } from '@/types/game';
import { StatusBar } from 'expo-status-bar';

const MENU_ITEMS = [
  { id: 1,  label: 'Daily Actions', icon: '⚡', route: '/(game)/daily-actions', desc: 'Work, exercise, study, rest' },
  { id: 2,  label: 'Education',     icon: '🎓', route: '/(game)/education',     desc: 'Study & qualifications' },
  { id: 3,  label: 'Employment',    icon: '💼', route: '/(game)/employment',    desc: 'Jobs & hustles' },
  { id: 4,  label: 'Business',      icon: '🏪', route: '/(game)/business',      desc: 'Manage your businesses' },
  { id: 5,  label: 'Farming',       icon: '🌾', route: '/(game)/farming',       desc: 'Crops, livestock & produce' },
  { id: 6,  label: 'Crime',         icon: '🔪', route: '/(game)/crime',         desc: 'High risk, high reward' },
  { id: 7,  label: 'Property',      icon: '🏠', route: '/(game)/property',      desc: 'Rent or buy property' },
  { id: 8,  label: 'Vehicles',      icon: '🚗', route: '/(game)/vehicles',      desc: 'Transport & licences' },
  { id: 9,  label: 'Shop',          icon: '🛒', route: '/(game)/shop',          desc: 'Buy food, hygiene & more' },
  { id: 10, label: 'Inventory',     icon: '🎒', route: '/(game)/inventory',     desc: 'Your items & documents' },
  { id: 11, label: 'Bank',          icon: '🏦', route: '/(game)/bank',              desc: 'Deposits, savings & interest' },
  { id: 12, label: 'Finances',      icon: '💹', route: '/(game)/financial-overview', desc: 'Income & expense breakdown' },
  { id: 13, label: 'Government',    icon: '🏛️', route: '/(game)/government',         desc: 'SASSA, licences, SAPS' },
  { id: 14, label: 'Relationships', icon: '🤝', route: '/(game)/relationships',      desc: 'Family, friends & partner' },
  { id: 15, label: 'Hospital',      icon: '🏥', route: '/(game)/hospital',           desc: 'Medical care & health services' },
  { id: 16, label: 'Travel',        icon: '✈️', route: '/(game)/travel',             desc: 'Move between cities & locations' },
  { id: 17, label: 'Stats',         icon: '📊', route: '/(game)/stats-info',         desc: 'Full character stats & profile' },
  { id: 18, label: 'Profile',       icon: '👤', route: '/(game)/profile',            desc: 'Your character profile' },
  { id: 19, label: 'Save Game',     icon: '💾', route: '/(game)/save-game',          desc: 'Save your progress' },
  { id: 20, label: 'Settings',      icon: '⚙️', route: '/(game)/settings',           desc: 'Game settings' },
];

export default function MainGame() {
  const router = useRouter();
  const { state, dispatch } = useGame();

  useEffect(() => {
    if (!state?.gameStarted) {
      router.replace('/');
    }
  }, []);

  const [showEventModal, setShowEventModal] = useState(false);

  if (!state?.gameStarted) return null;

  const { stats, playerName, location, day, cash, bank, prison, injury, currentCourse, pendingEvents, businesses, actionsUsedToday, maxActionsPerDay } = state;

  const hasPendingEvent = pendingEvents.length > 0;
  const activeEvent = hasPendingEvent ? pendingEvents[0] : null;
  const actionsLeft = Math.max(0, maxActionsPerDay - actionsUsedToday.length);

  function claimAdReward(type: AdRewardType) {
    if (type === 'extra_action') {
      dispatch({ type: 'GRANT_BONUS_ACTION' });
    } else {
      dispatch({ type: 'CLAIM_AD_REWARD', payload: type });
    }
  }

  function handleAdvanceDay() {
    dispatch({ type: 'ADVANCE_DAY' });
  }

  function handleMenuPress(route: string, id: number) {
    // If imprisoned, only allow Prison and Save Game screens
    if (prison.imprisoned) {
      const allowedWhileImprisoned = ['/(game)/prison', '/(game)/save-game', '/(game)/settings'];
      if (!allowedWhileImprisoned.includes(route)) {
        router.push('/(game)/prison');
        return;
      }
      router.push(route as any);
      return;
    }
    // Farming only accessible with farm
    if (id === 5) {
      const hasFarm = state.properties.some(p => p.type === 'Farm') || state.location === 'Farm';
      if (!hasFarm) {
        router.push('/(game)/farming');
        return;
      }
    }
    router.push(route as any);
  }

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" />
      <DaySummaryModal />

      {/* Top HUD Bar */}
      <View
        className="bg-card px-4 pt-12 pb-3"
        style={{ borderBottomWidth: 2, borderBottomColor: '#FFB81C' }}
      >
        <View className="flex-row justify-between items-start mb-2">
          <View>
            <Text className="text-foreground text-lg font-bold">{playerName}</Text>
            <Text className="text-muted-foreground text-xs">
              {getLocationIcon(location)} {location}  ·  Day {day} ({getDayName(day)})
            </Text>
          </View>
          <View className="items-end">
            <Text style={{ color: '#4CAF50' }} className="text-xl font-bold">
              {formatMoney(cash)}
            </Text>
            {bank.currentBalance > 0 && (
              <Text className="text-muted-foreground text-xs">
                Bank: {formatMoney(bank.currentBalance)}
              </Text>
            )}
          </View>
        </View>

        {/* Critical Stats Row */}
        <View className="flex-row gap-3">
          {[
            { label: 'Health', val: stats.health, icon: '❤️' },
            { label: 'Hunger', val: stats.hunger, icon: '🍽️' },
            { label: 'Energy', val: stats.energy, icon: '⚡' },
            { label: 'Happiness', val: stats.happiness, icon: '😊' },
          ].map(({ label, val, icon }) => (
            <View key={label} className="flex-1">
              <View className="flex-row justify-between mb-0.5">
                <Text className="text-xs">{icon}</Text>
                <Text
                  className="text-xs font-bold"
                  style={{ color: val >= 70 ? '#4CAF50' : val >= 35 ? '#FFB81C' : '#E32636' }}
                >{val}</Text>
              </View>
              <View className="h-1.5 bg-secondary">
                <View
                  className="h-1.5"
                  style={{
                    width: `${val}%`,
                    backgroundColor: val >= 70 ? '#4CAF50' : val >= 35 ? '#FFB81C' : '#E32636',
                  }}
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View className="px-4 pt-4 pb-6">

          {/* Prison Banner */}
          {prison.imprisoned && (
            <Pressable
              onPress={() => router.push('/(game)/prison')}
              className="mb-4 p-4"
              style={{ backgroundColor: '#1A0000', borderWidth: 2, borderColor: '#E32636' }}
            >
              <Text className="text-sm font-bold mb-1" style={{ color: '#E32636' }}>
                🔒 YOU ARE IMPRISONED — {prison.crime}
              </Text>
              <Text className="text-muted-foreground text-xs mb-2">
                Days served: {prison.daysServed} / {prison.sentenceDays} · {Math.max(0, prison.sentenceDays - prison.daysServed)} days remaining
              </Text>
              <View className="py-2 items-center" style={{ backgroundColor: '#E32636' }}>
                <Text className="font-bold text-sm" style={{ color: '#fff' }}>
                  ⛏️ GO TO PRISON SCREEN → ADVANCE DAY
                </Text>
              </View>
              <Text className="text-xs text-center mt-2" style={{ color: '#555' }}>
                🔒 Menu locked — only Prison, Save Game &amp; Settings available
              </Text>
            </Pressable>
          )}

          {/* Injury Banner */}
          {injury.injured && (
            <View
              className="mb-4 p-4"
              style={{ backgroundColor: '#1A0500', borderWidth: 1, borderColor: '#FF6B35' }}
            >
              <Text className="text-sm font-bold mb-1" style={{ color: '#FF6B35' }}>
                🏥 RECOVERING FROM INJURY
              </Text>
              <Text className="text-muted-foreground text-xs">
                {injury.description}  ·  {injury.daysHealing} days healing remaining
              </Text>
            </View>
          )}

          {/* Pending Events Banner + inline modal */}
          {hasPendingEvent && (
            <Pressable
              onPress={() => setShowEventModal(true)}
              className="mb-4 p-4"
              style={{ backgroundColor: '#0D0A00', borderWidth: 2, borderColor: '#FFB81C' }}
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text style={{ color: '#FFB81C' }} className="text-sm font-bold">
                    📢 {pendingEvents.length} EVENT{pendingEvents.length > 1 ? 'S' : ''} PENDING
                  </Text>
                  <Text className="text-muted-foreground text-xs mt-1">
                    {activeEvent?.title ?? 'Tap to view and respond'}
                  </Text>
                </View>
                <Text style={{ color: '#FFB81C' }} className="text-xl">→</Text>
              </View>
            </Pressable>
          )}

          {/* Event modal overlay */}
          <Modal
            visible={showEventModal && hasPendingEvent}
            transparent
            animationType="fade"
            onRequestClose={() => setShowEventModal(false)}
          >
            <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.82)' }}>
              <View className="mx-4 p-5 w-full max-w-sm" style={{ backgroundColor: '#0D0D0D', borderWidth: 2, borderColor: '#FFB81C' }}>
                {activeEvent && (
                  <>
                    <Text style={{ color: '#FFB81C' }} className="text-xs tracking-wider mb-1">📢 {activeEvent.type.toUpperCase()}</Text>
                    <Text className="text-foreground font-bold text-lg mb-3">{activeEvent.title}</Text>
                    <Text className="text-muted-foreground text-sm mb-4 leading-5">{activeEvent.description}</Text>
                    {activeEvent.choices.length > 0 ? (
                      activeEvent.choices.map((choice, i) => (
                        <Pressable
                          key={i}
                          onPress={() => {
                            dispatch({ type: 'RESOLVE_EVENT', payload: { eventId: activeEvent.id, choiceIndex: i } });
                            if (pendingEvents.length <= 1) setShowEventModal(false);
                          }}
                          className="mb-2 p-3"
                          style={{ borderWidth: 1, borderColor: '#FFB81C', backgroundColor: '#0D0A00' }}
                        >
                          <Text className="text-foreground font-bold text-sm">{choice.label}</Text>
                          {choice.outcome ? <Text className="text-muted-foreground text-xs mt-1">{choice.outcome}</Text> : null}
                        </Pressable>
                      ))
                    ) : (
                      <Pressable
                        onPress={() => {
                          dispatch({ type: 'DISMISS_EVENT', payload: activeEvent.id });
                          if (pendingEvents.length <= 1) setShowEventModal(false);
                        }}
                        className="p-3 items-center"
                        style={{ backgroundColor: '#FFB81C' }}
                      >
                        <Text className="font-bold text-sm" style={{ color: '#0D0D0D' }}>ACKNOWLEDGE</Text>
                      </Pressable>
                    )}
                    {pendingEvents.length > 1 && (
                      <Text className="text-muted-foreground text-xs text-center mt-3">
                        {pendingEvents.length - 1} more event{pendingEvents.length - 1 > 1 ? 's' : ''} pending
                      </Text>
                    )}
                  </>
                )}
                <Pressable onPress={() => setShowEventModal(false)} className="mt-3 py-2 items-center" style={{ borderWidth: 1, borderColor: '#333' }}>
                  <Text className="text-muted-foreground text-xs">Close — view all in Events tab</Text>
                </Pressable>
              </View>
            </View>
          </Modal>

          {/* Daily Status */}
          <InfoCard accent>
            {/* ── Action counter ── */}
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-foreground font-bold">Daily Actions</Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {Array.from({ length: maxActionsPerDay }).map((_, i) => (
                  <View
                    key={i}
                    style={{
                      width: 22, height: 22, borderRadius: 4, justifyContent: 'center', alignItems: 'center',
                      backgroundColor: i < (maxActionsPerDay - actionsLeft) ? '#FFB81C' : '#222',
                      borderWidth: 1,
                      borderColor: i < (maxActionsPerDay - actionsLeft) ? '#D4AF37' : '#444',
                    }}
                  >
                    <Text style={{ fontSize: 10, color: i < (maxActionsPerDay - actionsLeft) ? '#000' : '#555' }}>
                      {i < (maxActionsPerDay - actionsLeft) ? '✓' : '○'}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
            <Text style={{ color: actionsLeft === 0 ? '#E32636' : '#888', fontSize: 12, marginBottom: 8 }}>
              {actionsLeft === 0
                ? '⛔ No actions remaining — advance the day to continue.'
                : `${actionsLeft}/${maxActionsPerDay} actions remaining today`}
            </Text>

            {/* ── Used actions ── */}
            <View className="flex-row flex-wrap gap-2">
              {['work', 'exercise', 'study', 'socialize', 'shower'].map(a => (
                <View
                  key={a}
                  className="px-2 py-1"
                  style={{
                    backgroundColor: actionsUsedToday.includes(a) ? '#1A1400' : '#111',
                    borderWidth: 1,
                    borderColor: actionsUsedToday.includes(a) ? '#FFB81C' : '#333',
                  }}
                >
                  <Text
                    className="text-xs capitalize"
                    style={{ color: actionsUsedToday.includes(a) ? '#FFB81C' : '#666' }}
                  >
                    {actionsUsedToday.includes(a) ? '✓ ' : ''}{a}
                  </Text>
                </View>
              ))}
            </View>

            {currentCourse && (
              <View className="mt-3 pt-3" style={{ borderTopWidth: 1, borderTopColor: '#222' }}>
                <Text className="text-muted-foreground text-xs mb-1">📚 STUDYING</Text>
                <Text className="text-foreground text-sm font-bold">{currentCourse.courseName}</Text>
                <View className="flex-row justify-between mt-1">
                  <Text className="text-muted-foreground text-xs">
                    Day {currentCourse.daysCompleted}/{currentCourse.totalDays}
                  </Text>
                  <Text className="text-muted-foreground text-xs">
                    Progress: {Math.round((currentCourse.studyPointsEarned / currentCourse.studyPointsRequired) * 100)}%
                  </Text>
                </View>
                <View className="h-1.5 bg-secondary mt-1">
                  <View
                    className="h-1.5"
                    style={{
                      width: `${Math.min(100, Math.round((currentCourse.studyPointsEarned / currentCourse.studyPointsRequired) * 100))}%`,
                      backgroundColor: '#4CAF50',
                    }}
                  />
                </View>
              </View>
            )}

            {businesses.length > 0 && (
              <View className="mt-3 pt-3" style={{ borderTopWidth: 1, borderTopColor: '#222' }}>
                <Text className="text-muted-foreground text-xs mb-1">🏪 BUSINESSES RUNNING</Text>
                {businesses.slice(0, 2).map(b => (
                  <View key={b.id} className="flex-row justify-between">
                    <Text className="text-foreground text-xs">{b.name}</Text>
                    <Text style={{ color: '#4CAF50' }} className="text-xs font-bold">
                      +{formatMoney(b.dailyIncome)}/day
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </InfoCard>

          {/* ── Rewarded Ads Panel ── */}
          <View style={{ backgroundColor: '#0D0A00', borderWidth: 1, borderColor: '#2A1A00', padding: 14, borderRadius: 4 }}>
            <Text style={{ color: '#D4AF37', fontSize: 12, fontWeight: '700', marginBottom: 10, letterSpacing: 1 }}>
              📺 BONUS REWARDS (Watch Ad)
            </Text>
            <View style={{ gap: 8 }}>
              {AD_REWARD_DEFS.map(def => {
                const { canClaim, reason } = canClaimAdReward(state, def.type);
                return (
                  <Pressable
                    key={def.type}
                    onPress={() => canClaim && claimAdReward(def.type)}
                    disabled={!canClaim}
                    style={{
                      flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10,
                      backgroundColor: canClaim ? '#1A1000' : '#0A0A0A',
                      borderWidth: 1, borderColor: canClaim ? '#3A2200' : '#1A1A1A',
                      borderRadius: 4, opacity: canClaim ? 1 : 0.5,
                    }}
                  >
                    <Text style={{ fontSize: 20 }}>{def.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: canClaim ? '#FFB81C' : '#555', fontSize: 13, fontWeight: '700' }}>
                        {def.title}
                      </Text>
                      <Text style={{ color: '#666', fontSize: 11, marginTop: 2 }}>
                        {canClaim ? def.description : reason}
                      </Text>
                    </View>
                    {canClaim && (
                      <Text style={{ color: '#FFB81C', fontSize: 11, fontWeight: '700' }}>CLAIM ▶</Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
            <Text style={{ color: '#444', fontSize: 10, marginTop: 8, textAlign: 'center' }}>
              Ads are optional. Working, farming & business are always more profitable.
            </Text>
          </View>

          {/* End Day Button */}
          <View className="mb-6">
            <GameButton
              label={`END DAY ${day} → START DAY ${day + 1}`}
              onPress={handleAdvanceDay}
              variant="primary"
              size="lg"
            />
            <Text className="text-muted-foreground text-xs text-center mt-2">
              Advancing the day applies stat changes, business income & events
            </Text>
          </View>

          {/* Main Menu Grid */}
          <Text className="text-muted-foreground text-xs mb-3 tracking-wider">MAIN MENU</Text>
          {MENU_ITEMS.map((item) => {
            const allowedWhileImprisoned = ['/(game)/prison', '/(game)/save-game', '/(game)/settings'];
            const isLocked = prison.imprisoned && !allowedWhileImprisoned.includes(item.route);
            const isPrisonItem = item.route === '/(game)/prison';
            return (
              <Pressable
                key={item.id}
                onPress={() => handleMenuPress(item.route, item.id)}
                className="mb-2 p-4 flex-row items-center"
                style={{
                  backgroundColor: isPrisonItem ? '#1A0000' : isLocked ? '#080808' : item.label === 'Crime' ? '#0D0000' : '#0D0D0D',
                  borderWidth: 1,
                  borderColor: isPrisonItem ? '#E32636' : isLocked ? '#111' : item.label === 'Crime' ? '#3A0000' : '#1E1E1E',
                  borderLeftWidth: 3,
                  borderLeftColor: isPrisonItem ? '#E32636' : isLocked ? '#1A1A1A' : item.label === 'Crime' ? '#E32636' : '#333',
                  opacity: isLocked ? 0.35 : 1,
                }}
              >
                <Text className="text-2xl mr-4">{isLocked ? '🔒' : item.icon}</Text>
                <View className="flex-1">
                  <Text className="font-bold text-sm" style={{
                    color: isPrisonItem ? '#E32636' : isLocked ? '#444' : item.label === 'Crime' ? '#FF4444' : '#EAEAEA',
                  }}>
                    {item.id}. {item.label}
                  </Text>
                  <Text className="text-xs" style={{ color: isLocked ? '#333' : '#666' }}>
                    {isLocked ? 'Unavailable while imprisoned' : item.desc}
                  </Text>
                </View>
                <Text style={{ color: isLocked ? '#222' : '#555' }} className="text-lg">›</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
