import { useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Screen } from '@/components/ui/Screen';
import { t } from '@/i18n';
import { usePrimaryPet } from '@/store/useAppStore';
import { spacing, type } from '@/theme';

/**
 * Onboarding 4/5 — pantalla previa al permiso de cámara: explicamos el
 * porqué ANTES de disparar el diálogo del sistema (mejora la aceptación).
 */
export default function OnboardingCamera() {
  const pet = usePrimaryPet();
  const [, requestPermission] = useCameraPermissions();

  const goNext = () => router.push('/paywall?context=onboarding');

  const ask = async () => {
    await requestPermission();
    goNext(); // conceda o no, seguimos: la cámara volverá a pedirse al escanear
  };

  return (
    <Screen scroll={false}>
      <ProgressBar step={4} total={5} />
      <View style={styles.center}>
        <Text style={styles.emoji}>📷</Text>
        <Text style={[type.title, { textAlign: 'center' }]}>
          {t('ob.camera.title', { name: pet?.nombre ?? 'tu perro' })}
        </Text>
        <Text style={[type.bodyMuted, { textAlign: 'center' }]}>{t('ob.camera.body')}</Text>
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
  emoji: { fontSize: 72 },
});
