import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { getScanner } from '@/features/scanners/registry';
import { t } from '@/i18n';
import { analyze } from '@/services/analysis';
import { track } from '@/services/analytics';
import { usePurchases } from '@/services/purchases';
import { usePendingScan } from '@/store/usePendingScan';
import { useAppStore } from '@/store/useAppStore';
import { colors, spacing, type } from '@/theme';
import { newId } from '@/utils/id';

const STEP_INTERVAL_MS = 1300;
/** Espera mínima percibida: el feedback con pasos aumenta el valor del resultado. */
const MIN_WAIT_MS = 3800;

export default function Analyzing() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scanner = getScanner(id);

  const pending = usePendingScan.getState();
  const premium = usePurchases((s) => s.premium);
  const [stepIndex, setStepIndex] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!scanner || startedRef.current) return;
    startedRef.current = true;

    const interval = setInterval(
      () => setStepIndex((i) => Math.min(i + 1, scanner.analyzingKeys.length - 1)),
      STEP_INTERVAL_MS,
    );

    const run = async () => {
      const { pets, addScan, consumeFreeScan } = useAppStore.getState();
      const pet = pets[0];

      const [result] = await Promise.all([
        analyze({
          scannerId: scanner.id,
          photoUris: pending.photoUris,
          pet: { nombre: pet?.nombre, ...pending.inputs },
        }),
        new Promise((resolve) => setTimeout(resolve, MIN_WAIT_MS)),
      ]);

      if (result.confianza === 'baja') {
        // Foto no válida: se muestra el aviso pero no consume escaneo ni va al historial
        usePendingScan.getState().setLastResult(result);
        router.replace(`/resultado/ultimo?scannerId=${scanner.id}`);
        return;
      }

      const scan = {
        id: newId(),
        scannerId: scanner.id,
        petId: pet?.id,
        createdAt: new Date().toISOString(),
        photoUris: pending.photoUris,
        result,
      };
      addScan(scan);
      if (!premium) consumeFreeScan();
      track('escaneo_completado', { scanner: scanner.id, confianza: result.confianza });
      usePendingScan.getState().reset();
      router.replace(`/resultado/${scan.id}`);
    };

    run().catch((error) => {
      track('escaneo_fallido', { scanner: scanner.id, error: String(error) });
      router.back();
    });

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!scanner) return <Redirect href="/inicio" />;

  return (
    <View style={styles.screen}>
      <Text style={styles.emoji}>{scanner.emoji}</Text>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[type.heading, { textAlign: 'center' }]}>
        {t(scanner.analyzingKeys[stepIndex])}
      </Text>
      <View style={styles.dots}>
        {scanner.analyzingKeys.map((_, i) => (
          <View key={i} style={[styles.dot, i <= stepIndex && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  emoji: { fontSize: 64 },
  dots: { flexDirection: 'row', gap: spacing.sm },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primary },
});
