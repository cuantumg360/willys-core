import { StyleSheet, View } from 'react-native';

import { colors, radius } from '@/theme';

/** Barra de progreso del onboarding (step empieza en 1). */
export function ProgressBar({
  step,
  total,
  tone = 'default',
}: {
  step: number;
  total: number;
  tone?: 'default' | 'light';
}) {
  const light = tone === 'light';
  return (
    <View style={[styles.track, light && styles.trackLight]}>
      <View
        style={[
          styles.fill,
          { width: `${(step / total) * 100}%` },
          light && styles.fillLight,
        ]}
      />
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
  trackLight: { backgroundColor: 'rgba(255,255,255,0.22)' },
  fill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.primary },
  fillLight: { backgroundColor: '#FFFFFF' },
});
