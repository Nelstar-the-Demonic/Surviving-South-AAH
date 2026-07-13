import { View, Text, ScrollView } from 'react-native';
import { useGame } from '@/store/gameContext';
import { GameHeader } from '@/components/game/GameHeader';
import { formatMoney } from '@/lib/game/gameEngine';

const STAT_DESCRIPTIONS: Record<string, { icon: string; description: string; effects: string }> = {
  health:       { icon: '❤️',  description: 'Overall physical health. Falls when sick, injured or malnourished.', effects: 'Low health causes death risk. High health improves work performance and lifespan.' },
  hunger:       { icon: '🍽️', description: 'How full you are. Drops each day and with physical activity.', effects: 'Low hunger drains health, energy and concentration. Eat food to restore.' },
  energy:       { icon: '⚡',  description: 'Physical and mental energy. Depleted by work, hustle and exercise.', effects: 'Low energy prevents working extra shifts. Rest and sleep restore energy.' },
  fitness:      { icon: '💪',  description: 'Physical fitness level. Increases with consistent exercise.', effects: 'High fitness improves endurance, earns bonuses in manual jobs, and slows energy drain.' },
  hygiene:      { icon: '🚿',  description: 'Cleanliness level. Drops daily and after physical activity.', effects: 'Low hygiene causes social reputation loss and increases disease risk.' },
  stress:       { icon: '😰',  description: 'Mental stress. Increases from overwork, debt, hardship and crime.', effects: 'High stress causes health loss, poor job performance and increases crime temptation.' },
  happiness:    { icon: '😊',  description: 'Emotional wellbeing. Raised by socialising, good food, success.', effects: 'Low happiness reduces motivation and causes negative random events.' },
  intelligence: { icon: '🧠',  description: 'Mental acuity and problem-solving ability. Raised by studying.', effects: 'High intelligence unlocks better education options and qualifications.' },
  education:    { icon: '📚',  description: 'General educational level. Increases with study actions.', effects: 'High education enables higher-paying careers and business opportunities.' },
  reputation:   { icon: '⭐',  description: 'Social reputation. Raised by good deeds, lowered by crime.', effects: 'High reputation unlocks certain jobs, better loan rates and community support.' },
  discipline:   { icon: '🎯',  description: 'Self-control and consistency. Raised by completing goals.', effects: 'High discipline improves skill gain rates and reduces temptation to take shortcuts.' },
  endurance:    { icon: '🏃',  description: 'Stamina and physical resilience. Raised by exercise and physical work.', effects: 'High endurance allows more work actions per day and reduces fatigue penalties.' },
};

function StatBar({ value, color }: { value: number; color: string }) {
  return (
    <View className="h-2 bg-secondary rounded-full overflow-hidden">
      <View className="h-2 rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
    </View>
  );
}

function getStatColor(key: string, value: number): string {
  if (key === 'stress') return value <= 30 ? '#4CAF50' : value <= 60 ? '#FFB81C' : '#E32636';
  if (key === 'hunger') return value >= 70 ? '#4CAF50' : value >= 40 ? '#FFB81C' : '#E32636';
  return value >= 70 ? '#4CAF50' : value >= 40 ? '#FFB81C' : '#E32636';
}

export default function StatsInfo() {
  const { state } = useGame();
  if (!state?.gameStarted) return null;

  const {
    stats, cash, bank, day, qualifications, completedCourses,
    currentCourse, businesses, properties, vehicles,
    currentJob, formalEmployment, prison, injury,
  } = state;

  const statKeys = Object.keys(STAT_DESCRIPTIONS) as Array<keyof typeof STAT_DESCRIPTIONS>;

  return (
    <View className="flex-1 bg-background">
      <GameHeader title="Stats" subtitle="Your full character profile" />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View className="px-4 pt-4 pb-10">

          {/* Identity */}
          <View className="mb-5 p-4" style={{ borderWidth: 1, borderColor: '#FFB81C', backgroundColor: '#0D0A00' }}>
            <Text className="text-muted-foreground text-xs tracking-wider mb-3">IDENTITY</Text>
            <View className="flex-row flex-wrap gap-x-6 gap-y-2">
              <View><Text className="text-muted-foreground text-xs">NAME</Text><Text className="text-foreground font-bold">{state.playerName}</Text></View>
              <View><Text className="text-muted-foreground text-xs">AGE</Text><Text className="text-foreground font-bold">{state.age}</Text></View>
              <View><Text className="text-muted-foreground text-xs">DAY</Text><Text className="text-foreground font-bold">{day}</Text></View>
              <View><Text className="text-muted-foreground text-xs">LOCATION</Text><Text className="text-foreground font-bold">{state.location}</Text></View>
              <View><Text className="text-muted-foreground text-xs">GENDER</Text><Text className="text-foreground font-bold">{state.gender}</Text></View>
            </View>
          </View>

          {/* Finances */}
          <View className="mb-5 p-4" style={{ borderWidth: 1, borderColor: '#4CAF50', backgroundColor: '#0A1200' }}>
            <Text className="text-muted-foreground text-xs tracking-wider mb-3">FINANCES</Text>
            <View className="flex-row flex-wrap gap-x-6 gap-y-2">
              <View><Text className="text-muted-foreground text-xs">CASH ON HAND</Text><Text className="font-bold text-lg" style={{ color: '#4CAF50' }}>{formatMoney(cash)}</Text></View>
              <View><Text className="text-muted-foreground text-xs">BANK BALANCE</Text><Text className="font-bold text-lg" style={{ color: '#4CAF50' }}>{formatMoney(bank.currentBalance)}</Text></View>
              <View><Text className="text-muted-foreground text-xs">NOTICE ACCOUNT</Text><Text className="font-bold" style={{ color: '#64B5F6' }}>{formatMoney(bank.noticeBalance)}</Text></View>
              <View><Text className="text-muted-foreground text-xs">NET WORTH</Text><Text className="font-bold" style={{ color: '#FFB81C' }}>{formatMoney(cash + bank.currentBalance + bank.noticeBalance + properties.filter(p => p.owned).reduce((s, p) => s + p.purchasePrice, 0))}</Text></View>
            </View>
          </View>

          {/* All stats with bars */}
          <Text className="text-muted-foreground text-xs tracking-wider mb-3">CHARACTER STATS</Text>
          {statKeys.map(key => {
            const value = (stats as unknown as Record<string, number>)[key] ?? 0;
            const info = STAT_DESCRIPTIONS[key];
            const color = getStatColor(key, value);
            return (
              <View key={key} className="mb-4 p-4" style={{ borderWidth: 1, borderColor: '#1E1E1E', backgroundColor: '#0D0D0D' }}>
                <View className="flex-row items-center justify-between mb-1.5">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-base">{info.icon}</Text>
                    <Text className="text-foreground font-bold text-sm">{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                  </View>
                  <Text className="font-bold text-base" style={{ color }}>{value}/100</Text>
                </View>
                <StatBar value={value} color={color} />
                <Text className="text-muted-foreground text-xs mt-2">{info.description}</Text>
                <Text className="text-xs mt-1" style={{ color: '#888' }}>↳ {info.effects}</Text>
              </View>
            );
          })}

          {/* Employment */}
          <View className="mb-5 p-4" style={{ borderWidth: 1, borderColor: '#333', backgroundColor: '#0D0D0D' }}>
            <Text className="text-muted-foreground text-xs tracking-wider mb-3">EMPLOYMENT</Text>
            {formalEmployment ? (
              <View>
                <Text className="text-foreground font-bold">{formalEmployment.chainId.replace('_', ' ')}</Text>
                <Text className="text-muted-foreground text-xs">Rank index: {formalEmployment.rankIndex} · Days at rank: {formalEmployment.daysAtRank}</Text>
              </View>
            ) : currentJob ? (
              <View>
                <Text className="text-foreground font-bold">{currentJob.title}</Text>
                <Text className="text-muted-foreground text-xs">Informal / gig work · {formatMoney(currentJob.monthlySalary ?? 0)}/month</Text>
              </View>
            ) : (
              <Text className="text-muted-foreground text-sm">Unemployed</Text>
            )}
          </View>

          {/* Education */}
          <View className="mb-5 p-4" style={{ borderWidth: 1, borderColor: '#333', backgroundColor: '#0D0D0D' }}>
            <Text className="text-muted-foreground text-xs tracking-wider mb-3">EDUCATION & QUALIFICATIONS</Text>
            {qualifications.length > 0 ? (
              <View className="flex-row flex-wrap gap-2 mb-3">
                {qualifications.map(q => (
                  <Text key={q} className="text-xs px-2 py-1 font-bold" style={{ backgroundColor: '#0A1200', color: '#4CAF50', borderWidth: 1, borderColor: '#4CAF50' }}>
                    {q}
                  </Text>
                ))}
              </View>
            ) : (
              <Text className="text-muted-foreground text-xs mb-3">No qualifications yet.</Text>
            )}
            {currentCourse && (
              <View className="p-2" style={{ borderWidth: 1, borderColor: '#FFB81C', backgroundColor: '#0A0800' }}>
                <Text className="text-xs font-bold" style={{ color: '#FFB81C' }}>
                  📖 STUDYING: {currentCourse.courseName}
                </Text>
                <Text className="text-xs text-muted-foreground mt-0.5">
                  Day {currentCourse.daysCompleted}/{currentCourse.totalDays}
                  {(currentCourse.scholarshipPct ?? 0) > 0 ? ` · ${currentCourse.scholarshipPct}% scholarship` : ''}
                </Text>
              </View>
            )}
            {completedCourses.length > 0 && (
              <Text className="text-muted-foreground text-xs mt-2">
                Completed courses: {completedCourses.length}
              </Text>
            )}
          </View>

          {/* Industry Experience */}
          <View className="mb-5 p-4" style={{ borderWidth: 1, borderColor: '#333', backgroundColor: '#0D0D0D' }}>
            <Text className="text-muted-foreground text-xs tracking-wider mb-3">INDUSTRY EXPERIENCE</Text>
            {Object.entries(state.industryExperience ?? {}).map(([industry, exp]) => {
              if (typeof exp !== 'number') return null;
              const xpNum = exp as number;
              const barPct = Math.min(100, (xpNum / 500) * 100);
              const tierLabel = xpNum >= 500 ? 'EXPERT' : xpNum >= 200 ? 'PROFICIENT' : xpNum >= 50 ? 'EXPERIENCED' : 'NOVICE';
              const tierColor = xpNum >= 500 ? '#FFB81C' : xpNum >= 200 ? '#4CAF50' : xpNum >= 50 ? '#64B5F6' : '#555';
              return (
                <View key={industry} className="mb-3">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-sm text-foreground">{industry}</Text>
                    <View className="flex-row items-center gap-2">
                      <Text className="text-xs font-bold" style={{ color: tierColor }}>{tierLabel}</Text>
                      <Text className="text-xs text-muted-foreground">{xpNum} XP</Text>
                    </View>
                  </View>
                  <View className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <View className="h-1.5 rounded-full" style={{ width: `${barPct}%`, backgroundColor: tierColor }} />
                  </View>
                </View>
              );
            })}
            <Text className="text-xs text-muted-foreground mt-1">
              Industry XP accumulates from working, running businesses, and completing courses.
            </Text>
          </View>

          {/* Assets */}
          <View className="mb-5 p-4" style={{ borderWidth: 1, borderColor: '#333', backgroundColor: '#0D0D0D' }}>
            <Text className="text-muted-foreground text-xs tracking-wider mb-3">ASSETS</Text>
            <View className="flex-row flex-wrap gap-x-6 gap-y-2">
              <View><Text className="text-muted-foreground text-xs">PROPERTIES</Text><Text className="text-foreground font-bold">{properties.length} ({properties.filter(p => p.owned).length} owned)</Text></View>
              <View><Text className="text-muted-foreground text-xs">VEHICLES</Text><Text className="text-foreground font-bold">{vehicles.length}</Text></View>
              <View><Text className="text-muted-foreground text-xs">BUSINESSES</Text><Text className="text-foreground font-bold">{businesses.length}</Text></View>
            </View>
          </View>

          {/* Special status */}
          {(prison.imprisoned || injury.injured) && (
            <View className="mb-5 p-4" style={{ borderWidth: 1, borderColor: '#E32636', backgroundColor: '#1A0000' }}>
              <Text className="text-muted-foreground text-xs tracking-wider mb-3">SPECIAL STATUS</Text>
              {prison.imprisoned && (
                <Text className="font-bold text-sm" style={{ color: '#E32636' }}>
                  🔒 IMPRISONED — {prison.sentenceDays - prison.daysServed} days remaining (Crime: {prison.crime ?? 'Unknown'})
                </Text>
              )}
              {injury.injured && (
                <Text className="font-bold text-sm mt-2" style={{ color: '#FF6B35' }}>
                  ⚕️ INJURED ({injury.severity}) — {injury.description}
                  {injury.crippled ? ' · PERMANENT DISABILITY' : ''}
                </Text>
              )}
            </View>
          )}

        </View>
      </ScrollView>
    </View>
  );
}
