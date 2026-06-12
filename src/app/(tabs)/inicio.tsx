import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScanCounter } from '@/components/ScanCounter';
import { Screen } from '@/components/ui/Screen';
import { listScanners, ScannerConfig } from '@/features/scanners/registry';
import { t } from '@/i18n';
import { usePurchases } from '@/services/purchases';
import { freeScansLeft, useAppStore, usePrimaryPet } from '@/store/useAppStore';
import { bcsColor, colors, radius, scoreColor, spacing, type } from '@/theme';
import { formatScanDate } from '@/utils/dates';

export default function Home() {
  const pet = usePrimaryPet();
  const premium = usePurchases((s) => s.premium);
  const freeScansUsed = useAppStore((s) => s.freeScansUsed);
  const lastScan = useAppStore((s) => s.scans[0]);

  const canScan = premium || freeScansLeft(freeScansUsed) > 0;

  const openScanner = (scanner: ScannerConfig) => {
    if (!canScan) {
      router.push('/paywall?context=limite');
      return;
    }
    router.push(`/escaner/${scanner.id}`);
  };

  return (
    <Screen>
      <View style={{ gap: spacing.md }}>
        <Text style={type.title}>
          {pet?.nombre ? t('home.greeting', { name: pet.nombre }) : t('home.greetingNoPet')}
        </Text>
        <ScanCounter />
      </View>

      <Text style={[type.heading, styles.section]}>{t('home.scanners')}</Text>
      <View style={{ gap: spacing.md }}>
        {listScanners().map((scanner) => (
          <Pressable key={scanner.id} style={styles.card} onPress={() => openScanner(scanner)}>
            <Text style={styles.cardEmoji}>{scanner.emoji}</Text>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={type.heading}>{t(scanner.titleKey)}</Text>
              <Text style={type.bodyMuted}>{t(scanner.subtitleKey)}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
      </View>

      {lastScan && (
        <>
          <Text style={[type.heading, styles.section]}>{t('home.lastScan')}</Text>
          <Pressable
            style={styles.lastScan}
            onPress={() => router.push(`/resultado/${lastScan.id}`)}
          >
            <View
              style={[
                styles.lastScore,
                {
                  backgroundColor:
                    lastScan.result.tipo === 'condicion_corporal'
                      ? bcsColor(lastScan.result.puntuacion)
                      : scoreColor(lastScan.result.puntuacion),
                },
              ]}
            >
              <Text style={styles.lastScoreText}>{Math.round(lastScan.result.puntuacion)}</Text>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[type.body, { fontWeight: '700' }]}>{lastScan.result.categoria}</Text>
              <Text style={type.small}>{formatScanDate(lastScan.createdAt)}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: spacing.xl, marginBottom: spacing.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  cardEmoji: { fontSize: 40 },
  chevron: { fontSize: 28, color: colors.textMuted },
  lastScan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  lastScore: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lastScoreText: { color: colors.textOnPrimary, fontWeight: '800', fontSize: 18 },
});
