import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PortalHost } from '@rn-primitives/portal';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { GameProvider } from '@/store/gameContext';
import { DaySummaryModal } from '@/components/game/DaySummaryModal';
import "../global.css";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GameProvider>
        <StatusBar style="light" backgroundColor="#0D0D0D" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="character-creation" />
        </Stack>
        <DaySummaryModal />
        <PortalHost />
      </GameProvider>
    </GestureHandlerRootView>
  );
}
