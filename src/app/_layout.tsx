import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { track } from '@/services/analytics';
import { colors } from '@/theme';

export default function RootLayout() {
  useEffect(() => {
    track('app_abierta');
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {/* El paywall es modal y sin gesto de cierre: se cierra con la X (tras 2 s) o comprando */}
        <Stack.Screen name="paywall" options={{ presentation: 'modal', gestureEnabled: false }} />
        <Stack.Screen name="mascota" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}
