import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { track } from '@/services/analytics';
import { usePurchases } from '@/services/purchases';
import { useAuth } from '@/store/useAuth';
import { colors } from '@/theme';

export default function RootLayout() {
  useEffect(() => {
    track('app_abierta');
    // Carga la sesión (login) y el estado premium (compras) al arrancar.
    useAuth.getState().init();
    usePurchases.getState().init();
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
        {/* Login: sin gesto de cierre (es la puerta de entrada cuando no hay sesión) */}
        <Stack.Screen name="auth" options={{ gestureEnabled: false }} />
        {/* El paywall es modal y sin gesto de cierre: se cierra con la X (tras 2 s) o comprando */}
        <Stack.Screen name="paywall" options={{ presentation: 'modal', gestureEnabled: false }} />
        <Stack.Screen name="mascota" options={{ presentation: 'modal' }} />
        <Stack.Screen
          name="mascotas"
          options={{
            headerShown: true,
            headerTitle: '',
            headerBackTitle: '',
            headerTintColor: colors.primary,
            headerStyle: { backgroundColor: colors.background },
            headerShadowVisible: false,
          }}
        />
      </Stack>
    </>
  );
}
