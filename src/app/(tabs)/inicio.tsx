import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FadeIn } from '@/components/anim/FadeIn';
import { PetAvatar } from '@/components/PetAvatar';
import { ScanCounter } from '@/components/ScanCounter';
import { PressableScale } from '@/components/ui/PressableScale';
import { Screen } from '@/components/ui/Screen';
import { listScanners, ScannerConfig } from '@/features/scanners/registry';
import { t } from '@/i18n';
import { usePurchases } from '@/services/purchases';
import { freeScansLeft, useAppStore, usePrimaryPet } from '@/store/useAppStore';
import { bcsColor, colors, gradients, radius, scoreColor, shadow, spacing, type } from '@/theme';
import { formatScanDate } from '@/utils/dates';
import { deriveAlerts } from '@/utils/health';

/** Degradado del contenedor del icono de cada escáner (solo presentación). */
const ICON_GRADIENT: Record<string, readonly [string, string]> = {
  condicion_corporal: gradients.good,
  etiqueta: gradients.warn,
};

export default function Home() {
  const pet = usePrimaryPet();
  const premium = usePurchases((s) => s.premium);
  const freeScansUsed = useAppStore((s) => s.freeScansUsed);
  const scans = useAppStore((s) => s.scans);
  const reminders = useAppStore((s) => s.reminders);
  const lastScan = scans[0];

  const alerts = deriveAlerts(pet, scans, reminders);
  const canScan = premium || freeScansLeft(freeScansUsed) > 0;

  const openScanner = (scanner: ScannerConfig) => {
    if (!canScan) {
      router.push('/paywall?context=limite');
      return;
    }
    router.push(`/escaner/${scanner.id}`);
  };

  return (
    <Screen floatingTabBar>
      <FadeIn offsetY={8}>
        <LinearGradient colors={gradients.hero} style={styles.hero}>
          <View style={styles.header}>
            <Pressable onPress={() => router.push('/mascotas')}>
              <PetAvatar uri={pet?.fotoUri} size={56} />
            </Pressable>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={styles.eyebrow}>{t('home.greetingEyebrow')}</Text>
              <Text style={styles.greeting}>
                {pet?.nombre
                  ? t('home.greetingPet', { name: pet.nombre })
                  : t('home.greetingNoPetTitle')}
              </Text>
            </View>
          </View>
          <View style={{ marginTop: spacing.md }}>
            <ScanCounter />
          </View>
        </LinearGradient>
      </FadeIn>

      {alerts.length > 0 && (
        <FadeIn delay={120}>
          <PressableScale style={styles.alertBanner} onPress={() => router.push('/salud')}>
            <Text style={styles.alertEmoji}>⚠️</Text>
            <Text style={[type.small, { flex: 1, fontWeight: '600', color: colors.text }]}>
              {alerts[0].text}
              {alerts.length > 1 ? ` (+${alerts.length - 1})` : ''}
            </Text>
            <Text style={styles.chevron}>›</Text>
          </PressableScale>
        </FadeIn>
      )}

      <Text style={[styles.sectionLabel, styles.section]}>{t('home.scanners')}</Text>
      <View style={{ gap: spacing.md }}>
        {listScanners().map((scanner, index) => (
          <FadeIn key={scanner.id} delay={160 + index * 90}>
            <PressableScale style={styles.card} onPress={() => openScanner(scanner)}>
              <LinearGradient
                colors={ICON_GRADIENT[scanner.id] ?? gradients.brand}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardIcon}
              >
                <Text style={styles.cardEmoji}>{scanner.emoji}</Text>
              </LinearGradient>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={type.heading}>{t(scanner.titleKey)}</Text>
                <Text style={type.small}>{t(scanner.subtitleKey)}</Text>
              </View>
              <View style={styles.chevronCircle}>
                <Text style={styles.chevron}>›</Text>
              </View>
            </PressableScale>
          </FadeIn>
        ))}
      </View>

      {lastScan && (
        <FadeIn delay={160 + listScanners().length * 90}>
          <Text style={[styles.sectionLabel, styles.section]}>{t('home.lastScan')}</Text>
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
            <View style={styles.chevronCircle}>
              <Text style={styles.chevron}>›</Text>
            </View>
          </PressableScale>
        </FadeIn>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.soft,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.warnSoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
  },
  alertEmoji: { fontSize: 18 },
  eyebrow: { ...type.small, fontWeight: '600', color: colors.textMuted },
  greeting: { fontSize: 23, fontWeight: '800', lineHeight: 28, color: colors.text },
  sectionLabel: { ...type.heading, letterSpacing: 0.2 },
  section: { marginTop: spacing.xl, marginBottom: spacing.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.card,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEmoji: { fontSize: 30 },
  chevronCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: { fontSize: 20, fontWeight: '700', color: colors.textMuted, marginTop: -2 },
  lastScan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.card,
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
