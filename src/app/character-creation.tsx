import { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useGame } from '@/store/gameContext';
import { BACKGROUNDS } from '@/lib/game/gameData';
import type { Background, Gender } from '@/types/game';
import { GameButton } from '@/components/game/GameButton';
import { StatusBar } from 'expo-status-bar';

const BACKGROUNDS_LIST: { id: Background; emoji: string }[] = [
  { id: 'unemployed_youth', emoji: '🏡' },
  { id: 'college_dropout', emoji: '📚' },
  { id: 'unemployed_graduate', emoji: '🎓' },
  { id: 'struggling_farmer', emoji: '🌾' },
  { id: 'hustler', emoji: '💼' },
];

export default function CharacterCreation() {
  const router = useRouter();
  const { dispatch } = useGame();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('Male');
  const [background, setBackground] = useState<Background | null>(null);

  function handleStart() {
    if (!name.trim() || !background) return;
    dispatch({ type: 'NEW_GAME', payload: { name: name.trim(), gender, background } });
    router.replace('/(game)/main');
  }

  const bgData = background ? BACKGROUNDS[background] : null;

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" />
      <ScrollView contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View className="bg-card border-b border-border px-4 pt-12 pb-4">
          <Pressable onPress={() => router.back()} className="mb-3">
            <Text style={{ color: '#FFB81C' }} className="text-sm">← Back</Text>
          </Pressable>
          <Text className="text-foreground text-2xl font-bold">Create Your Character</Text>
          <Text className="text-muted-foreground text-sm mt-1">Your story starts here. Choose wisely.</Text>
        </View>

        {/* Step indicators */}
        <View className="flex-row px-4 pt-4 gap-2">
          {['NAME', 'GENDER', 'BACKGROUND', 'CONFIRM'].map((s, i) => (
            <View key={s} className="flex-1 items-center">
              <View
                className="w-full h-1 mb-1"
                style={{ backgroundColor: i <= step ? '#FFB81C' : '#333' }}
              />
              <Text
                className="text-xs"
                style={{ color: i <= step ? '#FFB81C' : '#555' }}
              >{s}</Text>
            </View>
          ))}
        </View>

        <View className="px-4 pt-6 pb-10">

          {/* Step 0: Name */}
          <View className="mb-8">
            <Text className="text-muted-foreground text-xs mb-2 tracking-wider">YOUR NAME</Text>
            <TextInput
              value={name}
              onChangeText={(t) => { setName(t); if (t.length > 0 && step === 0) setStep(1); }}
              placeholder="Enter your name..."
              placeholderTextColor="#555"
              className="bg-card text-foreground text-lg p-4"
              style={{ borderWidth: 1, borderColor: name ? '#FFB81C' : '#333' }}
              maxLength={24}
            />
          </View>

          {/* Step 1: Gender */}
          {step >= 1 && (
            <View className="mb-8">
              <Text className="text-muted-foreground text-xs mb-3 tracking-wider">GENDER</Text>
              <View className="flex-row gap-3">
                {(['Male', 'Female'] as Gender[]).map((g) => (
                  <Pressable
                    key={g}
                    className="flex-1 py-4 items-center"
                    style={{
                      borderWidth: 2,
                      borderColor: gender === g ? '#FFB81C' : '#333',
                      backgroundColor: gender === g ? '#1A1400' : '#111',
                    }}
                    onPress={() => { setGender(g); if (step === 1) setStep(2); }}
                  >
                    <Text className="text-3xl mb-1">{g === 'Male' ? '👨🏿' : '👩🏿'}</Text>
                    <Text
                      className="font-bold text-sm"
                      style={{ color: gender === g ? '#FFB81C' : '#999' }}
                    >{g}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Step 2: Background */}
          {step >= 2 && (
            <View className="mb-8">
              <Text className="text-muted-foreground text-xs mb-3 tracking-wider">BACKGROUND — This shapes your entire start</Text>
              {BACKGROUNDS_LIST.map(({ id, emoji }) => {
                const bg = BACKGROUNDS[id];
                const selected = background === id;
                return (
                  <Pressable
                    key={id}
                    className="mb-3 p-4"
                    style={{
                      borderWidth: 2,
                      borderColor: selected ? '#FFB81C' : '#222',
                      backgroundColor: selected ? '#1A1400' : '#0D0D0D',
                      borderLeftWidth: selected ? 4 : 2,
                      borderLeftColor: selected ? '#FFB81C' : '#222',
                    }}
                    onPress={() => { setBackground(id); if (step === 2) setStep(3); }}
                  >
                    <View className="flex-row items-center gap-3 mb-2">
                      <Text className="text-2xl">{emoji}</Text>
                      <Text
                        className="font-bold text-base flex-1"
                        style={{ color: selected ? '#FFB81C' : '#E8E4D8' }}
                      >{bg.label}</Text>
                      {selected && <Text style={{ color: '#FFB81C' }}>✓</Text>}
                    </View>
                    <Text className="text-muted-foreground text-sm mb-3">{bg.description}</Text>
                    <View className="flex-row flex-wrap gap-2">
                      <View className="bg-secondary px-2 py-1">
                        <Text className="text-muted-foreground text-xs">📍 {bg.startingLocation}</Text>
                      </View>
                      <View className="bg-secondary px-2 py-1">
                        <Text className="text-muted-foreground text-xs">💰 R{bg.startingCash}</Text>
                      </View>
                      {bg.startingQualifications.slice(0, 2).map(q => (
                        <View key={q} className="bg-secondary px-2 py-1">
                          <Text className="text-muted-foreground text-xs">🎓 {q}</Text>
                        </View>
                      ))}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Step 3: Confirm */}
          {step >= 3 && background && (
            <View className="mb-8">
              <View
                className="p-5 mb-6"
                style={{ borderWidth: 2, borderColor: '#FFB81C', backgroundColor: '#0D0A00' }}
              >
                <Text className="text-muted-foreground text-xs mb-3 tracking-wider">YOUR CHARACTER</Text>
                <Text className="text-foreground text-2xl font-bold mb-1">{name}</Text>
                <Text className="text-muted-foreground text-sm mb-3">
                  {gender} · {BACKGROUNDS[background].label}
                </Text>
                <View className="h-px bg-border mb-3" />
                <View className="flex-row flex-wrap gap-3">
                  <View>
                    <Text className="text-muted-foreground text-xs">STARTING LOCATION</Text>
                    <Text style={{ color: '#FFB81C' }} className="font-bold">
                      {BACKGROUNDS[background].startingLocation}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-muted-foreground text-xs">STARTING CASH</Text>
                    <Text style={{ color: '#4CAF50' }} className="font-bold">
                      R{BACKGROUNDS[background].startingCash}
                    </Text>
                  </View>
                </View>
                {BACKGROUNDS[background].startingQualifications.length > 0 && (
                  <View className="mt-3">
                    <Text className="text-muted-foreground text-xs mb-1">QUALIFICATIONS</Text>
                    {BACKGROUNDS[background].startingQualifications.map(q => (
                      <Text key={q} className="text-foreground text-sm">• {q}</Text>
                    ))}
                  </View>
                )}
              </View>

              <View
                className="p-4 mb-6"
                style={{ backgroundColor: '#1A0A00', borderWidth: 1, borderColor: '#E32636' }}
              >
                <Text className="text-xs font-bold mb-1" style={{ color: '#E32636' }}>
                  ⚠️ SURVIVAL WARNING
                </Text>
                <Text className="text-muted-foreground text-xs leading-4">
                  This game is not easy. You will face hunger, debt, crime, and failure. Every
                  action has consequences. There are no shortcuts. Survive, adapt, and build
                  your life from the ground up.
                </Text>
              </View>

              <GameButton
                label="BEGIN MY STORY"
                onPress={handleStart}
                variant="primary"
                size="lg"
                disabled={!name.trim() || !background}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
