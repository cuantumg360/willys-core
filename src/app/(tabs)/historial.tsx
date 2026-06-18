import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FadeIn } from '@/components/anim/FadeIn';
import { PetAvatar } from '@/components/PetAvatar';
import { TrendChart } from '@/components/TrendChart';
import { Screen } from '@/components/ui/Screen';
import { getScanner } from '@/features/scanners/registry';
import { t, TKey } from '@/i18n';
import { ScanRecord } from '@/store/types';
import { useAppStore, usePrimaryPet } from '@/store/useAppStore';
import { bcsColor, colors, gradients, radius, scoreColor, shadow, spacing, type } from '@/theme';
import { formatScanDate } from '@/utils/dates';
import { careStreak } from '@/utils/health';

type Filter = 'todos' | 'condicion_corporal' | 'etiqueta';
const FILTERS: { id: Filter; key: TKey }[] = [
  { id: 'todos', key: 'history.filter.all' },
  { id: 'condicion_corporal', key: 'history.filter.body' },
  { id: 'etiqueta', key: 'history.filter.label' },
];

/** Mejora/empeora de un escaneo BCS respecto al BCS anterior (más cerca de 4.5 = mejor). */
function bcsDelta(scans: ScanRecord[], index: number): 'better' | 'worse' | 'same' | null {
  const current = scans[index];
  if (current.result.tipo !== 'condicion_corporal') return null;
  const prev = scans
    .slice(index + 1)
    .find((s) => s.result.tipo === 'condicion_corporal' && s.result.confianza !== 'baja');
  if (!prev) return null;
  const dNow = Math.abs(current.result.puntuacion - 4.5);
  const dPrev = Math.abs(prev.result.puntuacion - 4.5);
  if (Math.abs(dNow - dPrev) < 0.25) return 'same';
  return dNow < dPrev ? 'better' : 'worse';
}

const DELTA_KEY: Record<'better' | 'worse' | 'same', TKey> = {
  better: 'history.delta.better',
  worse: 'history.delta.worse',
  same: 'history.delta.same',
};

export default function History() {
  const pet = usePrimaryPet();
  const allScans = useAppStore((s) => s.scans);
  const healthRecords = useAppStore((s) => s.healthRecords);
  const [filter, setFilter] = useState<Filter>('todos');

  const scans = allScans.filter((scan) => !scan.petId || scan.petId === pet?.id);
  const shown = filter === 'todos' ? scans : scans.filter((s) => s.result.tipo === filter);

  const bcsValues = scans
    .filter((s) => s.result.tipo === 'condicion_corporal' && s.result.confianza !== 'baja')
    .map((s) => s.result.puntuacion)
    .reverse();
  const lastBcs = scans.find(
    (s) => s.result.tipo === 'condicion_corporal' && s.result.confianza !== 'baja',
  );
  const streak = careStreak(scans, healthRecords);

  if (scans.length === 0) {
    return (
      <Screen floatingTabBar>
        <Text style={type.title}>{t('history.title')}</Text>
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🐕</Text>
          <Text style={type.heading}>{t('history.empty.title')}</Text>
          <Text style={[type.bodyMuted, { textAlign: 'center' }]}>
            {pet?.nombre ? t('history.empty.body', { name: pet.nombre }) : t('history.empty.bodyNoPet')}
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen floatingTabBar>
      {/* Cabecera de progreso */}
      <LinearGradient colors={gradients.hero} style={styles.hero}>
        <View style={styles.heroTop}>
          <PetAvatar uri={pet?.fotoUri} size={48} />
          <View style={{ flex: 1 }}>
            <Text style={type.title}>{t('history.title')}</Text>
            {pet?.nombre ? <Text style={type.small}>{pet.nombre}</Text> : null}
          </View>
        </View>
        <View style={styles.statsRow}>
          <Stat
            label={t('history.stat.bcs')}
            value={lastBcs ? `${Math.round(lastBcs.result.puntuacion)}` : '—'}
            unit={lastBcs ? '/9' : undefined}
            color={lastBcs ? bcsColor(lastBcs.result.puntuacion) : colors.textMuted}
          />
          <Stat label={t('history.stat.scans')} value={`${scans.length}`} />
          <Stat label={t('history.stat.streak')} value={t('history.streakDays', { n: streak })} />
        </View>
      </LinearGradient>

      {/* Gráfica de evolución */}
      {bcsValues.length >= 2 && pet && (
        <View style={styles.chartCard}>
          <TrendChart values={bcsValues} petName={pet.nombre} />
        </View>
      )}

      {/* Filtros */}
      <View style={styles.filters}>
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <Pressable
              key={f.id}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setFilter(f.id)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{t(f.key)}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Timeline */}
      {shown.length === 0 ? (
        <Text style={[type.bodyMuted, { textAlign: 'center', marginTop: spacing.lg }]}>
          {t('history.filterEmpty')}
        </Text>
      ) : (
        <View style={styles.timeline}>
          {shown.map((scan, index) => {
            const scanner = getScanner(scan.scannerId);
            const isBcs = scan.result.tipo === 'condicion_corporal';
            const color = isBcs ? bcsColor(scan.result.puntuacion) : scoreColor(scan.result.puntuacion);
            const last = index === shown.length - 1;
            const delta = bcsDelta(scans, scans.indexOf(scan));
            const thumb = scan.photoUris?.[1] ?? scan.photoUris?.[0];
            return (
              <FadeIn key={scan.id} delay={index * 60} offsetY={12} style={styles.row}>
                <View style={styles.railCol}>
                  <View style={[styles.node, { borderColor: color }]}>
                    {thumb ? (
                      <Image source={{ uri: thumb }} style={styles.nodeImg} contentFit="cover" />
                    ) : (
                      <Text style={styles.nodeEmoji}>{scanner?.emoji ?? '🐾'}</Text>
                    )}
                  </View>
                  {!last && <View style={styles.rail} />}
                </View>
                <Pressable style={styles.card} onPress={() => router.push(`/resultado/${scan.id}`)}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={styles.cardTitle}>
                      {scanner ? t(scanner.titleKey) : scan.scannerId}
                    </Text>
                    <Text style={type.small}>{formatScanDate(scan.createdAt)}</Text>
                    {delta && (
                      <View style={[styles.delta, deltaStyle(delta)]}>
                        <Text style={[styles.deltaText, { color: deltaColor(delta) }]}>
                          {t(DELTA_KEY[delta])}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={[styles.scoreCircle, { backgroundColor: color }]}>
                    <Text style={styles.scoreText}>{Math.round(scan.result.puntuacion)}</Text>
                  </View>
                </Pressable>
              </FadeIn>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

function Stat({ label, value, unit, color }: { label: string; value: string; unit?: string; color?: string }) {
  return (
    <View style={styles.stat}>
      <View style={styles.statValueRow}>
        <Text style={[styles.statValue, color && { color }]}>{value}</Text>
        {unit ? <Text style={styles.statUnit}>{unit}</Text> : null}
      </View>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const deltaColor = (d: 'better' | 'worse' | 'same') =>
  d === 'better' ? colors.good : d === 'worse' ? colors.warn : colors.textMuted;
const deltaStyle = (d: 'better' | 'worse' | 'same') => ({
  backgroundColor: d === 'better' ? colors.goodSoft : d === 'worse' ? colors.warnSoft : colors.surfaceMuted,
});

const NODE = 52;
const styles = StyleSheet.create({
  hero: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    gap: spacing.md,
    ...shadow.soft,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    gap: 2,
    ...shadow.soft,
  },
  statValueRow: { flexDirection: 'row', alignItems: 'flex-end' },
  statValue: { fontSize: 22, fontWeight: '800', color: colors.text },
  statUnit: { fontSize: 12, fontWeight: '700', color: colors.textMuted, marginBottom: 2 },
  statLabel: { fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.3 },
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  filters: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
  },
  chipActive: { backgroundColor: colors.primary },
  chipText: { ...type.small, fontWeight: '700', color: colors.textMuted },
  chipTextActive: { color: colors.textOnPrimary },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg },
  emptyEmoji: { fontSize: 64 },
  timeline: { width: '100%' },
  row: { flexDirection: 'row', gap: spacing.md },
  railCol: { alignItems: 'center', width: NODE },
  node: {
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    borderWidth: 3,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  nodeImg: { width: '100%', height: '100%' },
  nodeEmoji: { fontSize: 24 },
  rail: { flex: 1, width: 2.5, backgroundColor: colors.border, marginVertical: 4 },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  cardTitle: { ...type.body, fontWeight: '700' },
  delta: { alignSelf: 'flex-start', borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 2, marginTop: 2 },
  deltaText: { fontSize: 11, fontWeight: '800' },
  scoreCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  scoreText: { color: colors.textOnPrimary, fontWeight: '800', fontSize: 17 },
});
