import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { t, type TKey } from '@/i18n';
import { colors, radius, spacing, type } from '@/theme';

type Level = 0 | 1 | 2;
const LEVEL_COLOR: Record<Level, string> = { 0: colors.good, 1: colors.warn, 2: colors.bad };
const LEVEL_KEY: Record<Level, TKey> = {
  0: 'result.zones.ideal',
  1: 'result.zones.mild',
  2: 'result.zones.excess',
};

const ZONES: { id: string; emoji: string; labelKey: TKey; weight: number }[] = [
  { id: 'cuello', emoji: '🦴', labelKey: 'result.bodymap.z.cuello', weight: 0.5 },
  { id: 'costillas', emoji: '🩻', labelKey: 'result.bodymap.z.costillas', weight: 0.7 },
  { id: 'cintura', emoji: '📏', labelKey: 'result.bodymap.z.cintura', weight: 1 },
  { id: 'abdomen', emoji: '🫃', labelKey: 'result.bodymap.z.abdomen', weight: 1 },
  { id: 'cola', emoji: '🐕', labelKey: 'result.bodymap.z.cola', weight: 0.85 },
];

/**
 * Desglose por zonas corporales: una fila por zona con su estado (ideal /
 * leve / exceso) y una barra de relleno. Limpio y legible, sin superponer
 * nada sobre la foto. La gravedad sale del BCS.
 */
export function ZoneBreakdown({ bcs }: { bcs: number }) {
  const overall = Math.min(1, Math.max(0, (bcs - 4.5) / 4.5));
  return (
    <View style={{ gap: spacing.md }}>
      {ZONES.map((z, i) => {
        const sev = Math.min(1, overall * (0.55 + z.weight * 0.75));
        const level: Level = sev < 0.33 ? 0 : sev < 0.66 ? 1 : 2;
        return (
          <ZoneRow
            key={z.id}
            delay={i * 90}
            emoji={z.emoji}
            label={t(z.labelKey)}
            level={level}
            fill={0.18 + sev * 0.82}
          />
        );
      })}
    </View>
  );
}

function ZoneRow({
  emoji,
  label,
  level,
  fill,
  delay,
}: {
  emoji: string;
  label: string;
  level: Level;
  fill: number;
  delay: number;
}) {
  const grow = useRef(new Animated.Value(0)).current;
  const color = LEVEL_COLOR[level];
  useEffect(() => {
    Animated.timing(grow, {
      toValue: fill,
      duration: 700,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [fill, delay, grow]);
  const width = grow.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.row}>
      <Text style={styles.emoji}>{emoji}</Text>
      <View style={{ flex: 1, gap: 6 }}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          <View style={[styles.tag, { backgroundColor: color }]}>
            <Text style={styles.tagText}>{t(LEVEL_KEY[level])}</Text>
          </View>
        </View>
        <View style={styles.track}>
          <Animated.View style={[styles.fill, { width, backgroundColor: color }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  emoji: { fontSize: 22, width: 28, textAlign: 'center' },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { ...type.body, fontWeight: '700' },
  tag: { borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  tagText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  track: { height: 8, borderRadius: radius.pill, backgroundColor: colors.surfaceMuted, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
});
