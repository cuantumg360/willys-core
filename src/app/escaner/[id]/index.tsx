import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BreedPicker } from '@/components/BreedPicker';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Screen } from '@/components/ui/Screen';
import { getScanner } from '@/features/scanners/registry';
import { t } from '@/i18n';
import { track } from '@/services/analytics';
import { usePendingScan } from '@/store/usePendingScan';
import { usePrimaryPet } from '@/store/useAppStore';
import { colors, radius, spacing, type } from '@/theme';

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
        <Text style={styles.emoji}>{scanner.emoji}</Text>
        <Text style={[type.title, { textAlign: 'center' }]}>{t(scanner.titleKey)}</Text>
        <Text style={[type.bodyMuted, { textAlign: 'center' }]}>
          {t(scanner.introKey, { name: petName })}
        </Text>

        <View style={{ gap: spacing.sm }}>
          {scanner.photoSteps.map((step, index) => (
            <View key={step.id} style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={[type.body, { flex: 1, fontWeight: '600' }]}>
                {t(step.titleKey, { name: petName })}
              </Text>
            </View>
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
  emoji: { fontSize: 64, textAlign: 'center' },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: { color: colors.primaryDark, fontWeight: '800' },
});
