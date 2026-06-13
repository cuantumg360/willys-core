import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { FadeIn } from '@/components/anim/FadeIn';
import { PetAvatar } from '@/components/PetAvatar';
import { ScanCounter } from '@/components/ScanCounter';
import { PressableScale } from '@/components/ui/PressableScale';
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
      <FadeIn style={styles.header} offsetY={8}>
        <PetAvatar uri={pet?.fotoUri} size={52} />
        <View style={{ flex: 1 }}>
          <Text style={type.title}>
            {pet?.nombre ? t('home.greeting', { name: pet.nombre }) : t('home.greetingNoPet')}
          </Text>
        </View>
      </FadeIn>

      <FadeIn delay={90}>
        <ScanCounter />
      </FadeIn>

      <Text style={[type.heading, styles.section]}>{t('home.scanners')}</Text>
      <View style={{ gap: spacing.md }}>
        {listScanners().map((scanner, index) => (
          <FadeIn key={scanner.id} delay={160 + index * 90}>
            <PressableScale style={styles.card} onPress={() => openScanner(scanner)}>
              <Text style={styles.cardEmoji}>{scanner.emoji}</Text>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={type.heading}>{t(scanner.titleKey)}</Text>
                <Text style={type.bodyMuted}>{t(scanner.subtitleKey)}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </PressableScale>
          </FadeIn>
        ))}
      </View>

      {lastScan && (
        <FadeIn delay={160 + listScanners().length * 90}>
          <Text style={[type.heading, styles.section]}>{t('home.lastScan')}</Text>
          <PressableScale
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
          </PressableScale>
        </FadeIn>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
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
