import { Stack } from 'expo-router';

export default function GameLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
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
      <Stack.Screen name="settings" />
      <Stack.Screen name="prison" />
      <Stack.Screen name="event" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
