import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useGame } from '@/store/gameContext';
import { GameHeader } from '@/components/game/GameHeader';
import { InfoCard } from '@/components/game/InfoCard';
import { EDUCATION_COURSES } from '@/lib/game/gameData';
import { formatMoney } from '@/lib/game/gameEngine';

const INSTITUTION_ICONS: Record<string, string> = {
  'Short Course': '📜',
  TVET: '🔧',
  University: '🎓',
};

type FilterType = 'All' | 'Short Course' | 'TVET' | 'University';

export default function Education() {
  const { state, dispatch } = useGame();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('All');

  if (!state?.gameStarted) return null;
  const { qualifications, completedCourses, currentCourse, cash, stats } = state;

  function showFeedback(msg: string) {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  }

  function enroll(courseId: string) {
    const course = EDUCATION_COURSES.find(c => c.id === courseId);
    if (!course) return;
    if (currentCourse) {
      showFeedback('⚠️ Already enrolled. Complete or drop it first.');
      return;
    }
    if (cash < 500) {
      showFeedback('⚠️ Need at least R500 enrollment fee.');
      return;
    }
    const missing = course.requiredQualifications.filter(q => !qualifications.includes(q));
    if (missing.length > 0) {
      showFeedback(`⚠️ Missing prerequisites: ${missing.join(', ')}`);
      return;
    }
    dispatch({ type: 'ENROLL_COURSE', payload: courseId });
    showFeedback(`✅ Enrolled in ${course.name}. Study daily to progress.`);
  }

  const filtered = filter === 'All'
    ? EDUCATION_COURSES
    : EDUCATION_COURSES.filter(c => c.institution === filter);

  return (
    <View className="flex-1 bg-background">
      <GameHeader title="Education" subtitle="Qualifications unlock better opportunities" />

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

          {/* Education stat */}
          <View className="mb-4 p-3 flex-row items-center justify-between"
            style={{ backgroundColor: '#0A0800', borderWidth: 1, borderColor: '#333' }}>
            <Text className="text-muted-foreground text-xs">EDUCATION STAT</Text>
            <Text className="font-bold" style={{ color: '#FFB81C' }}>{stats.education}/100</Text>
          </View>

          {/* Current Enrollment */}
          {currentCourse ? (
            <InfoCard title="Currently Enrolled" accent>
              <Text className="text-foreground font-bold text-base">{currentCourse.courseName}</Text>
              <Text className="text-muted-foreground text-sm mt-1">
                {currentCourse.institution} · Daily fee: {formatMoney(currentCourse.dailyFee)}
              </Text>
              <View className="mt-3">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-muted-foreground text-xs">Days: {currentCourse.daysCompleted}/{currentCourse.totalDays}</Text>
                  <Text className="text-muted-foreground text-xs">
                    Study pts: {currentCourse.studyPointsEarned}/{currentCourse.studyPointsRequired}
                  </Text>
                </View>
                <View className="h-2 bg-secondary">
                  <View
                    className="h-2"
                    style={{
                      width: `${Math.min(100, (currentCourse.studyPointsEarned / currentCourse.studyPointsRequired) * 100)}%`,
                      backgroundColor: '#4CAF50',
                    }}
                  />
                </View>
              </View>
              {'unlocksJob' in currentCourse && !!(currentCourse as Record<string, unknown>).unlocksJob && (
                <View className="mt-3 px-2 py-1.5" style={{ backgroundColor: '#0D0A00', borderWidth: 1, borderColor: '#FFB81C' }}>
                  <Text className="text-xs" style={{ color: '#FFB81C' }}>
                    💼 Completion unlocks: {String((currentCourse as Record<string, unknown>).unlocksJob)}
                  </Text>
                </View>
              )}
              <View className="mt-2 p-2" style={{ backgroundColor: '#0D0A00' }}>
                <Text className="text-xs" style={{ color: '#FFB81C' }}>
                  💡 Use "Study" in Daily Actions to earn study points. Discipline boosts effectiveness.
                </Text>
              </View>
            </InfoCard>
          ) : (
            <InfoCard>
              <Text className="text-muted-foreground text-sm">
                Not enrolled in any course. Browse below and enroll. Enrollment fee: R500.
              </Text>
            </InfoCard>
          )}

          {/* Completed Qualifications */}
          {qualifications.length > 0 && (
            <InfoCard title="Your Qualifications">
              <View className="flex-row flex-wrap gap-2">
                {qualifications.map(q => (
                  <View key={q} className="px-2 py-1" style={{ backgroundColor: '#0D1A0D', borderWidth: 1, borderColor: '#4CAF50' }}>
                    <Text className="text-xs" style={{ color: '#4CAF50' }}>✓ {q}</Text>
                  </View>
                ))}
              </View>
            </InfoCard>
          )}

          {/* Filter tabs */}
          <View className="flex-row gap-2 mb-4">
            {(['All', 'Short Course', 'TVET', 'University'] as FilterType[]).map(f => (
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
                  {f === 'Short Course' ? 'SHORT' : f.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Course List */}
          {filtered.map(course => {
            const isCompleted = completedCourses.includes(course.id);
            const isEnrolled = currentCourse?.courseId === course.id;
            const hasPrereqs = course.requiredQualifications.every(q => qualifications.includes(q));
            const canAfford = cash >= 500;
            const unlocksJob = 'unlocksJob' in course ? course.unlocksJob as string | undefined : undefined;

            return (
              <View
                key={course.id}
                className="mb-3 p-4"
                style={{
                  borderWidth: 1,
                  borderColor: isCompleted ? '#4CAF50' : isEnrolled ? '#FFB81C' : hasPrereqs ? '#222' : '#1A1A1A',
                  backgroundColor: isCompleted ? '#050D05' : isEnrolled ? '#0D0A00' : '#0D0D0D',
                }}
              >
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1 pr-2">
                    <View className="flex-row items-center gap-2 mb-1">
                      <Text>{INSTITUTION_ICONS[course.institution]}</Text>
                      <Text className="font-bold text-sm flex-1" style={{ color: isCompleted ? '#4CAF50' : '#E8E4D8' }}>
                        {course.name}
                      </Text>
                    </View>
                    <Text className="text-muted-foreground text-xs mb-1">{course.description}</Text>
                  </View>
                  {isCompleted && <Text style={{ color: '#4CAF50' }} className="text-xs font-bold">✓ DONE</Text>}
                  {isEnrolled && <Text style={{ color: '#FFB81C' }} className="text-xs font-bold">ENROLLED</Text>}
                </View>

                <View className="flex-row flex-wrap gap-3 mb-2">
                  <Text className="text-muted-foreground text-xs">📅 {course.totalDays} days</Text>
                  <Text className="text-muted-foreground text-xs">💰 {formatMoney(course.dailyFee)}/day</Text>
                  <Text className="text-muted-foreground text-xs">🏆 {course.qualification}</Text>
                </View>

                {/* Job unlock badge */}
                {unlocksJob && (
                  <View className="mb-2 px-2 py-1" style={{ backgroundColor: '#0D0A00', borderWidth: 1, borderColor: '#FFB81C' }}>
                    <Text className="text-xs" style={{ color: '#FFB81C' }}>💼 Unlocks job: {unlocksJob}</Text>
                  </View>
                )}

                {course.requiredQualifications.length > 0 && (
                  <Text className="text-xs mb-2" style={{ color: hasPrereqs ? '#4CAF50' : '#E32636' }}>
                    {hasPrereqs ? '✓' : '✗'} Requires: {course.requiredQualifications.join(', ')}
                  </Text>
                )}

                {!isCompleted && !isEnrolled && (
                  <Pressable
                    onPress={() => enroll(course.id)}
                    className="py-2 items-center"
                    style={{ backgroundColor: hasPrereqs && canAfford ? '#FFB81C' : '#222' }}
                  >
                    <Text
                      className="font-bold text-sm"
                      style={{ color: hasPrereqs && canAfford ? '#0D0D0D' : '#555' }}
                    >
                      {!hasPrereqs ? 'PREREQUISITES NOT MET' : !canAfford ? 'INSUFFICIENT FUNDS' : 'ENROLL — R500'}
                    </Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

