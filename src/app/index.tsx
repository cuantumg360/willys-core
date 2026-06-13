import { Redirect } from 'expo-router';

import { useAuth } from '@/store/useAuth';
import { useAppStore } from '@/store/useAppStore';

/**
 * Puerta de entrada. Orden: sesión (login) → onboarding la primera vez →
 * app. Mientras hidratan el almacenamiento y la sesión, no redirige (el
 * splash sigue visible).
 */
export default function Index() {
  const hydrated = useAppStore((s) => s.hydrated);
  const onboardingDone = useAppStore((s) => s.onboardingDone);
  const authStatus = useAuth((s) => s.status);

  if (!hydrated || authStatus === 'loading') return null;

  if (authStatus === 'guest') return <Redirect href="/auth" />;
  return <Redirect href={onboardingDone ? '/inicio' : '/onboarding'} />;
}
