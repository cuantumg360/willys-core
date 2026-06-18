import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FadeIn } from '@/components/anim/FadeIn';
import { PetAvatar } from '@/components/PetAvatar';
import { TrendChart } from '@/components/TrendChart';
import { Screen } from '@/components/ui/Screen';
import { getScanner } from '@/features/scanners/registry';
import { t } from '@/i18n';
import { useAppStore, usePrimaryPet } from '@/store/useAppStore';
import { bcsColor, colors, gradients, radius, scoreColor, shadow, spacing, type } from '@/theme';
import { formatScanDate } from '@/utils/dates';

export default function History() {
  const pet = usePrimaryPet();
  const allScans = useAppStore((s) => s.scans);
  // Historial de la mascota activa (los escaneos sin mascota también, por compatibilidad).
  const scans = allScans.filter((scan) => !scan.petId || scan.petId === pet?.id);

  // Evolución BCS de la mascota activa (orden cronológico ascendente)
  const bcsValues = scans
    .filter((s) => s.result.tipo === 'condicion_corporal' && s.result.confianza !== 'baja')
    .map((s) => s.result.puntuacion)
    .reverse();

  return (
    <Screen floatingTabBar>
      <LinearGradient colors={gradients.hero} style={styles.hero}>
        <PetAvatar uri={pet?.fotoUri} size={48} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={type.title}>{t('history.title')}</Text>
          {scans.length > 0 && (
            <Text style={type.small}>
              {scans.length === 1
                ? t('history.count.one')
                : t('history.count.many', { count: scans.length })}
            </Text>
          )}
        </View>
      </LinearGradient>

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
        <View style={{ gap: spacing.lg }}>
          {bcsValues.length >= 2 && pet && <TrendChart values={bcsValues} petName={pet.nombre} />}

          <View style={styles.timeline}>
            {scans.map((scan, index) => {
              const scanner = getScanner(scan.scannerId);
              const isBcs = scan.result.tipo === 'condicion_corporal';
              const color = isBcs
                ? bcsColor(scan.result.puntuacion)
                : scoreColor(scan.result.puntuacion);
              const last = index === scans.length - 1;
              return (
                <FadeIn key={scan.id} delay={index * 70} offsetY={12} style={styles.row}>
                  <View style={styles.railCol}>
                    <View style={[styles.node, { backgroundColor: color }]}>
                      <Text style={styles.nodeText}>{Math.round(scan.result.puntuacion)}</Text>
                    </View>
                    {!last && <View style={styles.rail} />}
                  </View>
                  <Pressable style={styles.card} onPress={() => router.push(`/resultado/${scan.id}`)}>
                    <View style={{ flex: 1, gap: 3 }}>
                      <Text style={styles.cardTitle}>{scanner?.emoji ?? '🐾'}  {scanner ? t(scanner.titleKey) : scan.scannerId}</Text>
                      <Text style={type.small}>{formatScanDate(scan.createdAt)}</Text>
                    </View>
                    <View style={[styles.scoreTag, { backgroundColor: color }]}>
                      <Text style={styles.scoreTagText}>{scan.result.categoria}</Text>
                    </View>
                  </Pressable>
                </FadeIn>
              );
            })}
          </View>
        </View>
      )}
    </Screen>
  );
}

const NODE = 44;
const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.soft,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  emptyEmoji: { fontSize: 64 },
  timeline: { width: '100%' },
  row: { flexDirection: 'row', gap: spacing.md },
  railCol: { alignItems: 'center', width: NODE },
  node: {
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  nodeText: { color: colors.textOnPrimary, fontWeight: '800', fontSize: 16 },
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
  scoreTag: { borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  scoreTagText: { color: colors.textOnPrimary, fontWeight: '800', fontSize: 12 },
});
