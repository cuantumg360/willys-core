import { Redirect } from 'expo-router';

import { useAppStore } from '@/store/useAppStore';

/** Gate de entrada: onboarding la primera vez, tabs después. */
export default function Index() {
  const hydrated = useAppStore((s) => s.hydrated);
  const onboardingDone = useAppStore((s) => s.onboardingDone);

  if (!hydrated) return null; // el splash sigue visible mientras hidrata AsyncStorage

  return <Redirect href={onboardingDone ? '/inicio' : '/onboarding'} />;
}
