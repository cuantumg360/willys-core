import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import * as Sharing from 'expo-sharing';

import { FadeIn } from '@/components/anim/FadeIn';
import { Disclaimer, VetBanner } from '@/components/result/Banners';
import { DetailRow } from '@/components/result/DetailRow';
import { Gauge } from '@/components/result/Gauge';
import { ScoreBar } from '@/components/result/ScoreBar';
import { ShareCard } from '@/components/result/ShareCard';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { getScanner } from '@/features/scanners/registry';
import { t } from '@/i18n';
import { track } from '@/services/analytics';
import { usePendingScan } from '@/store/usePendingScan';
import { useAppStore, usePrimaryPet } from '@/store/useAppStore';
import { bcsColor, colors, radius, scoreColor, shadow, spacing, type } from '@/theme';
import { bcsPercentile } from '@/utils/health';

/**
 * Pantalla de resultado. scanId === "ultimo" muestra el análisis
 * transitorio (confianza baja, no guardado); cualquier otro id se busca
 * en el historial.
 */
export default function Result() {
  const { scanId, scannerId } = useLocalSearchParams<{ scanId: string; scannerId?: string }>();
  const scan = useAppStore((s) => s.scans.find((item) => item.id === scanId));
  const lastResult = usePendingScan((s) => s.lastResult);
  const pet = usePrimaryPet();
  const shareRef = useRef<View>(null);

  const result = scanId === 'ultimo' ? lastResult : scan?.result;
  const scanner = getScanner(scan?.scannerId ?? scannerId ?? result?.tipo ?? '');

  // Háptico de revelación, acorde al veredicto (éxito / aviso / alerta).
  useEffect(() => {
    if (!result || result.confianza === 'baja') return;
    const color =
      result.tipo === 'condicion_corporal'
        ? bcsColor(result.puntuacion)
        : scoreColor(result.puntuacion);
    const feedback =
      color === colors.good
        ? Haptics.NotificationFeedbackType.Success
        : color === colors.warn
          ? Haptics.NotificationFeedbackType.Warning
          : Haptics.NotificationFeedbackType.Error;
    const timer = setTimeout(() => Haptics.notificationAsync(feedback), 250);
    return () => clearTimeout(timer);
  }, [result]);

  if (!result || !scanner) {
    router.replace('/inicio');
    return null;
  }

  const goHome = () => {
    if (router.canDismiss()) router.dismissAll();
    else router.replace('/inicio');
  };

  const share = async () => {
    if (!shareRef.current) return;
    try {
      // react-native-view-shot es un módulo nativo que NO existe en Expo Go:
      // se carga de forma diferida (solo al compartir) para no romper el
      // arranque. La captura real funciona en el development build / la app
      // compilada; en Expo Go avisamos en lugar de fallar.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { captureRef } = require('react-native-view-shot');
      const uri = await captureRef(shareRef, { format: 'png', quality: 1 });
      await Sharing.shareAsync(uri);
      track('resultado_compartido', { scanner: scanner.id });
    } catch {
      Alert.alert(t('result.share.unavailableTitle'), t('result.share.unavailableBody'));
    }
  };

  // Foto no válida: pedimos repetirla, sin resultado ni consumo de escaneo
  if (result.confianza === 'baja') {
    return (
      <Screen scroll={false}>
        <View style={styles.lowConfidence}>
          <Text style={styles.lowEmoji}>📷</Text>
          <Text style={[type.title, { textAlign: 'center' }]}>{t('result.lowConfidence.title')}</Text>
          <Text style={[type.bodyMuted, { textAlign: 'center' }]}>{result.explicacion}</Text>
        </View>
        <View style={{ gap: spacing.sm }}>
          <Button
            label={t('result.lowConfidence.retry')}
            onPress={() => {
              const { scannerId: pendingScannerId, inputs, start } = usePendingScan.getState();
              start(pendingScannerId ?? scanner.id, inputs);
              router.replace(`/escaner/${scanner.id}/camara`);
            }}
          />
          <Button label={t('common.close')} variant="ghost" onPress={goHome} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <FadeIn style={styles.scoreCard} offsetY={8}>
        {scanner.resultKind === 'gauge-bcs' ? (
          <Gauge value={result.puntuacion} categoria={result.categoria} />
        ) : (
          <ScoreBar value={result.puntuacion} categoria={result.categoria} />
        )}
        <Text style={[type.small, { textAlign: 'center' }]}>{t(scanner.scaleLabelKey)}</Text>
        {result.tipo === 'condicion_corporal' && result.peso_estimado_kg ? (
          <View style={styles.insights}>
            <Text style={styles.insight}>
              {t('result.estimatedWeight', { kg: result.peso_estimado_kg })}
            </Text>
            <Text style={styles.insight}>
              {t('result.comparePct', { pct: bcsPercentile(result.puntuacion) })}
            </Text>
          </View>
        ) : null}
      </FadeIn>

      <View style={{ gap: spacing.lg, marginTop: spacing.lg }}>
        <FadeIn delay={140} style={{ gap: spacing.sm }}>
          <Text style={type.title}>{result.titulo_resultado}</Text>
          <Text style={type.bodyMuted}>{result.explicacion}</Text>
          {result.confianza === 'media' && (
            <Text style={[type.small, { fontStyle: 'italic' }]}>{t('result.confidence.media')}</Text>
          )}
        </FadeIn>

        {result.requiere_veterinario && (
          <FadeIn delay={220}>
            <VetBanner />
          </FadeIn>
        )}

        {result.detalles.length > 0 && (
          <FadeIn delay={300} style={{ gap: spacing.md }}>
            <Text style={type.heading}>{t('result.details')}</Text>
            {result.detalles.map((detail) => (
              <DetailRow key={detail.nombre} detail={detail} />
            ))}
          </FadeIn>
        )}

        {result.recomendaciones.length > 0 && (
          <FadeIn delay={380} style={{ gap: spacing.sm }}>
            <Text style={type.heading}>{t('result.recommendations')}</Text>
            {result.recomendaciones.map((reco) => (
              <View key={reco} style={styles.reco}>
                <Text style={styles.recoBullet}>•</Text>
                <Text style={[type.body, { flex: 1 }]}>{reco}</Text>
              </View>
            ))}
          </FadeIn>
        )}

        <FadeIn delay={460} style={{ gap: spacing.lg }}>
          <Disclaimer />
          <View style={{ gap: spacing.sm }}>
            <Button label={t('common.share')} onPress={share} variant="secondary" />
            <Button label={t('common.done')} onPress={goHome} />
          </View>
        </FadeIn>
      </View>

      {/* Card de marca renderizada fuera de pantalla para capturar y compartir */}
      <View style={styles.offscreen} pointerEvents="none">
        <ShareCard ref={shareRef} result={result} petName={pet?.nombre} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scoreCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
    ...shadow.card,
  },
  insights: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  insight: {
    ...type.small,
    fontWeight: '600',
    color: colors.primaryDark,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  reco: { flexDirection: 'row', gap: spacing.sm },
  recoBullet: { color: colors.primary, fontWeight: '800', fontSize: 17 },
  lowConfidence: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  lowEmoji: { fontSize: 64 },
  offscreen: { position: 'absolute', left: -1000, top: 0 },
});
