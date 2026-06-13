import { router, useLocalSearchParams } from 'expo-router';
import { useRef } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import * as Sharing from 'expo-sharing';

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
import { colors, radius, spacing, type } from '@/theme';

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
      <View style={styles.scoreCard}>
        {scanner.resultKind === 'gauge-bcs' ? (
          <Gauge value={result.puntuacion} categoria={result.categoria} />
        ) : (
          <ScoreBar value={result.puntuacion} categoria={result.categoria} />
        )}
        <Text style={[type.small, { textAlign: 'center' }]}>{t(scanner.scaleLabelKey)}</Text>
      </View>

      <View style={{ gap: spacing.lg, marginTop: spacing.lg }}>
        <View style={{ gap: spacing.sm }}>
          <Text style={type.title}>{result.titulo_resultado}</Text>
          <Text style={type.bodyMuted}>{result.explicacion}</Text>
          {result.confianza === 'media' && (
            <Text style={[type.small, { fontStyle: 'italic' }]}>{t('result.confidence.media')}</Text>
          )}
        </View>

        {result.requiere_veterinario && <VetBanner />}

        {result.detalles.length > 0 && (
          <View style={{ gap: spacing.md }}>
            <Text style={type.heading}>{t('result.details')}</Text>
            {result.detalles.map((detail) => (
              <DetailRow key={detail.nombre} detail={detail} />
            ))}
          </View>
        )}

        {result.recomendaciones.length > 0 && (
          <View style={{ gap: spacing.sm }}>
            <Text style={type.heading}>{t('result.recommendations')}</Text>
            {result.recomendaciones.map((reco) => (
              <View key={reco} style={styles.reco}>
                <Text style={styles.recoBullet}>•</Text>
                <Text style={[type.body, { flex: 1 }]}>{reco}</Text>
              </View>
            ))}
          </View>
        )}

        <Disclaimer />

        <View style={{ gap: spacing.sm }}>
          <Button label={t('common.share')} onPress={share} variant="secondary" />
          <Button label={t('common.done')} onPress={goHome} />
        </View>
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
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
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
