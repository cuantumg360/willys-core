import { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { APP_NAME } from '@/config/app';
import { t } from '@/i18n';
import { AnalysisResult } from '@/services/analysis/types';
import { bcsColor, colors, radius, scoreColor, spacing } from '@/theme';

interface Props {
  result: AnalysisResult;
  petName?: string;
}

/**
 * Card con marca para compartir en TikTok/WhatsApp (marketing gratuito).
 * Se renderiza fuera de pantalla y se captura con react-native-view-shot.
 */
export const ShareCard = forwardRef<View, Props>(function ShareCard({ result, petName }, ref) {
  const isBcs = result.tipo === 'condicion_corporal';
  const color = isBcs ? bcsColor(result.puntuacion) : scoreColor(result.puntuacion);
  const scoreText = isBcs ? `${result.puntuacion}/9` : `${Math.round(result.puntuacion)}/100`;

  return (
    <View ref={ref} collapsable={false} style={styles.card}>
      <Text style={styles.brand}>🐾 {APP_NAME}</Text>
      {petName ? <Text style={styles.pet}>{petName}</Text> : null}
      <View style={[styles.scoreCircle, { borderColor: color }]}>
        <Text style={[styles.score, { color }]}>{scoreText}</Text>
      </View>
      <Text style={[styles.categoria, { color }]}>{result.categoria}</Text>
      <Text style={styles.titulo}>{result.titulo_resultado}</Text>
      <Text style={styles.footer}>{t('result.share.footer', { app: APP_NAME })}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    width: 340,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  brand: { fontSize: 18, fontWeight: '800', color: colors.primary },
  pet: { fontSize: 22, fontWeight: '800', color: colors.text },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.sm,
  },
  score: { fontSize: 34, fontWeight: '800' },
  categoria: { fontSize: 20, fontWeight: '800' },
  titulo: { fontSize: 16, color: colors.textMuted, textAlign: 'center' },
  footer: { fontSize: 13, color: colors.textMuted, marginTop: spacing.md },
});
