import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, scoreColor, spacing, type } from '@/theme';

/** Nota 0-100 con barra de color semáforo (escáner de etiquetas). */
export function ScoreBar({ value, categoria }: { value: number; categoria: string }) {
  const color = scoreColor(value);
  return (
    <View style={styles.wrap}>
      <Text style={[styles.value, { color }]}>
        {Math.round(value)}
        <Text style={styles.outOf}>/100</Text>
      </Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${value}%`, backgroundColor: color }]} />
      </View>
      <Text style={[type.heading, { color }]}>{categoria}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: spacing.sm, width: '100%' },
  value: { fontSize: 56, fontWeight: '800' },
  outOf: { fontSize: 22, fontWeight: '700', color: colors.textMuted },
  track: {
    width: '100%',
    height: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill },
});
