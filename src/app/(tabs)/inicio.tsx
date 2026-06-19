import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FadeIn } from '@/components/anim/FadeIn';
import { PetAvatar } from '@/components/PetAvatar';
import { ScanCounter } from '@/components/ScanCounter';
import { ScoreRing } from '@/components/result/ScoreRing';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { Screen } from '@/components/ui/Screen';
import { listScanners, ScannerConfig } from '@/features/scanners/registry';
import { t, TKey } from '@/i18n';
import { usePurchases } from '@/services/purchases';
import { freeScansLeft, useAppStore, usePrimaryPet } from '@/store/useAppStore';
import { bcsColor, colors, gradients, radius, scoreColor, shadow, spacing, type } from '@/theme';
import { buildDashboard, DASH_SUB_KEYS, DASH_VALUE_KEYS, DashItem, Tone } from '@/utils/dashboard';
import { formatScanDate } from '@/utils/dates';
import { careStreak } from '@/utils/health';

const TONE_COLOR: Record<Tone, string> = {
  good: colors.good,
  warn: colors.warn,
  bad: colors.bad,
  neutral: colors.text,
};

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
  const healthRecords = useAppStore((s) => s.healthRecords);
  const lastScan = scans[0];

  const streak = careStreak(scans, healthRecords);
  const dash = buildDashboard(pet, scans, healthRecords, reminders);
  const canScan = premium || freeScansLeft(freeScansUsed) > 0;

  // Puntuación de salud glanceable (0-100) derivada del último BCS.
  const lastBcs = scans.find(
    (s) =>
      (!s.petId || s.petId === pet?.id) &&
      s.result.tipo === 'condicion_corporal' &&
      s.result.confianza !== 'baja',
  )?.result.puntuacion;
  const healthScore =
    lastBcs !== undefined
      ? Math.max(30, Math.round(100 - Math.min(1, Math.abs(lastBcs - 4.5) / 4.5) * 55))
      : null;
  const healthLabel =
    healthScore == null
      ? ''
      : healthScore >= 80
        ? t('home.health.excellent')
        : healthScore >= 60
          ? t('home.health.good')
          : healthScore >= 40
            ? t('home.health.fair')
            : t('home.health.poor');

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
            {streak > 0 && (
              <View style={styles.streak}>
                <Text style={styles.streakFlame}>🔥</Text>
                <Text style={styles.streakDays}>
                  {streak === 1 ? t('home.streak.one') : t('home.streak.days', { days: streak })}
                </Text>
                <Text style={styles.streakLabel}>{t('home.streak.label')}</Text>
              </View>
            )}
          </View>
          <View style={{ marginTop: spacing.md }}>
            <ScanCounter />
          </View>
        </LinearGradient>
      </FadeIn>

      {/* Puntuación de salud héroe (glanceable, número grande con count-up) */}
      <FadeIn delay={60} style={styles.healthCard}>
        {healthScore != null ? (
          <>
            <Text style={styles.healthTitle}>{t('home.health.title', { name: pet?.nombre ?? '' })}</Text>
            <ScoreRing
              value={healthScore}
              max={100}
              categoria={healthLabel}
              color={scoreColor(healthScore)}
            />
          </>
        ) : (
          <>
            <Text style={styles.healthEmoji}>📸</Text>
            <Text style={[type.heading, { textAlign: 'center' }]}>
              {t('home.health.empty', { name: pet?.nombre ?? 'tu perro' })}
            </Text>
            <Button
              label={t('home.health.scan')}
              onPress={() => openScanner(listScanners()[0])}
              style={{ alignSelf: 'stretch' }}
            />
          </>
        )}
      </FadeIn>

      {/* Resumen tipo panel (etiquetas): peso, objetivo, estado, nutrición… */}
      <Text style={[styles.sectionLabel, styles.section, { marginTop: spacing.xl }]}>
        {t('home.summary')}
      </Text>
      <View style={styles.grid}>
        {dash.map((item, index) => (
          <FadeIn key={item.id} delay={80 + index * 50} style={styles.gridItem}>
            <SummaryCard item={item} />
          </FadeIn>
        ))}
      </View>

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

function SummaryCard({ item }: { item: DashItem }) {
  const color = TONE_COLOR[item.tone];
  const value = DASH_VALUE_KEYS.has(item.value) ? t(item.value as TKey) : item.value;
  const sub = item.sub && DASH_SUB_KEYS.has(item.sub) ? t(item.sub as TKey) : item.sub;
  const body = (
    <View style={[styles.summaryCard, { borderLeftColor: color }]}>
      <View style={styles.summaryTop}>
        <Text style={styles.summaryEmoji}>{item.emoji}</Text>
        <Text style={styles.summaryLabel} numberOfLines={1}>
          {t(item.labelKey)}
        </Text>
      </View>
      <Text style={[styles.summaryValue, { color }]} numberOfLines={1}>
        {value}
      </Text>
      {sub ? (
        <Text style={styles.summarySub} numberOfLines={1}>
          {sub}
        </Text>
      ) : null}
    </View>
  );
  if (!item.route) return body;
  return (
    <PressableScale onPress={() => router.push(item.route as never)}>{body}</PressableScale>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  gridItem: { width: '48%' },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 4,
    borderLeftWidth: 4,
    minHeight: 92,
    justifyContent: 'center',
    ...shadow.soft,
  },
  summaryTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  summaryEmoji: { fontSize: 15 },
  summaryLabel: { ...type.small, fontWeight: '600', color: colors.textMuted, flex: 1 },
  summaryValue: { fontSize: 19, fontWeight: '800', color: colors.text },
  summarySub: { ...type.small, color: colors.textMuted },
  healthCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
    alignItems: 'center',
    gap: spacing.md,
    ...shadow.card,
  },
  healthTitle: { ...type.heading },
  healthEmoji: { fontSize: 44 },
  hero: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.soft,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  eyebrow: { ...type.small, fontWeight: '600', color: colors.textMuted },
  greeting: { fontSize: 23, fontWeight: '800', lineHeight: 28, color: colors.text },
  streak: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    minWidth: 58,
    ...shadow.soft,
  },
  streakFlame: { fontSize: 18 },
  streakDays: { ...type.small, fontWeight: '800', color: colors.text },
  streakLabel: { fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.4 },
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
