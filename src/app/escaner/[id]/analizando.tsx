import * as Haptics from 'expo-haptics';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { PulseRings } from '@/components/anim/PulseRings';
import { getScanner } from '@/features/scanners/registry';
import { t } from '@/i18n';
import { analyze } from '@/services/analysis';
import { track } from '@/services/analytics';
import { usePurchases } from '@/services/purchases';
import { usePendingScan } from '@/store/usePendingScan';
import { selectActivePet, useAppStore } from '@/store/useAppStore';
import { colors, radius, spacing, type } from '@/theme';
import { newId } from '@/utils/id';

const STEP_INTERVAL_MS = 1400;
/** Espera mínima percibida: el feedback con pasos aumenta el valor del resultado. */
const MIN_WAIT_MS = 4200;

export default function Analyzing() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scanner = getScanner(id);

  const pending = usePendingScan.getState();
  const premium = usePurchases((s) => s.premium);
  const [stepIndex, setStepIndex] = useState(0);
  const startedRef = useRef(false);

  // Animaciones (todas con Animated nativo)
  const float = useRef(new Animated.Value(0)).current; // icono flotando arriba/abajo
  const progress = useRef(new Animated.Value(0)).current; // barra 0 → 1
  const textFade = useRef(new Animated.Value(1)).current; // crossfade del texto de paso

  useEffect(() => {
    if (!scanner || startedRef.current) return;
    startedRef.current = true;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    ).start();

    Animated.timing(progress, {
      toValue: 1,
      duration: MIN_WAIT_MS,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();

    const interval = setInterval(
      () => setStepIndex((i) => Math.min(i + 1, scanner.analyzingKeys.length - 1)),
      STEP_INTERVAL_MS,
    );

    const run = async () => {
      const { addScan, consumeFreeScan } = useAppStore.getState();
      const pet = selectActivePet(useAppStore.getState());

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

      // Registro automático de peso. El peso conocido (indicado por el dueño)
      // es la fuente fiable; si no lo hay, se usa la estimación orientativa.
      const knownWeight = pending.inputs.pesoKg;
      const weightKg = knownWeight ?? result.peso_estimado_kg;
      if (pet && result.tipo === 'condicion_corporal' && weightKg) {
        useAppStore.getState().addHealthRecord({
          id: newId(),
          petId: pet.id,
          kind: 'peso',
          title: knownWeight ? 'Peso (indicado por ti)' : 'Peso estimado (orientativo)',
          date: scan.createdAt,
          weightKg,
        });
        useAppStore.getState().updatePet(pet.id, { pesoKg: weightKg });
      }

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

  // Crossfade + tick háptico cada vez que cambia el paso
  useEffect(() => {
    if (!startedRef.current) return;
    Haptics.selectionAsync();
    textFade.setValue(0);
    Animated.timing(textFade, { toValue: 1, duration: 360, useNativeDriver: true }).start();
  }, [stepIndex, textFade]);

  if (!scanner) return <Redirect href="/inicio" />;

  const translateY = float.interpolate({ inputRange: [0, 1], outputRange: [6, -6] });

  return (
    <View style={styles.screen}>
      <View style={styles.scanner}>
        <PulseRings size={190} count={3} />
        <Animated.View style={[styles.iconCircle, { transform: [{ translateY }] }]}>
          <Text style={styles.emoji}>{scanner.emoji}</Text>
        </Animated.View>
      </View>

      <Animated.Text style={[type.heading, styles.stepText, { opacity: textFade }]}>
        {t(scanner.analyzingKeys[stepIndex])}
      </Animated.Text>

      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            { width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
          ]}
        />
      </View>

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
    gap: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  scanner: { width: 190, height: 190, alignItems: 'center', justifyContent: 'center' },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 56 },
  stepText: { textAlign: 'center', minHeight: 26 },
  progressTrack: {
    width: '78%',
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.primary },
  dots: { flexDirection: 'row', gap: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primary },
});
