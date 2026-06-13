import { useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { FadeIn } from '@/components/anim/FadeIn';
import { Pop } from '@/components/anim/Pop';
import { PetAvatar } from '@/components/PetAvatar';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Screen } from '@/components/ui/Screen';
import { t } from '@/i18n';
import { useAuth } from '@/store/useAuth';
import { usePrimaryPet } from '@/store/useAppStore';
import { colors, spacing, type } from '@/theme';

/**
 * Onboarding 4/5 — momento cálido tras crear el perfil: celebramos al
 * perro y explicamos el porqué de la cámara ANTES del diálogo del sistema.
 */
export default function OnboardingCamera() {
  const pet = usePrimaryPet();
  const [, requestPermission] = useCameraPermissions();
  const authed = useAuth((s) => s.status === 'authed');
  const name = pet?.nombre ?? 'tu perro';

  // Si aún no hay cuenta, el onboarding continúa por el registro; si ya la
  // hay (p. ej. al repetir el tutorial), salta directo a la oferta.
  const goNext = () =>
    router.push(authed ? '/paywall?context=onboarding' : '/auth?context=onboarding');

  const ask = async () => {
    await requestPermission();
    goNext(); // conceda o no, seguimos: la cámara volverá a pedirse al escanear
  };

  return (
    <Screen scroll={false}>
      <ProgressBar step={4} total={5} />
      <View style={styles.center}>
        <Pop>
          <PetAvatar uri={pet?.fotoUri} size={104} />
        </Pop>
        <FadeIn delay={160} style={{ gap: spacing.md }}>
          <Text style={[type.title, styles.celebrate]}>{t('ob.camera.celebrate', { name })}</Text>
          <Text style={[type.heading, { textAlign: 'center' }]}>{t('ob.camera.title')}</Text>
          <Text style={[type.bodyMuted, { textAlign: 'center' }]}>
            {t('ob.camera.body', { name })}
          </Text>
        </FadeIn>
      </View>
      <View style={{ gap: spacing.sm }}>
        <Button label={t('ob.camera.cta')} onPress={ask} />
        <Button label={t('common.notNow')} variant="ghost" onPress={goNext} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.lg },
  celebrate: { textAlign: 'center', color: colors.primaryDark },
});
