import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TrendChart } from '@/components/TrendChart';
import { Screen } from '@/components/ui/Screen';
import { getScanner } from '@/features/scanners/registry';
import { t } from '@/i18n';
import { useAppStore, usePrimaryPet } from '@/store/useAppStore';
import { bcsColor, colors, radius, scoreColor, spacing, type } from '@/theme';
import { formatScanDate } from '@/utils/dates';

export default function History() {
  const scans = useAppStore((s) => s.scans);
  const pet = usePrimaryPet();

  // Evolución BCS del perro principal (orden cronológico ascendente)
  const bcsValues = scans
    .filter((s) => s.result.tipo === 'condicion_corporal' && s.result.confianza !== 'baja')
    .map((s) => s.result.puntuacion)
    .reverse();

  return (
    <Screen>
      <Text style={type.title}>{t('history.title')}</Text>

      {scans.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🐕</Text>
          <Text style={type.heading}>{t('history.empty.title')}</Text>
          <Text style={[type.bodyMuted, { textAlign: 'center' }]}>
            {pet?.nombre
              ? t('history.empty.body', { name: pet.nombre })
              : t('history.empty.bodyNoPet')}
          </Text>
        </View>
      ) : (
        <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
          {bcsValues.length >= 2 && pet && <TrendChart values={bcsValues} petName={pet.nombre} />}

          {scans.map((scan) => {
            const scanner = getScanner(scan.scannerId);
            const color =
              scan.result.tipo === 'condicion_corporal'
                ? bcsColor(scan.result.puntuacion)
                : scoreColor(scan.result.puntuacion);
            return (
              <Pressable
                key={scan.id}
                style={styles.row}
                onPress={() => router.push(`/resultado/${scan.id}`)}
              >
                <Text style={styles.rowEmoji}>{scanner?.emoji ?? '🐾'}</Text>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[type.body, { fontWeight: '700' }]}>
                    {scanner ? t(scanner.titleKey) : scan.scannerId}
                  </Text>
                  <Text style={type.small}>{formatScanDate(scan.createdAt)}</Text>
                </View>
                <Text style={[styles.rowScore, { color }]}>{scan.result.categoria}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  emptyEmoji: { fontSize: 64 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  rowEmoji: { fontSize: 28 },
  rowScore: { ...type.small, fontWeight: '800' },
});
