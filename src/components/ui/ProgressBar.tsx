import { StyleSheet, View } from 'react-native';

import { colors, radius } from '@/theme';

/** Barra de progreso del onboarding (step empieza en 1). */
export function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${(step / total) * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.primary },
});
