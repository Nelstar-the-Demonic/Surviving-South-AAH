import { Stack } from 'expo-router';
import { GlobalEventOverlay } from '@/components/game/GlobalEventOverlay';

export default function GameLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="main" />
        <Stack.Screen name="daily-actions" />
        <Stack.Screen name="education" />
        <Stack.Screen name="employment" />
        <Stack.Screen name="business" />
        <Stack.Screen name="farming" />
        <Stack.Screen name="property" />
        <Stack.Screen name="vehicles" />
        <Stack.Screen name="shop" />
        <Stack.Screen name="inventory" />
        <Stack.Screen name="bank" />
        <Stack.Screen name="government" />
        <Stack.Screen name="relationships" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="save-game" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="prison" />
        <Stack.Screen name="hospital" />
        <Stack.Screen name="travel" />
        <Stack.Screen name="stats-info" />
      </Stack>
      <GlobalEventOverlay />
    </>
  );
}
