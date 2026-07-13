import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useGame } from '@/store/gameContext';
import { GameHeader } from '@/components/game/GameHeader';
import { InfoCard } from '@/components/game/InfoCard';
import { StatBar } from '@/components/game/StatBar';
import { BACKGROUNDS } from '@/lib/game/gameData';
import { formatMoney, getDayName } from '@/lib/game/gameEngine';

const INDUSTRY_ICONS: Record<string, string> = {
  policing:     '🚔',
  healthcare:   '🏥',
  education:    '🎓',
  finance:      '💹',
  engineering:  '⚙️',
  retail:       '🛒',
  agriculture:  '🌾',
  construction: '🏗️',
  transport:    '🚛',
  hospitality:  '🍽️',
  informal:     '💡',
};

const FINANCE_CAT_ICONS: Record<string, string> = {
  work:       '💼',
  business:   '🏪',
  farm:       '🌾',
  shop:       '🛒',
  rent:       '🏠',
  education:  '🎓',
  bank:       '🏦',
  government: '🏛️',
  crime:      '🔪',
  fine:       '🚔',
  other:      '📦',
};

const FINANCE_CAT_LABELS: Record<string, string> = {
  work:       'Employment & Wages',
  business:   'Business Income/Costs',
  farm:       'Farming & Produce',
  shop:       'Shopping & Supplies',
  rent:       'Rent & Property',
  education:  'Education & Courses',
  bank:       'Banking & Interest',
  government: 'SASSA & Government',
  crime:      'Criminal Activity',
  fine:       'Fines & Penalties',
  other:      'Miscellaneous',
};

type ProfileTab = 'overview' | 'stats' | 'finance';

export default function Profile() {
  const { state, currentRankTitle, currentSalary } = useGame();
  const [tab, setTab] = useState<ProfileTab>('overview');
  const [financeWindow, setFinanceWindow] = useState<7 | 30 | 999>(30);

  if (!state?.gameStarted) return null;

  const {
    playerName, gender, background, age, location, day, cash, bank,
    stats, qualifications, completedCourses, currentJob, businesses,
    properties, vehicles, financeHistory, injury, formalEmployment,
    industryExperience, crimeState, npcs,
  } = state;

  const bgData = BACKGROUNDS[background];

  const totalAssets = properties.reduce((s, p) => s + (p.owned ? p.purchasePrice : 0), 0)
    + vehicles.length * 5000
    + businesses.reduce((s, b) => s + b.capital, 0);

  // Finance analysis
  const windowRecords = financeHistory.filter(f =>
    financeWindow === 999 ? true : day - f.day <= financeWindow
  );
  const incomeRecords  = windowRecords.filter(f => f.amount > 0);
  const expenseRecords = windowRecords.filter(f => f.amount < 0);
  const totalIncome    = incomeRecords.reduce((s, f) => s + f.amount, 0);
  const totalExpenses  = Math.abs(expenseRecords.reduce((s, f) => s + f.amount, 0));
  const netFlow        = totalIncome - totalExpenses;

  // Group by category
  const incomeByCategory: Record<string, { total: number; count: number }> = {};
  incomeRecords.forEach(r => {
    if (!incomeByCategory[r.category]) incomeByCategory[r.category] = { total: 0, count: 0 };
    incomeByCategory[r.category].total += r.amount;
    incomeByCategory[r.category].count += 1;
  });
  const expenseByCategory: Record<string, { total: number; count: number }> = {};
  expenseRecords.forEach(r => {
    if (!expenseByCategory[r.category]) expenseByCategory[r.category] = { total: 0, count: 0 };
    expenseByCategory[r.category].total += Math.abs(r.amount);
    expenseByCategory[r.category].count += 1;
  });

  const sortedIncomeCats  = Object.entries(incomeByCategory).sort(([,a],[,b]) => b.total - a.total);
  const sortedExpenseCats = Object.entries(expenseByCategory).sort(([,a],[,b]) => b.total - a.total);

  // Recent transactions (last 20)
  const recentTx = [...financeHistory].reverse().slice(0, 20);

  const earnedIndustries = Object.entries(industryExperience).filter(([, v]) => v > 0);
  const partnerNpc = npcs.find(n => n.romanticStage === 'partner');

  return (
    <View className="flex-1 bg-background">
      <GameHeader
        title="Profile"
        subtitle={`Day ${day} — ${getDayName(day)}`}
        extraStats={[
          { label: 'Net Worth', value: formatMoney(cash + bank.currentBalance + totalAssets), color: '#D4AF37' },
          { label: 'Crimes', value: String(crimeState?.totalCrimes ?? 0), color: crimeState?.totalCrimes > 0 ? '#FF9800' : '#666' },
        ]}
      />

      {/* Tab bar */}
      <View className="flex-row border-b border-border">
        {([
          { key: 'overview', label: '👤 OVERVIEW' },
          { key: 'stats',    label: '📊 STATS' },
          { key: 'finance',  label: '💰 FINANCE' },
        ] as const).map(({ key, label }) => (
          <Pressable
            key={key}
            onPress={() => setTab(key)}
            className="flex-1 py-3 items-center"
            style={{ borderBottomWidth: 2, borderBottomColor: tab === key ? '#D4AF37' : 'transparent' }}
          >
            <Text className="text-xs font-bold" style={{ color: tab === key ? '#D4AF37' : '#666' }}>{label}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View className="px-4 pt-4 pb-10">

          {/* ── OVERVIEW TAB ── */}
          {tab === 'overview' && (
            <>
              {/* ID Card */}
              <View className="mb-4 p-5" style={{ backgroundColor: '#0D0A00', borderWidth: 2, borderColor: '#D4AF37' }}>
                <View className="flex-row items-start justify-between mb-3">
                  <View>
                    <Text className="text-muted-foreground text-xs tracking-wider">SOUTH AFRICAN ID</Text>
                    <Text className="text-foreground text-2xl font-bold mt-1">{playerName}</Text>
                    <Text className="text-muted-foreground text-sm">{gender} · Age {age} · {location}</Text>
                    {partnerNpc && (
                      <Text className="text-xs mt-1" style={{ color: '#FF69B4' }}>💍 Partner: {partnerNpc.name}</Text>
                    )}
                  </View>
                  <Text className="text-5xl">{gender === 'Male' ? '👨🏿' : '👩🏿'}</Text>
                </View>
                <View className="h-px bg-border mb-3" />
                <View className="flex-row flex-wrap gap-4">
                  <View>
                    <Text className="text-muted-foreground text-xs">BACKGROUND</Text>
                    <Text className="text-foreground text-sm font-bold">{bgData.label}</Text>
                  </View>
                  <View>
                    <Text className="text-muted-foreground text-xs">DAYS ALIVE</Text>
                    <Text style={{ color: '#D4AF37' }} className="text-sm font-bold">{day}</Text>
                  </View>
                  <View>
                    <Text className="text-muted-foreground text-xs">REPUTATION</Text>
                    <Text className="text-sm font-bold" style={{
                      color: stats.reputation >= 70 ? '#4CAF50' : stats.reputation >= 40 ? '#FFB81C' : '#E32636',
                    }}>{stats.reputation}/100</Text>
                  </View>
                  {(crimeState?.totalCrimes ?? 0) > 0 && (
                    <View>
                      <Text className="text-muted-foreground text-xs">CRIMINAL RECORD</Text>
                      <Text style={{ color: '#E32636' }} className="text-sm font-bold">{crimeState.totalCrimes} crimes</Text>
                    </View>
                  )}
                  {injury.crippled && (
                    <View>
                      <Text className="text-muted-foreground text-xs">STATUS</Text>
                      <Text style={{ color: '#E32636' }} className="text-sm font-bold">⚠️ INJURED</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Quick finance */}
              <InfoCard title="Finances">
                <View className="flex-row flex-wrap gap-4">
                  {[
                    { label: 'CASH',    val: formatMoney(cash),                color: '#4CAF50' },
                    { label: 'BANK',    val: formatMoney(bank.currentBalance), color: '#D4AF37' },
                    { label: 'SAVINGS', val: formatMoney(bank.noticeBalance),  color: '#D4AF37' },
                    { label: 'ASSETS',  val: formatMoney(totalAssets),         color: '#4CAF50' },
                  ].map(({ label, val, color }) => (
                    <View key={label}>
                      <Text className="text-muted-foreground text-xs">{label}</Text>
                      <Text style={{ color }} className="font-bold">{val}</Text>
                    </View>
                  ))}
                </View>
                <View className="h-px bg-border my-3" />
                <Pressable onPress={() => setTab('finance')}>
                  <Text className="text-xs" style={{ color: '#D4AF37' }}>View detailed Finance tab →</Text>
                </Pressable>
              </InfoCard>

              {/* Employment */}
              <InfoCard title="Employment">
                {formalEmployment ? (
                  <View>
                    <Text className="text-foreground font-bold">{currentRankTitle ?? currentJob?.title}</Text>
                    <Text className="text-muted-foreground text-sm capitalize">Formal · {formatMoney(currentSalary ?? 0)}/mo</Text>
                  </View>
                ) : currentJob ? (
                  <View>
                    <Text className="text-foreground font-bold">{currentJob.title}</Text>
                    <Text className="text-muted-foreground text-sm capitalize">
                      {currentJob.type} · {formatMoney(currentJob.dailyIncome)}/day
                    </Text>
                  </View>
                ) : (
                  <Text className="text-muted-foreground text-sm">Unemployed</Text>
                )}
              </InfoCard>

              {/* Industry Experience removed — now displayed under Stats → Industry Experience */}

              {/* Criminal Record Effects */}
              {(crimeState?.crimeRecords?.length ?? 0) > 0 && (
                <View className="mb-4 p-4" style={{ backgroundColor: '#1A0800', borderWidth: 1, borderColor: '#E32636' }}>
                  <Text className="text-xs font-bold tracking-wider mb-2" style={{ color: '#E32636' }}>
                    ⚠️ CRIMINAL RECORD — {crimeState.crimeRecords.length} offence{crimeState.crimeRecords.length !== 1 ? 's' : ''}
                  </Text>
                  {crimeState.crimeRecords.slice(0, 3).map((rec, i: number) => (
                    <Text key={i} className="text-xs mb-0.5" style={{ color: '#FF9800' }}>
                      • {rec.crime ?? 'Unknown offence'}{rec.sentenceDays > 0 ? ' (Prison sentence served)' : ''}
                    </Text>
                  ))}
                  {crimeState.crimeRecords.length > 3 && (
                    <Text className="text-xs text-muted-foreground">…and {crimeState.crimeRecords.length - 3} more</Text>
                  )}
                  <View className="mt-2 pt-2" style={{ borderTopWidth: 1, borderTopColor: '#333' }}>
                    <Text className="text-xs text-muted-foreground leading-5">
                      Your criminal record affects:{'\n'}
                      🔒 Employment — Law Enforcement & Healthcare may refuse you{'\n'}
                      📈 Promotions — harder to advance in certain industries{'\n'}
                      🏛️ Government Opportunities — some are blocked{'\n'}
                      🤝 NPC Relationships — affects trust from authority figures
                    </Text>
                  </View>
                </View>
              )}

              {/* Qualifications */}
              {qualifications.length > 0 && (
                <InfoCard title={`Qualifications (${qualifications.length})`}>
                  <View className="flex-row flex-wrap gap-2">
                    {qualifications.map(q => (
                      <View key={q} className="px-2 py-1" style={{ backgroundColor: '#0D1A0D', borderWidth: 1, borderColor: '#4CAF50' }}>
                        <Text className="text-xs" style={{ color: '#4CAF50' }}>✓ {q}</Text>
                      </View>
                    ))}
                  </View>
                </InfoCard>
              )}

              {/* Businesses */}
              {businesses.length > 0 && (
                <InfoCard title={`Businesses (${businesses.length})`}>
                  {businesses.map(b => (
                    <View key={b.id} className="mb-2 pb-2" style={{ borderBottomWidth: 1, borderBottomColor: '#1A1A1A' }}>
                      <Text className="text-foreground font-bold text-sm">{b.name}</Text>
                      <Text className="text-muted-foreground text-xs">
                        {b.industry} · Capital: {formatMoney(b.capital)} · Daily: {formatMoney(b.dailyIncome)}
                      </Text>
                    </View>
                  ))}
                </InfoCard>
              )}
            </>
          )}

          {/* ── STATS TAB ── */}
          {tab === 'stats' && (
            <>
              <InfoCard title="Core Stats">
                {[
                  { label: 'Health',       val: stats.health,       icon: '❤️' },
                  { label: 'Hunger',       val: stats.hunger,       icon: '🍽️' },
                  { label: 'Energy',       val: stats.energy,       icon: '⚡' },
                  { label: 'Fitness',      val: stats.fitness,      icon: '💪' },
                  { label: 'Hygiene',      val: stats.hygiene,      icon: '🚿' },
                  { label: 'Stress',       val: stats.stress,       icon: '😰', invert: true },
                  { label: 'Happiness',    val: stats.happiness,    icon: '😊' },
                  { label: 'Intelligence', val: stats.intelligence, icon: '🧠' },
                  { label: 'Education',    val: stats.education,    icon: '🎓' },
                  { label: 'Reputation',   val: stats.reputation,   icon: '⭐' },
                ].map(s => (
                  <StatBar key={s.label} label={s.label} value={s.val} icon={s.icon} compact />
                ))}
              </InfoCard>

              <InfoCard title="Discipline & Endurance">
                <View className="flex-row gap-4 mb-2">
                  <View className="flex-1">
                    <Text className="text-muted-foreground text-xs mb-1">🎯 DISCIPLINE</Text>
                    <View className="h-3 bg-secondary">
                      <View className="h-3" style={{ width: `${stats.discipline}%`, backgroundColor: '#D4AF37' }} />
                    </View>
                    <Text style={{ color: '#D4AF37' }} className="text-xs mt-1 font-bold">{stats.discipline}/100</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-muted-foreground text-xs mb-1">🏅 ENDURANCE</Text>
                    <View className="h-3 bg-secondary">
                      <View className="h-3" style={{ width: `${stats.endurance}%`, backgroundColor: '#4CAF50' }} />
                    </View>
                    <Text style={{ color: '#4CAF50' }} className="text-xs mt-1 font-bold">{stats.endurance}/100</Text>
                  </View>
                </View>
              </InfoCard>
            </>
          )}

          {/* ── FINANCE TAB ── */}
          {tab === 'finance' && (
            <>
              {/* Time window selector */}
              <View className="flex-row gap-2 mb-4">
                {([7, 30, 999] as const).map(w => (
                  <Pressable
                    key={w}
                    onPress={() => setFinanceWindow(w)}
                    className="flex-1 py-2 items-center"
                    style={{ borderWidth: 1, borderColor: financeWindow === w ? '#D4AF37' : '#333', backgroundColor: financeWindow === w ? '#1A1400' : '#0D0D0D' }}
                  >
                    <Text className="text-xs font-bold" style={{ color: financeWindow === w ? '#D4AF37' : '#666' }}>
                      {w === 999 ? 'ALL TIME' : `LAST ${w}D`}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Summary row */}
              <View className="flex-row gap-2 mb-4">
                <View className="flex-1 p-3 items-center" style={{ backgroundColor: '#0A1200', borderWidth: 1, borderColor: '#4CAF50' }}>
                  <Text className="text-xs" style={{ color: '#4CAF50' }}>TOTAL INCOME</Text>
                  <Text className="font-bold mt-0.5" style={{ color: '#4CAF50' }}>{formatMoney(totalIncome)}</Text>
                </View>
                <View className="flex-1 p-3 items-center" style={{ backgroundColor: '#1A0000', borderWidth: 1, borderColor: '#E32636' }}>
                  <Text className="text-xs" style={{ color: '#E32636' }}>TOTAL EXPENSES</Text>
                  <Text className="font-bold mt-0.5" style={{ color: '#E32636' }}>{formatMoney(totalExpenses)}</Text>
                </View>
              </View>
              <View className="mb-4 p-3 items-center" style={{ backgroundColor: netFlow >= 0 ? '#0A1200' : '#1A0000', borderWidth: 2, borderColor: netFlow >= 0 ? '#D4AF37' : '#E32636' }}>
                <Text className="text-xs" style={{ color: netFlow >= 0 ? '#D4AF37' : '#E32636' }}>NET CASH FLOW</Text>
                <Text className="font-bold text-xl mt-0.5" style={{ color: netFlow >= 0 ? '#D4AF37' : '#E32636' }}>
                  {netFlow >= 0 ? '+' : ''}{formatMoney(netFlow)}
                </Text>
              </View>

              {/* Wallet summary */}
              <View className="flex-row gap-2 mb-4">
                {[
                  { label: 'CASH',         val: cash,                  color: '#4CAF50' },
                  { label: 'BANK BALANCE', val: bank.currentBalance,   color: '#D4AF37' },
                  { label: 'SAVINGS',      val: bank.noticeBalance,    color: '#D4AF37' },
                  { label: 'ASSETS',       val: totalAssets,           color: '#64B5F6' },
                ].map(({ label, val, color }) => (
                  <View key={label} className="flex-1 p-2 items-center" style={{ borderWidth: 1, borderColor: '#1E1E1E', backgroundColor: '#0D0D0D' }}>
                    <Text className="text-xs" style={{ color: '#888' }}>{label}</Text>
                    <Text className="text-xs font-bold mt-0.5" style={{ color }}>{formatMoney(val)}</Text>
                  </View>
                ))}
              </View>

              {/* Income by category */}
              {sortedIncomeCats.length > 0 && (
                <View className="mb-4">
                  <Text className="text-xs tracking-wider mb-2" style={{ color: '#4CAF50' }}>✅ INCOME BREAKDOWN</Text>
                  {sortedIncomeCats.map(([cat, { total, count }]) => {
                    const pct = totalIncome > 0 ? (total / totalIncome) * 100 : 0;
                    return (
                      <View key={cat} className="mb-2 p-3" style={{ borderWidth: 1, borderColor: '#1A1A1A', backgroundColor: '#0D0D0D' }}>
                        <View className="flex-row justify-between items-center mb-1">
                          <View className="flex-row items-center gap-2">
                            <Text className="text-base">{FINANCE_CAT_ICONS[cat] ?? '💰'}</Text>
                            <View>
                              <Text className="text-foreground text-xs font-bold">{FINANCE_CAT_LABELS[cat] ?? cat}</Text>
                              <Text className="text-muted-foreground text-xs">{count} transaction{count !== 1 ? 's' : ''}</Text>
                            </View>
                          </View>
                          <View className="items-end">
                            <Text className="font-bold text-sm" style={{ color: '#4CAF50' }}>+{formatMoney(total)}</Text>
                            <Text className="text-xs" style={{ color: '#888' }}>{pct.toFixed(0)}%</Text>
                          </View>
                        </View>
                        <View className="h-1 bg-secondary mt-1">
                          <View className="h-1" style={{ width: `${pct}%`, backgroundColor: '#4CAF50' }} />
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* Expenses by category */}
              {sortedExpenseCats.length > 0 && (
                <View className="mb-4">
                  <Text className="text-xs tracking-wider mb-2" style={{ color: '#E32636' }}>❌ EXPENSE BREAKDOWN</Text>
                  {sortedExpenseCats.map(([cat, { total, count }]) => {
                    const pct = totalExpenses > 0 ? (total / totalExpenses) * 100 : 0;
                    return (
                      <View key={cat} className="mb-2 p-3" style={{ borderWidth: 1, borderColor: '#1A1A1A', backgroundColor: '#0D0D0D' }}>
                        <View className="flex-row justify-between items-center mb-1">
                          <View className="flex-row items-center gap-2">
                            <Text className="text-base">{FINANCE_CAT_ICONS[cat] ?? '📦'}</Text>
                            <View>
                              <Text className="text-foreground text-xs font-bold">{FINANCE_CAT_LABELS[cat] ?? cat}</Text>
                              <Text className="text-muted-foreground text-xs">{count} transaction{count !== 1 ? 's' : ''}</Text>
                            </View>
                          </View>
                          <View className="items-end">
                            <Text className="font-bold text-sm" style={{ color: '#E32636' }}>-{formatMoney(total)}</Text>
                            <Text className="text-xs" style={{ color: '#888' }}>{pct.toFixed(0)}%</Text>
                          </View>
                        </View>
                        <View className="h-1 bg-secondary mt-1">
                          <View className="h-1" style={{ width: `${pct}%`, backgroundColor: '#E32636' }} />
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* Recent transactions */}
              {recentTx.length > 0 && (
                <View>
                  <Text className="text-xs tracking-wider mb-2" style={{ color: '#888' }}>RECENT TRANSACTIONS</Text>
                  {recentTx.map((tx, i) => (
                    <View key={i} className="flex-row justify-between items-center py-2"
                      style={{ borderBottomWidth: 1, borderBottomColor: '#1A1A1A' }}>
                      <View className="flex-row items-center gap-2 flex-1">
                        <Text className="text-sm">{FINANCE_CAT_ICONS[tx.category] ?? '📦'}</Text>
                        <View className="flex-1">
                          <Text className="text-foreground text-xs" numberOfLines={1}>{tx.description}</Text>
                          <Text className="text-muted-foreground text-xs">Day {tx.day}</Text>
                        </View>
                      </View>
                      <Text className="text-xs font-bold ml-2" style={{ color: tx.amount >= 0 ? '#4CAF50' : '#E32636' }}>
                        {tx.amount >= 0 ? '+' : ''}{formatMoney(tx.amount)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {financeHistory.length === 0 && (
                <View className="p-6 items-center" style={{ borderWidth: 1, borderColor: '#1E1E1E' }}>
                  <Text className="text-muted-foreground text-sm">No financial records yet. Complete actions, earn income, and make purchases to see your history here.</Text>
                </View>
              )}
            </>
          )}

        </View>
      </ScrollView>
    </View>
  );
}
