import { useEffect, useState } from 'react';
import { View, Text, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { useGame } from '@/store/gameContext';
import { GameButton } from '@/components/game/GameButton';
import { StatusBar } from 'expo-status-bar';

export default function StartScreen() {
  const router = useRouter();
  const { hasSave, loadGame, state } = useGame();
  const [loading, setLoading] = useState(false);

  // If game is already started (in-memory), go straight to main game
  useEffect(() => {
    if (state?.gameStarted) {
      router.replace('/(game)/main');
    }
  }, []);

  async function handleContinue() {
    setLoading(true);
    const ok = await loadGame();
    setLoading(false);
    if (ok) router.replace('/(game)/main');
  }

  return (
    <ImageBackground
      source={require('../../assets/splash.png')}
      resizeMode="cover"
      className="flex-1"
      style={{ backgroundColor: '#0A0700' }}
    >
      <View className="flex-1" style={{ backgroundColor: 'rgba(6,4,2,0.55)' }}>
        <StatusBar style="light" />

        {/* Hero Section */}
        <View className="flex-1 items-end justify-end px-6 pb-6">
          {/* SA flag strip */}
          <View className="flex-row w-full h-1 mb-6">
            <View className="flex-1" style={{ backgroundColor: '#007A4D' }} />
            <View className="flex-1" style={{ backgroundColor: '#FFB612' }} />
            <View className="flex-1" style={{ backgroundColor: '#DE3831' }} />
            <View className="flex-1" style={{ backgroundColor: '#002395' }} />
            <View className="flex-1" style={{ backgroundColor: '#FFFFFF' }} />
            <View className="flex-1" style={{ backgroundColor: '#000000' }} />
          </View>

          <Text
            className="text-3xl font-bold text-center mb-1 tracking-wider"
            style={{ color: '#FFB81C', textShadowColor: 'rgba(0,0,0,0.9)', textShadowRadius: 8 }}
          >
            SURVIVING
          </Text>
          <Text
            className="text-2xl font-bold text-center mb-2 tracking-widest"
            style={{ color: '#FFFFFF', textShadowColor: 'rgba(0,0,0,0.9)', textShadowRadius: 8 }}
          >
            SOUTH AAAH!!!
          </Text>
          <View className="w-16 h-px mb-4" style={{ backgroundColor: '#FFB81C' }} />
          <Text
            className="text-center text-sm mb-8 leading-5"
            style={{ color: '#E8E8E8', textShadowColor: 'rgba(0,0,0,0.9)', textShadowRadius: 6 }}
          >
            A realistic life simulation.{'\n'}
            Survive. Hustle. Build. Endure.
          </Text>

          {/* Menu Buttons */}
          <View className="w-full gap-3">
            <GameButton
              label="NEW GAME"
              icon="🆕"
              onPress={() => router.push('/character-creation')}
              variant="primary"
              size="lg"
            />
            {hasSave && (
              <GameButton
                label={loading ? 'LOADING...' : 'CONTINUE'}
                icon="▶️"
                onPress={handleContinue}
                variant="secondary"
                size="lg"
                disabled={loading}
              />
            )}
          </View>
        </View>

        {/* Footer */}
        <View className="px-6 pb-8">
          <Text className="text-center text-xs" style={{ color: '#CCCCCC', textShadowColor: 'rgba(0,0,0,0.9)', textShadowRadius: 6 }}>
            Every choice has consequences.{'\n'}
            There is no easy way out.
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
}
