import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { track } from '@/services/analytics';
import { configureNotifications, rescheduleReminders } from '@/services/notifications';
import { usePurchases } from '@/services/purchases';
import { selectActivePet, useAppStore } from '@/store/useAppStore';
import { useAuth } from '@/store/useAuth';
import { colors } from '@/theme';
import { useAppFonts } from '@/theme/fonts';

// Mantén el splash hasta que las fuentes estén listas (evita un parpadeo con
// la fuente del sistema antes de Nunito).
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const fontsLoaded = useAppFonts();
  const hydrated = useAppStore((s) => s.hydrated);

  useEffect(() => {
    track('app_abierta');
    configureNotifications();
    // Carga la sesión (login) y el estado premium (compras) al arrancar.
    useAuth.getState().init();
    usePurchases.getState().init();
  }, []);

  // Reprograma los avisos locales cuando los datos están listos.
  useEffect(() => {
    if (!hydrated) return;
    const s = useAppStore.getState();
    rescheduleReminders(s.reminders, selectActivePet(s)?.nombre);
  }, [hydrated]);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

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
        {/* Paywall a pantalla completa (NO modal): evita solapes al encadenarlo
            en el onboarding. Se cierra con la X (tras 2 s) o comprando. */}
        <Stack.Screen name="paywall" options={{ gestureEnabled: false }} />
        <Stack.Screen name="mascota" options={{ presentation: 'modal' }} />
        <Stack.Screen name="registro" options={{ presentation: 'modal' }} />
        <Stack.Screen name="recordatorio" options={{ presentation: 'modal' }} />
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
        <Stack.Screen
          name="comunidad"
          options={{
            headerShown: true,
            headerTitle: '',
            headerBackTitle: '',
            headerTintColor: colors.primary,
            headerStyle: { backgroundColor: colors.background },
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="chat"
          options={{
            headerShown: true,
            headerTitle: '',
            headerBackTitle: '',
            headerTintColor: colors.primary,
            headerStyle: { backgroundColor: colors.background },
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="calendario"
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
