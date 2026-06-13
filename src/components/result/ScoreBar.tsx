import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { colors, radius, scoreColor, spacing, type } from '@/theme';

const REVEAL_MS = 1100;

/**
 * Nota 0-100 con barra semáforo (escáner de etiquetas). Al revelar el
 * resultado, la barra se llena y el número cuenta de 0 a la nota.
 */
export function ScoreBar({ value, categoria }: { value: number; categoria: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);
  const color = scoreColor(value);

  useEffect(() => {
    const id = anim.addListener(({ value: v }) => setDisplay(v));
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: value,
      duration: REVEAL_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => anim.removeListener(id);
  }, [value, anim]);

  return (
    <View style={styles.wrap}>
      <Text style={[styles.value, { color }]}>
        {Math.round(display)}
        <Text style={styles.outOf}>/100</Text>
      </Text>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: color,
              width: anim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
                extrapolate: 'clamp',
              }),
            },
          ]}
        />
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
