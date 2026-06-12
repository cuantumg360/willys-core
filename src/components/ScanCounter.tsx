import { StyleSheet, Text, View } from 'react-native';

import { FREE_SCANS_TOTAL } from '@/config/limits';
import { t } from '@/i18n';
import { usePurchases } from '@/services/purchases';
import { freeScansLeft, useAppStore } from '@/store/useAppStore';
import { colors, radius, spacing, type } from '@/theme';

/** Contador visible de escaneos gratis (o badge premium). */
export function ScanCounter() {
  const premium = usePurchases((s) => s.premium);
  const used = useAppStore((s) => s.freeScansUsed);

  if (premium) {
    return (
      <View style={[styles.pill, styles.premium]}>
        <Text style={[styles.text, { color: colors.primaryDark }]}>{t('home.premium')}</Text>
      </View>
    );
  }

  const left = freeScansLeft(used);
  const label =
    left === 0
      ? t('home.scansLeft.none')
      : left === 1
        ? t('home.scansLeft.one')
        : t('home.scansLeft.many', { count: left });

  return (
    <View style={[styles.pill, left === 0 && styles.empty]}>
      <View style={styles.dots}>
        {Array.from({ length: FREE_SCANS_TOTAL }).map((_, i) => (
          <View key={i} style={[styles.dot, i < left ? styles.dotOn : styles.dotOff]} />
        ))}
      </View>
      <Text style={[styles.text, left === 0 && { color: colors.bad }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  premium: { backgroundColor: colors.primarySoft },
  empty: { backgroundColor: colors.badSoft },
  dots: { flexDirection: 'row', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotOn: { backgroundColor: colors.primary },
  dotOff: { backgroundColor: colors.border },
  text: { ...type.small, fontWeight: '600', color: colors.text },
});
