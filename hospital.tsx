import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useGame } from '@/store/gameContext';
import { GameHeader } from '@/components/game/GameHeader';
import { formatMoney } from '@/lib/game/gameEngine';

const MEDICAL_SERVICES = [
  { id: 'general',   name: 'General Checkup',                  cost: 150,  icon: '🩺', desc: 'Blood pressure, vitals and health screening.', effects: { health: 10, stress: -5 } },
  { id: 'full',      name: 'Full Medical Examination',         cost: 650,  icon: '🏥', desc: 'Comprehensive blood work, X-ray and specialist review.', effects: { health: 25, stress: -10, energy: 10 } },
  { id: 'mental',    name: 'Mental Health Consultation',       cost: 400,  icon: '🧠', desc: 'Psychologist session to reduce stress and improve wellbeing.', effects: { stress: -30, happiness: 20 } },
  { id: 'dental',    name: 'Dental Checkup',                   cost: 250,  icon: '🦷', desc: 'Teeth cleaning and oral health examination.', effects: { health: 5, happiness: 5 } },
  { id: 'physio',    name: 'Physiotherapy Session',            cost: 350,  icon: '💪', desc: 'Muscle recovery and injury rehabilitation.', effects: { health: 15, energy: 15, fitness: 5 } },
  { id: 'pharmacy',  name: 'Pharmacy — Vitamins & Supplements',cost: 120,  icon: '💊', desc: 'Vitamins and supplements to restore energy.', effects: { health: 8, energy: 20 } },
];

export default function Hospital() {
  const { state, dispatch } = useGame();
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!state?.gameStarted) return null;
  const { cash, stats, injury } = state;

  function showFeedback(msg: string) {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  }

  function visitService(svc: typeof MEDICAL_SERVICES[0]) {
    if (cash < svc.cost) { showFeedback(`⚠️ Need ${formatMoney(svc.cost)}.`); return; }
    dispatch({ type: 'HOSPITAL_VISIT', payload: { cost: svc.cost, effects: svc.effects } });
    const summary = Object.entries(svc.effects).map(([k, v]) => `${v > 0 ? '+' : ''}${v} ${k}`).join(', ');
    showFeedback(`✅ ${svc.name} done. ${summary}`);
  }

  const injuryColor = injury.injured
    ? (injury.severity === 'crippling' ? '#E32636' : injury.severity === 'serious' ? '#FF6B35' : '#FFB81C')
    : '#4CAF50';

  return (
    <View className="flex-1 bg-background">
      <GameHeader title="Hospital" subtitle="Medical care & health services" />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View className="px-4 pt-4 pb-10">

          {feedback && (
            <View className="mb-4 p-3" style={{ backgroundColor: feedback.includes('✅') ? '#0D1A0D' : '#1A0A00', borderWidth: 1, borderColor: feedback.includes('✅') ? '#4CAF50' : '#FFB81C' }}>
              <Text className="text-sm" style={{ color: feedback.includes('✅') ? '#4CAF50' : '#FFB81C' }}>{feedback}</Text>
            </View>
          )}

          {/* Health status panel */}
          <View className="mb-5 p-4" style={{ borderWidth: 1, borderColor: '#333', backgroundColor: '#0D0D0D' }}>
            <Text className="text-muted-foreground text-xs tracking-wider mb-3">YOUR HEALTH STATUS</Text>
            <View className="flex-row flex-wrap gap-x-6 gap-y-2">
              {([
                { label: 'HEALTH',   val: stats.health,   good: (v: number) => v >= 70, bad: (v: number) => v < 40 },
                { label: 'ENERGY',   val: stats.energy,   good: (v: number) => v >= 60, bad: (v: number) => v < 30 },
                { label: 'STRESS',   val: stats.stress,   good: (v: number) => v <= 30, bad: (v: number) => v > 60 },
                { label: 'FITNESS',  val: stats.fitness,  good: (v: number) => v >= 60, bad: (v: number) => v < 30 },
                { label: 'HAPPINESS',val: stats.happiness,good: (v: number) => v >= 60, bad: (v: number) => v < 30 },
              ] as const).map(({ label, val, good, bad }) => (
                <View key={label}>
                  <Text className="text-muted-foreground text-xs">{label}</Text>
                  <Text className="font-bold text-base" style={{ color: good(val) ? '#4CAF50' : bad(val) ? '#E32636' : '#FFB81C' }}>
                    {val}/100
                  </Text>
                </View>
              ))}
            </View>

            {injury.injured && (
              <View className="mt-3 p-2" style={{ borderWidth: 1, borderColor: injuryColor, backgroundColor: '#1A0000' }}>
                <Text className="font-bold text-sm" style={{ color: injuryColor }}>
                  ⚕️ INJURY: {(injury.severity ?? '').toUpperCase()} — {injury.description}
                </Text>
                {(injury.daysInHospital ?? 0) > 0 && (
                  <Text className="text-xs mt-1" style={{ color: injuryColor }}>
                    Hospital recovery: {injury.daysInHospital} days remaining
                  </Text>
                )}
                {injury.crippled && (
                  <Text className="text-xs mt-1 font-bold" style={{ color: '#E32636' }}>
                    ⚠️ Permanent disability — unable to perform heavy labour
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Services */}
          <Text className="text-muted-foreground text-xs tracking-wider mb-3">AVAILABLE SERVICES</Text>
          {MEDICAL_SERVICES.map(svc => {
            const canAfford = cash >= svc.cost;
            return (
              <View key={svc.id} className="mb-3 p-4" style={{ borderWidth: 1, borderColor: canAfford ? '#222' : '#1A0000', backgroundColor: '#0D0D0D' }}>
                <View className="flex-row items-start mb-2">
                  <Text className="text-2xl mr-3">{svc.icon}</Text>
                  <View className="flex-1">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-foreground font-bold text-sm flex-1">{svc.name}</Text>
                      <Text className="font-bold ml-2" style={{ color: canAfford ? '#FFB81C' : '#E32636' }}>{formatMoney(svc.cost)}</Text>
                    </View>
                    <Text className="text-muted-foreground text-xs mt-1 mb-2">{svc.desc}</Text>
                    <View className="flex-row flex-wrap gap-2">
                      {Object.entries(svc.effects).map(([stat, val]) => (
                        <Text key={stat} className="text-xs px-2 py-0.5"
                          style={{ backgroundColor: val > 0 ? '#0A1200' : '#1A0A00', color: val > 0 ? '#4CAF50' : '#FF6B35' }}>
                          {val > 0 ? '+' : ''}{val} {stat}
                        </Text>
                      ))}
                    </View>
                  </View>
                </View>
                <Pressable onPress={() => visitService(svc)} className="py-2 mt-2 items-center"
                  style={{ backgroundColor: canAfford ? '#FFB81C' : '#1A0000', opacity: canAfford ? 1 : 0.6 }}>
                  <Text className="font-bold text-sm" style={{ color: canAfford ? '#0D0D0D' : '#555' }}>
                    {canAfford ? 'VISIT NOW' : `NEED ${formatMoney(svc.cost - cash)} MORE`}
                  </Text>
                </Pressable>
              </View>
            );
          })}

        </View>
      </ScrollView>
    </View>
  );
}
