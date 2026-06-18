import { Redirect } from 'expo-router';

import { useAuth } from '@/store/useAuth';
import { useAppStore } from '@/store/useAppStore';

/**
 * Puerta de entrada. Orden: onboarding la primera vez → app. La cuenta es
 * OPCIONAL: el usuario puede usar la app como invitado e iniciar sesión
 * cuando quiera (desde Ajustes o la Comunidad). No se fuerza el login al
 * abrir. Mientras hidratan el almacenamiento y la sesión, no redirige.
 */
export default function Index() {
  const hydrated = useAppStore((s) => s.hydrated);
  const onboardingDone = useAppStore((s) => s.onboardingDone);
  const authStatus = useAuth((s) => s.status);

  if (!hydrated || authStatus === 'loading') return null;

  if (!onboardingDone) return <Redirect href="/onboarding" />;
  return <Redirect href="/inicio" />;
}
