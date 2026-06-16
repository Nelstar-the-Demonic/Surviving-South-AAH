import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useGame } from '@/store/gameContext';
import { GameHeader } from '@/components/game/GameHeader';
import { InfoCard } from '@/components/game/InfoCard';
import { StatBar } from '@/components/game/StatBar';
import { AVAILABLE_JOBS } from '@/lib/game/gameData';
import { formatMoney } from '@/lib/game/gameEngine';

const EXERCISE_OPTIONS = [
  { type: 'Running',      effects: '+Fitness, +Endurance',          icon: '🏃' },
  { type: 'Calisthenics', effects: '+Fitness, +Discipline',          icon: '🤸' },
  { type: 'Weightlifting', effects: '+Fitness, +Discipline, +Health', icon: '🏋️' },
  { type: 'Cycling',      effects: '+Fitness, +Endurance',           icon: '🚴' },
  { type: 'Sports',       effects: '+Fitness, +Happiness',           icon: '⚽' },
];

const SOCIALIZE_OPTIONS = [
  { type: 'community_service', label: 'Community Service',  effects: '++Reputation, -Stress',     icon: '🤲' },
  { type: 'networking',        label: 'Professional Networking', effects: '+Reputation, -Stress',  icon: '🤝' },
  { type: 'neighbourhood',     label: 'Neighbourhood Chat', effects: '+Reputation, +Happiness',    icon: '🏘️' },
  { type: 'party',             label: 'Party / Tavern',     effects: '++Happiness, +++Stress-relief', icon: '🎉' },
  { type: 'casual',            label: 'Hang Out',           effects: '+Happiness, -Stress',        icon: '😊' },
];

export default function DailyActions() {
  const { state, dispatch, canWorkToday, workActionsToday, maxWorkActionsToday } = useGame();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  if (!state?.gameStarted) return null;
  const { stats, actionsUsedToday, maxActionsPerDay, qualifications, location, cash, injury } = state;

  function showFeedback(msg: string) {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2500);
  }

  const actionsLeft = maxActionsPerDay - actionsUsedToday.length;
  const isCrippled = injury.crippled;

  function doWork(jobId: string) {
    if (!canWorkToday) return;
    dispatch({ type: 'WORK', payload: jobId });
    const job = AVAILABLE_JOBS.find(j => j.id === jobId);
    showFeedback(job ? `✅ Worked as ${job.title}. +R${job.dailyIncome} earned.` : '✅ Done.');
    setActiveSection(null);
  }

  function doExercise(type: string) {
    if (isCrippled && ['Running', 'Weightlifting'].includes(type)) {
      showFeedback('⚠️ Injury prevents this exercise.'); return;
    }
    dispatch({ type: 'EXERCISE', payload: type });
    showFeedback(`💪 ${type} done. Fitness, Discipline & Endurance improved.`);
    setActiveSection(null);
  }

  function doStudy() {
    if (!state.currentCourse) {
      showFeedback('📚 Not enrolled. Visit Education first.'); return;
    }
    dispatch({ type: 'STUDY' });
    showFeedback(`📖 Studied ${state.currentCourse.courseName}. Education stat increased.`);
  }

  function doSocialize(type: string, label: string) {
    dispatch({ type: 'SOCIALIZE_TYPED', payload: type });
    const rep = type === 'community_service' ? '++Reputation'
      : type === 'networking' ? '+Reputation'
      : type === 'neighbourhood' ? '+Reputation'
      : '';
    showFeedback(`🤝 ${label}. Happiness up, Stress down.${rep ? ' ' + rep + '.' : ''}`);
    setActiveSection(null);
  }

  function doRest() {
    dispatch({ type: 'REST' });
    showFeedback('😴 Rested. Energy restored.');
  }

  function doShower() {
    dispatch({ type: 'SHOWER' });
    showFeedback('🚿 Showered. Hygiene improved.');
  }

  const availableJobs = AVAILABLE_JOBS.filter(j => {
    const hasQuals = j.requiredQualifications.every(q => qualifications.includes(q));
    const inLocation = j.requiredLocation.length === 0 || j.requiredLocation.includes(location);
    const notCrippled = !(isCrippled && j.energyCost > 45);
    return hasQuals && inLocation && notCrippled;
  });

  const doneExercise = actionsUsedToday.includes('exercise');
  const doneStudy    = actionsUsedToday.includes('study');
  const doneSocialize = actionsUsedToday.includes('socialize');
  const doneShower   = actionsUsedToday.includes('shower');
  const workLimitReached = !canWorkToday;

  return (
    <View className="flex-1 bg-background">
      <GameHeader
        title="Daily Actions"
        subtitle={`Actions remaining: ${actionsLeft}/${maxActionsPerDay}`}
      />

      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View className="px-4 pt-4 pb-10">

          {feedback && (
            <View className="mb-4 p-3" style={{ backgroundColor: '#0D1A0D', borderWidth: 1, borderColor: '#4CAF50' }}>
              <Text className="text-sm" style={{ color: '#4CAF50' }}>{feedback}</Text>
            </View>
          )}

          {/* Current stats */}
          <InfoCard title="Current Status">
            <View className="flex-row flex-wrap gap-4">
              {[
                { label: 'Energy',     val: stats.energy,     icon: '⚡' },
                { label: 'Hunger',     val: stats.hunger,     icon: '🍽️' },
                { label: 'Health',     val: stats.health,     icon: '❤️' },
                { label: 'Hygiene',    val: stats.hygiene,    icon: '🚿' },
                { label: 'Discipline', val: stats.discipline, icon: '🎯' },
                { label: 'Endurance',  val: stats.endurance,  icon: '🏅' },
              ].map(({ label, val, icon }) => (
                <View key={label} className="flex-1" style={{ minWidth: '45%' }}>
                  <StatBar label={label} value={val} icon={icon} compact />
                </View>
              ))}
            </View>
          </InfoCard>

          {/* ── WORK ── */}
          <View className="mb-3">
            <Pressable
              className="p-4 flex-row items-center justify-between"
              style={{
                backgroundColor: workLimitReached ? '#0D1A0D' : '#0D0D0D',
                borderWidth: 1,
                borderColor: workLimitReached ? '#4CAF50' : '#333',
              }}
              onPress={() => !workLimitReached && setActiveSection(activeSection === 'work' ? null : 'work')}
            >
              <View className="flex-row items-center gap-3">
                <Text className="text-2xl">💼</Text>
                <View>
                  <Text className="text-foreground font-bold">
                    Work / Hustles
                  </Text>
                  <Text className="text-muted-foreground text-xs">
                    {workLimitReached
                      ? `Daily limit reached (${maxWorkActionsToday}× ${state.formalEmployment ? 'formal' : 'hustle'} max)`
                      : `${workActionsToday}/${maxWorkActionsToday} used · ${availableJobs.length} options`}
                  </Text>
                </View>
              </View>
              <View className="items-end gap-1">
                {workLimitReached
                  ? <Text style={{ color: '#4CAF50' }} className="text-xs font-bold">DONE ✓</Text>
                  : <Text className="text-muted-foreground">{activeSection === 'work' ? '▲' : '▼'}</Text>}
                <Text className="text-xs" style={{ color: state.formalEmployment ? '#FFB81C' : '#666' }}>
                  {state.formalEmployment ? '👔 FORMAL (1×/day)' : '💡 HUSTLE (2×/day)'}
                </Text>
              </View>
            </Pressable>

            {activeSection === 'work' && !workLimitReached && (
              <View style={{ backgroundColor: '#080808', borderWidth: 1, borderColor: '#222' }}>
                {availableJobs.length === 0 ? (
                  <View className="p-4">
                    <Text className="text-muted-foreground text-sm">
                      No work available in {location} with your current qualifications.
                    </Text>
                    <Text className="text-xs mt-2" style={{ color: '#FFB81C' }}>
                      → Visit Employment or Education to unlock options.
                    </Text>
                  </View>
                ) : (
                  availableJobs.map(job => (
                    <Pressable
                      key={job.id}
                      className="p-4 flex-row items-center justify-between"
                      style={{ borderBottomWidth: 1, borderBottomColor: '#111' }}
                      onPress={() => doWork(job.id)}
                    >
                      <View className="flex-1">
                        <Text className="text-foreground font-bold text-sm">{job.title}</Text>
                        <Text className="text-muted-foreground text-xs capitalize">
                          {job.type} · -⚡{job.energyCost} · +😤{job.stressGain}
                        </Text>
                      </View>
                      <Text style={{ color: '#4CAF50' }} className="font-bold">
                        +{formatMoney(job.dailyIncome)}
                      </Text>
                    </Pressable>
                  ))
                )}
              </View>
            )}
          </View>

          {/* ── EXERCISE ── */}
          <View className="mb-3">
            <Pressable
              className="p-4 flex-row items-center justify-between"
              style={{
                backgroundColor: doneExercise ? '#0D1A0D' : '#0D0D0D',
                borderWidth: 1,
                borderColor: doneExercise ? '#4CAF50' : '#333',
              }}
              onPress={() => setActiveSection(activeSection === 'exercise' ? null : 'exercise')}
            >
              <View className="flex-row items-center gap-3">
                <Text className="text-2xl">💪</Text>
                <View>
                  <Text className="text-foreground font-bold">Exercise {doneExercise ? '✓' : ''}</Text>
                  <Text className="text-muted-foreground text-xs">Fitness · Discipline · Endurance · Health</Text>
                </View>
              </View>
              <Text className="text-muted-foreground">{activeSection === 'exercise' ? '▲' : '▼'}</Text>
            </Pressable>

            {activeSection === 'exercise' && !doneExercise && (
              <View style={{ backgroundColor: '#080808', borderWidth: 1, borderColor: '#222' }}>
                {EXERCISE_OPTIONS.map(({ type, effects, icon }) => (
                  <Pressable
                    key={type}
                    className="p-4 flex-row items-center justify-between"
                    style={{ borderBottomWidth: 1, borderBottomColor: '#111' }}
                    onPress={() => doExercise(type)}
                  >
                    <View className="flex-row items-center gap-3">
                      <Text className="text-lg">{icon}</Text>
                      <Text className="text-foreground text-sm">{type}</Text>
                    </View>
                    <Text className="text-muted-foreground text-xs">{effects}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* ── STUDY ── */}
          <View className="mb-3">
            <Pressable
              className="p-4 flex-row items-center justify-between"
              style={{
                backgroundColor: doneStudy ? '#0D1A0D' : '#0D0D0D',
                borderWidth: 1,
                borderColor: doneStudy ? '#4CAF50' : '#333',
              }}
              onPress={() => !doneStudy && doStudy()}
            >
              <View className="flex-row items-center gap-3">
                <Text className="text-2xl">📚</Text>
                <View>
                  <Text className="text-foreground font-bold">Study {doneStudy ? '✓' : ''}</Text>
                  <Text className="text-muted-foreground text-xs">
                    {state.currentCourse
                      ? `${state.currentCourse.courseName} · +Education, +Intelligence`
                      : 'Not enrolled — visit Education'}
                  </Text>
                </View>
              </View>
              {state.currentCourse && !doneStudy && (
                <Text style={{ color: '#FFB81C' }} className="font-bold">STUDY</Text>
              )}
            </Pressable>
          </View>

          {/* ── SOCIALIZE ── */}
          <View className="mb-3">
            <Pressable
              className="p-4 flex-row items-center justify-between"
              style={{
                backgroundColor: doneSocialize ? '#0D1A0D' : '#0D0D0D',
                borderWidth: 1,
                borderColor: doneSocialize ? '#4CAF50' : '#333',
              }}
              onPress={() => setActiveSection(activeSection === 'socialize' ? null : 'socialize')}
            >
              <View className="flex-row items-center gap-3">
                <Text className="text-2xl">🤝</Text>
                <View>
                  <Text className="text-foreground font-bold">Socialize {doneSocialize ? '✓' : ''}</Text>
                  <Text className="text-muted-foreground text-xs">Happiness · Stress · Reputation</Text>
                </View>
              </View>
              <Text className="text-muted-foreground">{activeSection === 'socialize' ? '▲' : '▼'}</Text>
            </Pressable>

            {activeSection === 'socialize' && !doneSocialize && (
              <View style={{ backgroundColor: '#080808', borderWidth: 1, borderColor: '#222' }}>
                {SOCIALIZE_OPTIONS.map(({ type, label, effects, icon }) => (
                  <Pressable
                    key={type}
                    className="p-4 flex-row items-center justify-between"
                    style={{ borderBottomWidth: 1, borderBottomColor: '#111' }}
                    onPress={() => doSocialize(type, label)}
                  >
                    <View className="flex-row items-center gap-3">
                      <Text className="text-lg">{icon}</Text>
                      <Text className="text-foreground text-sm">{label}</Text>
                    </View>
                    <Text className="text-muted-foreground text-xs">{effects}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* ── REST ── */}
          <View className="mb-3">
            <Pressable
              className="p-4 flex-row items-center justify-between"
              style={{ backgroundColor: '#0D0D0D', borderWidth: 1, borderColor: '#333' }}
              onPress={doRest}
            >
              <View className="flex-row items-center gap-3">
                <Text className="text-2xl">😴</Text>
                <View>
                  <Text className="text-foreground font-bold">Rest</Text>
                  <Text className="text-muted-foreground text-xs">+40 Energy · -15 Stress · No action slot</Text>
                </View>
              </View>
              <Text style={{ color: '#FFB81C' }}>REST</Text>
            </Pressable>
          </View>

          {/* ── SHOWER ── */}
          <View className="mb-6">
            <Pressable
              className="p-4 flex-row items-center justify-between"
              style={{
                backgroundColor: doneShower ? '#0D1A0D' : '#0D0D0D',
                borderWidth: 1,
                borderColor: doneShower ? '#4CAF50' : '#333',
              }}
              onPress={() => !doneShower && doShower()}
            >
              <View className="flex-row items-center gap-3">
                <Text className="text-2xl">🚿</Text>
                <View>
                  <Text className="text-foreground font-bold">Shower {doneShower ? '✓' : ''}</Text>
                  <Text className="text-muted-foreground text-xs">
                    +Hygiene {state.inventory.some(i => i.category === 'hygiene' && i.quantity > 0)
                      ? '(soap available)' : '(no soap — less effective)'}
                  </Text>
                </View>
              </View>
              {!doneShower && <Text style={{ color: '#FFB81C' }}>SHOWER</Text>}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

