import { Redirect } from 'expo-router';

import { useAuth } from '@/store/useAuth';
import { useAppStore } from '@/store/useAppStore';

/**
 * Puerta de entrada. Orden: onboarding la primera vez → crear cuenta /
 * iniciar sesión → app. Mientras hidratan el almacenamiento y la sesión,
 * no redirige (el splash sigue visible).
 */
export default function Index() {
  const hydrated = useAppStore((s) => s.hydrated);
  const onboardingDone = useAppStore((s) => s.onboardingDone);
  const authStatus = useAuth((s) => s.status);

  if (!hydrated || authStatus === 'loading') return null;

  if (!onboardingDone) return <Redirect href="/onboarding" />;
  if (authStatus === 'guest') return <Redirect href="/auth" />;
  return <Redirect href="/inicio" />;
}
