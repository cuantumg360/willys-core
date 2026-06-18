import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FadeIn } from '@/components/anim/FadeIn';
import { Pop } from '@/components/anim/Pop';
import { BreedPicker } from '@/components/BreedPicker';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Screen } from '@/components/ui/Screen';
import { getScanner } from '@/features/scanners/registry';
import { t } from '@/i18n';
import { track } from '@/services/analytics';
import { usePendingScan } from '@/store/usePendingScan';
import { usePrimaryPet } from '@/store/useAppStore';
import { colors, gradients, radius, shadow, spacing, type } from '@/theme';

/** Intro del escáner: qué fotos haremos + datos opcionales (BCS). */
export default function ScannerIntro() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scanner = getScanner(id);
  const pet = usePrimaryPet();
  const startScan = usePendingScan((s) => s.start);

  const [raza, setRaza] = useState<string | undefined>(pet?.raza);
  const [peso, setPeso] = useState(pet?.pesoKg ? String(pet.pesoKg) : '');

  if (!scanner) return <Redirect href="/inicio" />;

  const petName = pet?.nombre ?? 'tu perro';

  const begin = () => {
    track('escaneo_iniciado', { scanner: scanner.id });
    startScan(scanner.id, {
      raza,
      edadAnios: pet?.edadAnios,
      pesoKg: peso ? Number(peso.replace(',', '.')) || undefined : undefined,
    });
    router.push(`/escaner/${scanner.id}/camara`);
  };

  return (
    <Screen>
      <View style={{ flex: 1, gap: spacing.lg, justifyContent: 'center' }}>
        <Pop style={styles.emblemWrap}>
          <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.emblem}>
            <Text style={styles.emoji}>{scanner.emoji}</Text>
          </LinearGradient>
        </Pop>
        <FadeIn delay={140} style={{ gap: spacing.sm }}>
          <Text style={[type.title, { textAlign: 'center' }]}>{t(scanner.titleKey)}</Text>
          <Text style={[type.bodyMuted, { textAlign: 'center' }]}>
            {t(scanner.introKey, { name: petName })}
          </Text>
        </FadeIn>

        <View style={{ gap: spacing.sm }}>
          {scanner.photoSteps.map((step, index) => (
            <FadeIn key={step.id} delay={260 + index * 110} offsetY={12} style={styles.step}>
              <LinearGradient colors={gradients.brand} style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </LinearGradient>
              <Text style={[type.body, { flex: 1, fontWeight: '600' }]}>
                {t(step.titleKey, { name: petName })}
              </Text>
            </FadeIn>
          ))}
        </View>

        {scanner.collectsPetInputs && (
          <View style={{ gap: spacing.md }}>
            <Text style={[type.small, { fontWeight: '700' }]}>{t('scan.intro.optionalData')}</Text>
            <BreedPicker label={t('ob.pet.breedLabel')} value={raza} onChange={setRaza} />
            <Field
              label={t('scan.intro.weightLabel', { optional: t('common.optional') })}
              placeholder={t('scan.intro.weightPlaceholder')}
              value={peso}
              onChangeText={setPeso}
              keyboardType="decimal-pad"
            />
          </View>
        )}
      </View>

      <Button label={t('scan.intro.cta')} onPress={begin} style={{ marginTop: spacing.lg }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  emblemWrap: { alignItems: 'center' },
  emblem: {
    width: 96,
    height: 96,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  emoji: { fontSize: 48, textAlign: 'center' },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadow.card,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: { color: '#FFFFFF', fontWeight: '800' },
});
