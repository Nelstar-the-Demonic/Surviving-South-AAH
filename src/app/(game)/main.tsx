import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useGame } from '@/store/gameContext';
import { DaySummaryModal } from '@/components/game/DaySummaryModal';
import { formatMoney, getLocationIcon, getDayName } from '@/lib/game/gameEngine';
import { AD_REWARD_DEFS, canClaimAdReward } from '@/lib/game/adRewards';
import type { AdRewardType } from '@/types/game';
import { StatusBar } from 'expo-status-bar';
import { hapticLight, hapticMedium, hapticSuccess, hapticError } from '@/lib/haptics';
import { useLocationTheme } from '@/lib/locationTheme';

// ── Design tokens ───────────────────────────────────────────────
const C = {
  bg:         '#0A0A0F',
  surface:    '#13131A',
  surfaceAlt: '#1A1A26',
  border:     '#2A2A3A',
  gold:       '#F5C842',
  goldDim:    '#C9A227',
  green:      '#4ADE80',
  red:        '#F87171',
  orange:     '#FB923C',
  blue:       '#60A5FA',
  textPrimary:'#F1F0FF',
  textSub:    '#9B9BB8',
  textMuted:  '#5A5A72',
};

const MENU_ITEMS = [
  { id: 1,  label: 'Daily',       icon: '⚡', route: '/(game)/daily-actions',      desc: 'Work & rest' },
  { id: 2,  label: 'Education',   icon: '🎓', route: '/(game)/education',           desc: 'Study & certs' },
  { id: 3,  label: 'Employment',  icon: '💼', route: '/(game)/employment',          desc: 'Jobs & hustles' },
  { id: 4,  label: 'Business',    icon: '🏪', route: '/(game)/business',            desc: 'Your ventures' },
  { id: 5,  label: 'Farming',     icon: '🌾', route: '/(game)/farming',             desc: 'Crops & livestock' },
  { id: 6,  label: 'Crime',       icon: '🔪', route: '/(game)/crime',               desc: 'High risk' },
  { id: 7,  label: 'Property',    icon: '🏠', route: '/(game)/property',            desc: 'Rent & buy' },
  { id: 8,  label: 'Vehicles',    icon: '🚗', route: '/(game)/vehicles',            desc: 'Transport' },
  { id: 9,  label: 'Shop',        icon: '🛒', route: '/(game)/shop',                desc: 'Food & goods' },
  { id: 10, label: 'Inventory',   icon: '🎒', route: '/(game)/inventory',           desc: 'Items & docs' },
  { id: 11, label: 'Bank',        icon: '🏦', route: '/(game)/bank',                desc: 'Savings' },
  { id: 12, label: 'Finances',    icon: '💹', route: '/(game)/financial-overview',  desc: 'Income overview' },
  { id: 13, label: 'Government',  icon: '🏛️', route: '/(game)/government',          desc: 'SASSA & SAPS' },
  { id: 14, label: 'People',      icon: '🤝', route: '/(game)/relationships',       desc: 'Family & friends' },
  { id: 15, label: 'Hospital',    icon: '🏥', route: '/(game)/hospital',            desc: 'Medical care' },
  { id: 16, label: 'Travel',      icon: '✈️', route: '/(game)/travel',              desc: 'Move cities' },
  { id: 17, label: 'Stats',       icon: '📊', route: '/(game)/stats-info',          desc: 'Character stats' },
  { id: 18, label: 'Profile',     icon: '👤', route: '/(game)/profile',             desc: 'Your character' },
  { id: 19, label: 'Save',        icon: '💾', route: '/(game)/save-game',           desc: 'Save progress' },
  { id: 20, label: 'Settings',    icon: '⚙️', route: '/(game)/settings',            desc: 'Game settings' },
];

function StatPill({ icon, value, label }: { icon: string; value: number; label: string }) {
  const locTheme = useLocationTheme();
  const color = value >= 70 ? C.green : value >= 35 ? C.gold : C.red;
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 3 }}>
        <Text style={{ fontSize: 11 }}>{icon}</Text>
        <Text style={{ color: C.textSub, fontSize: 10, fontWeight: '600' }}>{label}</Text>
        <Text style={{ color, fontSize: 11, fontWeight: '800' }}>{value}</Text>
      </View>
      <View style={{ width: '100%', height: 5, backgroundColor: locTheme.surface, borderRadius: 3, overflow: 'hidden' }}>
        <View style={{ width: `${value}%`, height: 5, backgroundColor: color, borderRadius: 3 }} />
      </View>
    </View>
  );
}

function MenuTile({ item, isLocked, isPrison, onPress }: {
  item: typeof MENU_ITEMS[0];
  isLocked: boolean;
  isPrison: boolean;
  onPress: () => void;
}) {
  const isCrime = item.label === 'Crime';
  const locTheme = useLocationTheme();
  const accentColor = isPrison ? C.red : isCrime ? '#FF6B6B' : C.gold;
  const bgColor = isPrison ? '#1A0808' : isCrime ? '#150808' : isLocked ? '#0D0D12' : locTheme.surface;

  return (
    <Pressable
      onPress={onPress}
      style={{
        width: '48%',
        backgroundColor: bgColor,
        borderWidth: 1,
        borderColor: isPrison ? C.red : isCrime ? '#3A1515' : isLocked ? locTheme.border : '#252535',
        borderTopWidth: isPrison || isCrime ? 2 : 1,
        borderTopColor: isPrison ? C.red : isCrime ? '#FF6B6B' : isLocked ? locTheme.border : '#252535',
        borderRadius: 10,
        padding: 14,
        marginBottom: 10,
        opacity: isLocked ? 0.35 : 1,
      }}
    >
      <Text style={{ fontSize: 28, marginBottom: 6 }}>{isLocked ? '🔒' : item.icon}</Text>
      <Text style={{
        color: isPrison ? C.red : isCrime ? '#FF9999' : isLocked ? C.textMuted : C.textPrimary,
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 2,
      }}>
        {item.label}
      </Text>
      <Text style={{ color: isLocked ? C.textMuted : C.textSub, fontSize: 10, lineHeight: 14 }}>
        {isLocked ? 'Imprisoned' : item.desc}
      </Text>
    </Pressable>
  );
}

export default function MainGame() {
  const router = useRouter();
  const { state, dispatch } = useGame();
  const locTheme = useLocationTheme();
  const [showEventModal, setShowEventModal] = useState(false);
  const [showBonusRewards, setShowBonusRewards] = useState(false);

  useEffect(() => {
    if (!state?.gameStarted) router.replace('/');
  }, []);

  if (!state?.gameStarted) return null;

  const { stats, playerName, location, day, cash, bank, prison, injury, currentCourse, pendingEvents, businesses, actionsUsedToday, maxActionsPerDay } = state;
  const hasPendingEvent = pendingEvents.length > 0;
  const activeEvent = hasPendingEvent ? pendingEvents[0] : null;
  const actionsLeft = Math.max(0, maxActionsPerDay - actionsUsedToday.length);

  function claimAdReward(type: AdRewardType) {
    if (type === 'extra_action') dispatch({ type: 'GRANT_BONUS_ACTION' });
    else dispatch({ type: 'CLAIM_AD_REWARD', payload: type });
    hapticSuccess();
  }

  function handleAdvanceDay() {
    dispatch({ type: 'ADVANCE_DAY' });
    hapticMedium();
  }

  function handleMenuPress(route: string, id: number) {
    if (prison.imprisoned) {
      const allowed = ['/(game)/prison', '/(game)/save-game', '/(game)/settings'];
      if (!allowed.includes(route)) { 
        hapticError();
        router.push('/(game)/prison'); 
        return; 
      }
      hapticLight();
      router.push(route as any); return;
    }
    hapticLight();
    router.push(route as any);
  }

  return (
    <View style={{ flex: 1, backgroundColor: locTheme.bg }}>
      <StatusBar style="light" />
      <DaySummaryModal />

      {/* ── TOP HUD ── */}
      <View style={{
        backgroundColor: locTheme.surface,
        paddingTop: 48, paddingHorizontal: 16, paddingBottom: 14,
        borderBottomWidth: 1, borderBottomColor: locTheme.border,
      }}>
        {/* Player row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <View>
            <Text style={{ color: C.textPrimary, fontSize: 18, fontWeight: '800', letterSpacing: 0.3 }}>
              {playerName}
            </Text>
            <Text style={{ color: C.textSub, fontSize: 11, marginTop: 1 }}>
              {getLocationIcon(location)} {location} · Day {day} — {getDayName(day)}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: C.green, fontSize: 20, fontWeight: '800' }}>
              {formatMoney(cash)}
            </Text>
            {bank.currentBalance > 0 && (
              <Text style={{ color: C.textSub, fontSize: 11, marginTop: 2 }}>
                🏦 {formatMoney(bank.currentBalance)}
              </Text>
            )}
          </View>
        </View>

        {/* Stat bars row */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <StatPill icon="❤️" label="HP" value={stats.health} />
          <StatPill icon="🍽️" label="Food" value={stats.hunger} />
          <StatPill icon="⚡" label="NRG" value={stats.energy} />
          <StatPill icon="😊" label="Joy" value={stats.happiness} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 14 }}>

        {/* ── PRISON BANNER ── */}
        {prison.imprisoned && (
          <Pressable
            onPress={() => router.push('/(game)/prison')}
            style={{ marginBottom: 12, padding: 14, backgroundColor: '#1A0808', borderWidth: 2, borderColor: C.red, borderRadius: 8 }}
          >
            <Text style={{ color: C.red, fontWeight: '800', fontSize: 14, marginBottom: 4 }}>
              🔒 IMPRISONED — {prison.crime}
            </Text>
            <Text style={{ color: C.textSub, fontSize: 12, marginBottom: 10 }}>
              {prison.daysServed} / {prison.sentenceDays} days served · {Math.max(0, prison.sentenceDays - prison.daysServed)} remaining
            </Text>
            <View style={{ backgroundColor: C.red, padding: 10, borderRadius: 5, alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>⛏️ GO TO PRISON → ADVANCE DAY</Text>
            </View>
          </Pressable>
        )}

        {/* ── INJURY BANNER ── */}
        {injury.injured && (
          <View style={{ marginBottom: 12, padding: 12, backgroundColor: '#1A0D08', borderWidth: 1, borderColor: C.orange, borderRadius: 8 }}>
            <Text style={{ color: C.orange, fontWeight: '700', fontSize: 13, marginBottom: 2 }}>🏥 RECOVERING FROM INJURY</Text>
            <Text style={{ color: C.textSub, fontSize: 12 }}>{injury.description} · {injury.daysHealing} days healing</Text>
          </View>
        )}

        {/* ── PENDING EVENT BANNER ── */}
        {hasPendingEvent && (
          <Pressable
            onPress={() => setShowEventModal(true)}
            style={{ marginBottom: 12, padding: 14, backgroundColor: '#15120A', borderWidth: 2, borderColor: C.gold, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <View>
              <Text style={{ color: C.gold, fontWeight: '800', fontSize: 13 }}>
                📢 {pendingEvents.length} EVENT{pendingEvents.length > 1 ? 'S' : ''} PENDING
              </Text>
              <Text style={{ color: C.textSub, fontSize: 11, marginTop: 2 }}>{activeEvent?.title ?? 'Tap to respond'}</Text>
            </View>
            <Text style={{ color: C.gold, fontSize: 22 }}>›</Text>
          </Pressable>
        )}

        {/* ── EVENT MODAL ── */}
        <Modal visible={showEventModal && hasPendingEvent} transparent animationType="fade" onRequestClose={() => setShowEventModal(false)}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.85)' }}>
            <View style={{ margin: 16, padding: 20, width: '90%', backgroundColor: locTheme.surface, borderWidth: 2, borderColor: C.gold, borderRadius: 12 }}>
              {activeEvent && (<>
                <Text style={{ color: C.gold, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 4 }}>
                  📢 {activeEvent.type.toUpperCase()}
                </Text>
                <Text style={{ color: C.textPrimary, fontWeight: '800', fontSize: 17, marginBottom: 8 }}>{activeEvent.title}</Text>
                <Text style={{ color: C.textSub, fontSize: 13, lineHeight: 20, marginBottom: 16 }}>{activeEvent.description}</Text>
                {activeEvent.choices.length > 0 ? (
                  activeEvent.choices.map((choice, i) => (
                    <Pressable
                      key={i}
                      onPress={() => {
                        dispatch({ type: 'RESOLVE_EVENT', payload: { eventId: activeEvent.id, choiceIndex: i } });
                        if (pendingEvents.length <= 1) setShowEventModal(false);
                        hapticMedium();
                      }}
                      style={{ marginBottom: 8, padding: 12, borderWidth: 1, borderColor: C.gold, backgroundColor: '#15120A', borderRadius: 8 }}
                    >
                      <Text style={{ color: C.textPrimary, fontWeight: '700', fontSize: 13 }}>{choice.label}</Text>
                      {choice.outcome ? <Text style={{ color: C.textSub, fontSize: 11, marginTop: 3 }}>{choice.outcome}</Text> : null}
                    </Pressable>
                  ))
                ) : (
                  <Pressable
                    onPress={() => {
                      dispatch({ type: 'DISMISS_EVENT', payload: activeEvent.id });
                      if (pendingEvents.length <= 1) setShowEventModal(false);
                    }}
                    style={{ padding: 12, alignItems: 'center', backgroundColor: C.gold, borderRadius: 8 }}
                  >
                    <Text style={{ color: C.bg, fontWeight: '800', fontSize: 14 }}>ACKNOWLEDGE</Text>
                  </Pressable>
                )}
                {pendingEvents.length > 1 && (
                  <Text style={{ color: C.textMuted, fontSize: 11, textAlign: 'center', marginTop: 12 }}>
                    {pendingEvents.length - 1} more event{pendingEvents.length - 1 > 1 ? 's' : ''} pending
                  </Text>
                )}
              </>)}
              <Pressable onPress={() => setShowEventModal(false)} style={{ marginTop: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: locTheme.border, borderRadius: 6 }}>
                <Text style={{ color: C.textSub, fontSize: 12 }}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* ── DAILY ACTIONS CARD ── */}
        <View style={{ backgroundColor: locTheme.surface, borderWidth: 1, borderColor: C.gold, borderTopWidth: 3, borderTopColor: C.gold, borderRadius: 10, padding: 14, marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ color: C.textPrimary, fontWeight: '800', fontSize: 14 }}>⚡ Daily Actions</Text>
            <Text style={{ color: actionsLeft === 0 ? C.red : C.gold, fontSize: 13, fontWeight: '700' }}>
              {actionsLeft}/{maxActionsPerDay} left
            </Text>
          </View>

          {/* Action pips */}
          <View style={{ flexDirection: 'row', gap: 6, marginBottom: 10 }}>
            {Array.from({ length: maxActionsPerDay }).map((_, i) => {
              const used = i < (maxActionsPerDay - actionsLeft);
              return (
                <View key={i} style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: used ? C.gold : locTheme.border }} />
              );
            })}
          </View>

          {/* Action badges */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {['work', 'exercise', 'study', 'socialize', 'shower'].map(a => {
              const done = actionsUsedToday.includes(a);
              return (
                <View key={a} style={{
                  paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
                  backgroundColor: done ? '#1C1800' : C.surfaceAlt,
                  borderWidth: 1, borderColor: done ? C.goldDim : locTheme.border,
                }}>
                  <Text style={{ color: done ? C.gold : C.textMuted, fontSize: 11, fontWeight: done ? '700' : '400', textTransform: 'capitalize' }}>
                    {done ? '✓ ' : ''}{a}
                  </Text>
                </View>
              );
            })}
          </View>

          {actionsLeft === 0 && (
            <Text style={{ color: C.red, fontSize: 11, marginTop: 8, fontWeight: '600' }}>
              ⛔ No actions left — advance the day to continue
            </Text>
          )}

          {/* Course progress */}
          {currentCourse && (
            <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: locTheme.border }}>
              <Text style={{ color: C.textSub, fontSize: 11, marginBottom: 3 }}>📚 STUDYING</Text>
              <Text style={{ color: C.textPrimary, fontSize: 13, fontWeight: '700' }}>{currentCourse.courseName}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                <Text style={{ color: C.textSub, fontSize: 11 }}>Day {currentCourse.daysCompleted}/{currentCourse.totalDays}</Text>
                <Text style={{ color: C.textSub, fontSize: 11 }}>{Math.round((currentCourse.studyPointsEarned / currentCourse.studyPointsRequired) * 100)}%</Text>
              </View>
              <View style={{ height: 5, backgroundColor: locTheme.border, borderRadius: 3, marginTop: 4, overflow: 'hidden' }}>
                <View style={{ height: 5, borderRadius: 3, width: `${Math.min(100, Math.round((currentCourse.studyPointsEarned / currentCourse.studyPointsRequired) * 100))}%`, backgroundColor: C.blue }} />
              </View>
            </View>
          )}

          {/* Businesses */}
          {businesses.length > 0 && (
            <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: locTheme.border }}>
              <Text style={{ color: C.textSub, fontSize: 11, marginBottom: 4 }}>🏪 BUSINESSES</Text>
              {businesses.slice(0, 2).map(b => (
                <View key={b.id} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Text style={{ color: C.textSub, fontSize: 12 }}>{b.name}</Text>
                  <Text style={{ color: C.green, fontSize: 12, fontWeight: '700' }}>+{formatMoney(b.dailyIncome)}/day</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ── END DAY BUTTON ── */}
        <Pressable
          onPress={handleAdvanceDay}
          style={{
            backgroundColor: C.gold, padding: 16, borderRadius: 10,
            alignItems: 'center', marginBottom: 4,
          }}
        >
          <Text style={{ color: C.bg, fontWeight: '900', fontSize: 15, letterSpacing: 0.5 }}>
            END DAY {day} → START DAY {day + 1}
          </Text>
        </Pressable>
        <Text style={{ color: C.textMuted, fontSize: 10, textAlign: 'center', marginBottom: 16 }}>
          Applies stat changes, business income & random events
        </Text>

        {/* ── BONUS REWARDS (Collapsible) ── */}
        <View style={{ backgroundColor: locTheme.surface, borderWidth: 1, borderColor: '#2A2014', borderRadius: 10, marginBottom: 16, overflow: 'hidden' }}>
          <Pressable 
            onPress={() => setShowBonusRewards(!showBonusRewards)}
            style={{ padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Text style={{ color: C.goldDim, fontSize: 12, fontWeight: '700', letterSpacing: 1 }}>
              📺 BONUS REWARDS
            </Text>
            <Text style={{ color: C.goldDim, fontSize: 16, fontWeight: '800' }}>
              {showBonusRewards ? '−' : '+'}
            </Text>
          </Pressable>
          
          {showBonusRewards && (
            <View style={{ gap: 8, paddingHorizontal: 14, paddingBottom: 14 }}>
              {AD_REWARD_DEFS.map(def => {
                const { canClaim, reason } = canClaimAdReward(state, def.type);
                return (
                  <Pressable
                    key={def.type}
                    onPress={() => canClaim && claimAdReward(def.type)}
                    disabled={!canClaim}
                    style={{
                      flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12,
                      backgroundColor: canClaim ? '#15120A' : C.surfaceAlt,
                      borderWidth: 1, borderColor: canClaim ? '#3A2800' : locTheme.border,
                      borderRadius: 8, opacity: canClaim ? 1 : 0.5,
                    }}
                  >
                    <Text style={{ fontSize: 22 }}>{def.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: canClaim ? C.gold : C.textSub, fontSize: 13, fontWeight: '700' }}>{def.title}</Text>
                      <Text style={{ color: C.textMuted, fontSize: 11, marginTop: 2 }}>{canClaim ? def.description : reason}</Text>
                    </View>
                    {canClaim && <Text style={{ color: C.gold, fontSize: 12, fontWeight: '800' }}>CLAIM ▶</Text>}
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* ── MAIN MENU GRID (2 columns) ── */}
        <Text style={{ color: C.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10 }}>MAIN MENU</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {MENU_ITEMS.map((item) => {
            const allowedWhileImprisoned = ['/(game)/prison', '/(game)/save-game', '/(game)/settings'];
            const isLocked = prison.imprisoned && !allowedWhileImprisoned.includes(item.route);
            const isPrison = item.route === '/(game)/prison';
            return (
              <MenuTile
                key={item.id}
                item={item}
                isLocked={isLocked}
                isPrison={isPrison}
                onPress={() => handleMenuPress(item.route, item.id)}
              />
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}
