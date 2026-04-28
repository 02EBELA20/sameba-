import { Stack } from 'expo-router';

export default function GospelsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="matthew" options={{ headerShown: false }} />
      <Stack.Screen name="matthew/[chapter]" options={{ headerShown: true }} />
    </Stack>
  );
}
