import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

interface Props {
  size?: number;
  color?: string;
  count?: number;
}

const CYCLE_MS = 2000;

/**
 * Anillos concéntricos que se expanden y se desvanecen en bucle, escalonados.
 * Da sensación de "energía de escaneo" detrás del icono. Native driver.
 */
export function PulseRings({ size = 150, color = colors.primary, count = 3 }: Props) {
  const rings = useRef(Array.from({ length: count }, () => new Animated.Value(0))).current;

  useEffect(() => {
    const loops = rings.map((value) =>
      Animated.loop(
        Animated.timing(value, {
          toValue: 1,
          duration: CYCLE_MS,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ),
    );
    const timers = rings.map((_, i) =>
      setTimeout(() => loops[i].start(), (i * CYCLE_MS) / count),
    );
    return () => {
      timers.forEach(clearTimeout);
      loops.forEach((loop) => loop.stop());
    };
  }, [rings, count]);

  return (
    <View pointerEvents="none" style={[styles.wrap, { width: size, height: size }]}>
      {rings.map((value, i) => (
        <Animated.View
          key={i}
          style={[
            styles.ring,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderColor: color,
              opacity: value.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] }),
              transform: [
                { scale: value.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1.25] }) },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', borderWidth: 2 },
});
