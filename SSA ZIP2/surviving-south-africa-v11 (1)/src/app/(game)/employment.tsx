import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useGame } from '@/store/gameContext';
import { GameHeader } from '@/components/game/GameHeader';
import { InfoCard } from '@/components/game/InfoCard';
import { AVAILABLE_JOBS, JOB_CHAINS, getJobChain, getCurrentRankTitle, getCurrentSalary } from '@/lib/game/gameData';
import { formatMoney } from '@/lib/game/gameEngine';

const TYPE_LABELS: Record<string, string> = {
  formal: '👔 FORMAL',
  informal: '🔨 INFORMAL',
  hustle: '💡 HUSTLE',
};

const INDUSTRY_ICONS: Record<string, string> = {
  policing: '🚔',
  healthcare: '🏥',
  education: '🎓',
  finance: '💹',
  engineering: '⚙️',
  retail: '🛒',
  agriculture: '🌾',
  construction: '🏗️',
  transport: '🚛',
  hospitality: '🍽️',
  informal: '💡',
  // capitalised variants (from AVAILABLE_JOBS)
  Healthcare: '🏥',
  Education: '🎓',
  Finance: '💹',
  Engineering: '⚙️',
  Retail: '🛒',
  Agriculture: '🌾',
  Construction: '🏗️',
  Transport: '🚛',
  Services: '🔧',
  Technology: '💻',
  'Law Enforcement': '🚔',
  Crime: '🕵️',
};

type FilterType = 'all' | 'formal' | 'informal' | 'hustle' | 'chains';

export default function Employment() {
  const { state, dispatch, currentRankTitle, currentSalary } = useGame();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedChain, setExpandedChain] = useState<string | null>(null);

  if (!state?.gameStarted) return null;
  const { qualifications, location, currentJob, injury, formalEmployment, industryExperience } = state;

  function showFeedback(msg: string) {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  }

  function getJob(jobId: string) {
    const job = AVAILABLE_JOBS.find(j => j.id === jobId);
    if (!job) return;
    const missing = job.requiredQualifications.filter(q => !qualifications.includes(q));
    if (missing.length > 0) { showFeedback(`⚠️ Missing qualifications: ${missing.join(', ')}`); return; }
    if (job.requiredLocation.length > 0 && !job.requiredLocation.includes(location)) {
      showFeedback(`⚠️ Requires location: ${job.requiredLocation.join(', ')}`); return;
    }
    if (injury.crippled && job.energyCost > 45) {
      showFeedback('⚠️ Injury prevents this heavy labour job.'); return;
    }

    // Criminal record hire penalty
    const crimeCount = state.crimeState?.crimeRecords?.length ?? 0;
    if (crimeCount > 0) {
      const industry = job.industry ?? '';
      // Police/Law Enforcement: very hard to get hired
      if (industry === 'Law Enforcement' && crimeCount > 0) {
        showFeedback('❌ Criminal record disqualifies you from Law Enforcement positions.'); return;
      }
      // Healthcare: difficult — needs clean record
      if (industry === 'Healthcare' && crimeCount >= 2) {
        showFeedback('❌ Healthcare employers require a clean criminal record.'); return;
      }
      // Finance: moderate — serious crimes block
      const seriousRecord = state.crimeState?.crimeRecords?.some(r => r.sentenceDays > 0) ?? false;
      if (industry === 'Finance' && seriousRecord) {
        showFeedback('❌ Finance employers will not hire candidates with a prison record.'); return;
      }
      // General labour — less affected; only warn
      if (crimeCount >= 3) {
        showFeedback(`⚠️ Criminal record may affect this application. Employer noticed ${crimeCount} prior offences.`);
        setTimeout(() => {
          dispatch({ type: 'GET_JOB', payload: jobId });
          setFeedback(`✅ Despite your record, you were hired as ${job.title}.`);
          setTimeout(() => setFeedback(null), 3000);
        }, 1500);
        return;
      }
    }

    dispatch({ type: 'GET_JOB', payload: jobId });
    showFeedback(`✅ Now employed as ${job.title}. Work daily via Daily Actions.`);
  }

  function enrollChain(chainId: string) {
    const chain = getJobChain(chainId);
    if (!chain) return;
    if (!qualifications.includes(chain.requiredQualification)) {
      showFeedback(`⚠️ Requires: ${chain.requiredQualification}`); return;
    }
    dispatch({ type: 'ENROLL_FORMAL_JOB', payload: chainId });
    showFeedback(`✅ Hired as ${chain.ranks[0].title}! Salary paid ${chain.payCycle}.`);
  }

  function quitJob() {
    if (formalEmployment) {
      dispatch({ type: 'RESIGN_FORMAL_JOB' });
    } else {
      dispatch({ type: 'QUIT_JOB' });
    }
    showFeedback('You have resigned from your position.');
  }

  const allJobs = filter === 'all' ? AVAILABLE_JOBS
    : filter === 'chains' ? []
    : AVAILABLE_JOBS.filter(j => j.type === filter);

  function jobAvailable(job: typeof AVAILABLE_JOBS[0]) {
    return job.requiredQualifications.every(q => qualifications.includes(q))
      && (job.requiredLocation.length === 0 || job.requiredLocation.includes(location))
      && !(injury.crippled && job.energyCost > 45);
  }

  // Group jobs by industry when showing all
  const groupedJobs = filter === 'all'
    ? allJobs.reduce<Record<string, typeof AVAILABLE_JOBS>>((acc, job) => {
        const ind = job.industry ?? 'informal';
        if (!acc[ind]) acc[ind] = [];
        acc[ind].push(job);
        return acc;
      }, {})
    : null;

  return (
    <View className="flex-1 bg-background">
      <GameHeader title="Employment" subtitle="Careers, hustles & promotion chains" />

      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View className="px-4 pt-4 pb-10">

          {feedback && (
            <View className="mb-4 p-3" style={{
              backgroundColor: feedback.includes('✅') ? '#0D1A0D' : '#1A0A00',
              borderWidth: 1,
              borderColor: feedback.includes('✅') ? '#4CAF50' : '#FFB81C',
            }}>
              <Text className="text-sm" style={{ color: feedback.includes('✅') ? '#4CAF50' : '#FFB81C' }}>
                {feedback}
              </Text>
            </View>
          )}

          {/* ── CURRENT JOB / FORMAL EMPLOYMENT CARD ── */}
          {(currentJob || formalEmployment) ? (
            <View className="mb-4 p-4" style={{ borderWidth: 2, borderColor: '#FFB81C', backgroundColor: '#0D0A00' }}>
              <Text className="text-muted-foreground text-xs tracking-wider mb-2">CURRENT EMPLOYMENT</Text>

              {formalEmployment ? (() => {
                const chain = getJobChain(formalEmployment.chainId);
                const rank = chain?.ranks[formalEmployment.rankIndex];
                const nextRank = chain?.ranks[formalEmployment.rankIndex + 1];
                const indExp = chain?.industry ? (industryExperience[chain.industry] ?? 0) : 0;
                const salary = getCurrentSalary(formalEmployment);
                const daysToPromo = nextRank
                  ? Math.max(0, nextRank.daysRequiredAtPreviousRank - formalEmployment.daysAtRank)
                  : 0;
                const expToPromo = nextRank
                  ? Math.max(0, nextRank.industryExpRequired - indExp)
                  : 0;
                const promoProgress = nextRank
                  ? Math.min(100, (formalEmployment.daysAtRank / nextRank.daysRequiredAtPreviousRank) * 100)
                  : 100;

                return (
                  <View>
                    <View className="flex-row items-center gap-2 mb-1">
                      <Text className="text-xl">{INDUSTRY_ICONS[chain?.industry ?? 'informal']}</Text>
                      <Text className="text-foreground font-bold text-lg">{rank?.title ?? currentJob?.title}</Text>
                    </View>
                    <Text className="text-muted-foreground text-sm mb-3">
                      {chain ? `${chain.industry} Service` : ''} · Salary: {formatMoney(salary)}
                      {' · '}
                      <Text style={{ color: '#FFB81C' }}>{chain?.payCycle ?? 'monthly'}</Text>
                    </Text>

                    {/* Rank progress bar */}
                    <Text className="text-muted-foreground text-xs mb-1">
                      Rank progress: {formalEmployment.daysAtRank} days at current rank
                    </Text>
                    <View className="h-2 bg-secondary mb-1">
                      <View className="h-2" style={{ width: `${promoProgress}%`, backgroundColor: '#FFB81C' }} />
                    </View>

                    {nextRank ? (
                      <View className="mt-2 p-2" style={{ backgroundColor: '#0D0D0D', borderWidth: 1, borderColor: '#333' }}>
                        <Text className="text-xs text-muted-foreground">
                          Next rank: <Text className="text-foreground">{nextRank.title}</Text>
                          {' · '}R{nextRank.monthlySalary.toLocaleString()}/mo
                        </Text>
                        <Text className="text-xs text-muted-foreground mt-0.5">
                          Requires: {daysToPromo > 0 ? `${daysToPromo} more days` : '✓ days met'}
                          {' · '}
                          {expToPromo > 0 ? `${expToPromo} more industry exp` : '✓ exp met'}
                        </Text>
                      </View>
                    ) : (
                      <View className="mt-2 px-2 py-1" style={{ backgroundColor: '#0D1A0D', borderWidth: 1, borderColor: '#4CAF50' }}>
                        <Text className="text-xs" style={{ color: '#4CAF50' }}>🏅 Maximum rank achieved!</Text>
                      </View>
                    )}
                  </View>
                );
              })() : (
                <View>
                  <Text className="text-foreground font-bold text-base">{currentJob?.title}</Text>
                  <Text className="text-muted-foreground text-sm capitalize mt-1">
                    {currentJob?.type} · Daily pay: {formatMoney(currentJob?.dailyIncome ?? 0)}
                  </Text>
                </View>
              )}

              <Pressable
                className="mt-4 py-2 items-center"
                style={{ borderWidth: 1, borderColor: '#E32636' }}
                onPress={quitJob}
              >
                <Text style={{ color: '#E32636' }} className="text-sm font-bold">RESIGN FROM JOB</Text>
              </Pressable>
            </View>
          ) : (
            <InfoCard>
              <Text className="text-muted-foreground text-sm">
                No current employment. Browse formal career chains or informal hustles below.
              </Text>
            </InfoCard>
          )}

          {/* Criminal record warning */}
          {(state.crimeState?.crimeRecords?.length ?? 0) > 0 && (
            <View className="mb-4 p-3" style={{ backgroundColor: '#1A0800', borderWidth: 1, borderColor: '#E32636' }}>
              <Text className="text-xs font-bold mb-1" style={{ color: '#E32636' }}>
                ⚠️ CRIMINAL RECORD — {state.crimeState.crimeRecords.length} offence{state.crimeState.crimeRecords.length !== 1 ? 's' : ''} on record
              </Text>
              <Text className="text-xs text-muted-foreground leading-4">
                Your criminal history affects employment opportunities. Law Enforcement and Healthcare positions may be unavailable. Finance roles require a clean record. General labour is less affected.
              </Text>
            </View>
          )}
          <InfoCard>
            <Text className="text-muted-foreground text-xs leading-5">
              💡 Formal salaries are paid weekly/biweekly/monthly automatically. Industry experience
              accumulates as you work and runs a business. Higher reputation and experience boost hustle income.
            </Text>
          </InfoCard>

          {/* Filter tabs */}
          <View className="flex-row gap-1.5 mb-4">
            {(['all', 'chains', 'formal', 'informal', 'hustle'] as FilterType[]).map(f => (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                className="flex-1 items-center py-2"
                style={{
                  borderWidth: 1,
                  borderColor: filter === f ? '#FFB81C' : '#333',
                  backgroundColor: filter === f ? '#1A1400' : '#0D0D0D',
                }}
              >
                <Text className="text-xs font-bold" style={{ color: filter === f ? '#FFB81C' : '#666' }}>
                  {f === 'chains' ? '🏅' : ''}{f.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* ── PROMOTION CHAINS TAB ── */}
          {filter === 'chains' && (
            <>
              <Text className="text-muted-foreground text-xs tracking-wider mb-3">
                FORMAL CAREER CHAINS — enroll with the required qualification to start at entry level
              </Text>
              {JOB_CHAINS.map(chain => {
                const hasQual = qualifications.includes(chain.requiredQualification);
                const isActive = formalEmployment?.chainId === chain.id;
                const isExpanded = expandedChain === chain.id;
                const indExp = (industryExperience as Record<string, number>)[chain.industry] ?? 0;

                return (
                  <View key={chain.id} className="mb-3"
                    style={{ borderWidth: 1, borderColor: isActive ? '#FFB81C' : hasQual ? '#333' : '#1A1A1A', backgroundColor: '#0D0D0D' }}>
                    {/* Chain header */}
                    <Pressable
                      className="p-4 flex-row items-center justify-between"
                      onPress={() => setExpandedChain(isExpanded ? null : chain.id)}
                    >
                      <View className="flex-row items-center gap-3 flex-1">
                        <Text className="text-2xl">{INDUSTRY_ICONS[chain.industry]}</Text>
                        <View className="flex-1">
                          <Text className="text-foreground font-bold text-sm">{chain.industry} Career Chain</Text>
                          <Text className="text-muted-foreground text-xs capitalize">
                            {chain.industry} · Paid {chain.payCycle}
                            {isActive ? ` · ${currentRankTitle}` : ''}
                          </Text>
                        </View>
                      </View>
                      <View className="items-end gap-1">
                        {isActive && <Text style={{ color: '#FFB81C' }} className="text-xs font-bold">ACTIVE</Text>}
                        {hasQual && !isActive && <Text style={{ color: '#4CAF50' }} className="text-xs">✓ ELIGIBLE</Text>}
                        <Text className="text-muted-foreground text-xs">{isExpanded ? '▲' : '▼'}</Text>
                      </View>
                    </Pressable>

                    {/* Expanded chain detail */}
                    {isExpanded && (
                      <View style={{ borderTopWidth: 1, borderTopColor: '#1E1E1E' }}>
                        {/* Ranks ladder */}
                        <View className="px-4 pt-3 pb-2">
                          <Text className="text-muted-foreground text-xs tracking-wider mb-2">PROMOTION LADDER</Text>
                          {chain.ranks.map((rank, idx) => {
                            const isCurrentRank = isActive && formalEmployment?.rankIndex === idx;
                            const isAchieved = isActive && (formalEmployment?.rankIndex ?? -1) > idx;
                            return (
                              <View
                                key={rank.title}
                                className="flex-row items-center py-2"
                                style={{ borderBottomWidth: 1, borderBottomColor: '#111' }}
                              >
                                <View className="w-6 items-center mr-3">
                                  <Text style={{ color: isAchieved ? '#4CAF50' : isCurrentRank ? '#FFB81C' : '#333' }}>
                                    {isAchieved ? '✓' : isCurrentRank ? '►' : `${idx + 1}`}
                                  </Text>
                                </View>
                                <View className="flex-1">
                                  <Text className="text-sm font-bold" style={{
                                    color: isCurrentRank ? '#FFB81C' : isAchieved ? '#4CAF50' : '#999'
                                  }}>{rank.title}</Text>
                                  {idx > 0 && (
                                    <Text className="text-xs text-muted-foreground">
                                      After {rank.daysRequiredAtPreviousRank}d · {rank.industryExpRequired} ind.exp
                                    </Text>
                                  )}
                                </View>
                                <Text className="font-bold text-sm" style={{ color: '#4CAF50' }}>
                                  {formatMoney(rank.monthlySalary)}/mo
                                </Text>
                              </View>
                            );
                          })}
                        </View>

                        {/* Prerequisites & industry exp */}
                        <View className="px-4 pb-3">
                          <Text className="text-xs mb-2" style={{ color: hasQual ? '#4CAF50' : '#E32636' }}>
                            {hasQual ? '✓' : '✗'} Requires: {chain.requiredQualification}
                          </Text>
                          <Text className="text-xs text-muted-foreground mb-3">
                            Your {chain.industry} industry exp: {indExp}
                          </Text>

                          {!isActive && (
                            <Pressable
                              onPress={() => enrollChain(chain.id)}
                              className="py-2.5 items-center"
                              style={{ backgroundColor: hasQual && !formalEmployment ? '#FFB81C' : '#222' }}
                            >
                              <Text className="font-bold text-sm" style={{
                                color: hasQual && !formalEmployment ? '#0D0D0D' : '#555'
                              }}>
                                {!hasQual ? 'QUALIFICATION REQUIRED'
                                  : formalEmployment ? 'RESIGN FIRST'
                                  : `START AS ${chain.ranks[0].title.toUpperCase()}`}
                              </Text>
                            </Pressable>
                          )}
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
            </>
          )}

          {/* ── JOB LISTINGS (non-chain view) ── */}
          {filter !== 'chains' && (
            <>
              {groupedJobs
                ? Object.entries(groupedJobs).map(([industry, jobs]) => (
                    <View key={industry} className="mb-4">
                      <Text className="text-muted-foreground text-xs tracking-wider mb-2">
                        {INDUSTRY_ICONS[industry] ?? '🔧'} {industry.toUpperCase()}
                      </Text>
                      {jobs.map(job => <JobCard key={job.id} job={job} />)}
                    </View>
                  ))
                : allJobs.map(job => <JobCard key={job.id} job={job} />)
              }
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );

  function JobCard({ job }: { job: typeof AVAILABLE_JOBS[0] }) {
    const available = jobAvailable(job);
    const isCurrentJob = currentJob?.id === job.id;
    const hasQuals = job.requiredQualifications.every(q => qualifications.includes(q));
    const inLocation = job.requiredLocation.length === 0 || job.requiredLocation.includes(location);
    const industryIcon = INDUSTRY_ICONS[job.industry ?? ''] ?? '🔧';

    return (
      <View
        className="mb-3 p-4"
        style={{
          borderWidth: 1,
          borderColor: isCurrentJob ? '#FFB81C' : available ? '#222' : '#151515',
          backgroundColor: isCurrentJob ? '#0D0A00' : '#0D0D0D',
          opacity: available ? 1 : 0.6,
        }}
      >
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1">
            {/* Type + Industry labels */}
            <View className="flex-row gap-2 mb-1">
              <Text className="text-xs" style={{ color: '#666' }}>{TYPE_LABELS[job.type]}</Text>
              {job.industry && (
                <View className="flex-row items-center gap-1 px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: '#1A1400' }}>
                  <Text className="text-xs">{industryIcon}</Text>
                  <Text className="text-xs font-bold" style={{ color: '#FFB81C' }}>{job.industry}</Text>
                </View>
              )}
            </View>
            <Text className="text-foreground font-bold text-sm">{job.title}</Text>
          </View>
          <View className="items-end">
            <Text style={{ color: '#4CAF50' }} className="font-bold">{formatMoney(job.dailyIncome)}/day</Text>
            {isCurrentJob && <Text style={{ color: '#FFB81C' }} className="text-xs mt-1">CURRENT</Text>}
          </View>
        </View>
        <View className="flex-row gap-3 mb-2">
          <Text className="text-muted-foreground text-xs">⚡ -{job.energyCost}</Text>
          <Text className="text-muted-foreground text-xs">😤 +{job.stressGain}</Text>
          {job.requiredLocation.length > 0 && (
            <Text className="text-muted-foreground text-xs">📍 {job.requiredLocation.slice(0, 2).join(', ')}</Text>
          )}
        </View>
        {job.requiredQualifications.length > 0 && (
          <Text className="text-xs mb-2" style={{ color: hasQuals ? '#4CAF50' : '#E32636' }}>
            {hasQuals ? '✓' : '✗'} Requires: {job.requiredQualifications.join(', ')}
          </Text>
        )}
        {!inLocation && (
          <Text className="text-xs mb-2" style={{ color: '#E32636' }}>✗ Not available in {location}</Text>
        )}
        {!isCurrentJob && available && (
          <Pressable onPress={() => getJob(job.id)} className="py-2 items-center mt-1" style={{ backgroundColor: '#FFB81C' }}>
            <Text className="font-bold text-sm" style={{ color: '#0D0D0D' }}>TAKE THIS JOB</Text>
          </Pressable>
        )}
      </View>
    );
  }
}

