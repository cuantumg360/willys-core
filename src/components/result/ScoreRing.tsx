import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors, type } from '@/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  /** Valor actual (BCS 1-9 o nota 0-100). */
  value: number;
  /** Valor máximo de la escala. */
  max: number;
  /** Texto bajo el número (categoría). */
  categoria: string;
  /** Color del veredicto (semáforo). */
  color: string;
  /** Sufijo del número (p. ej. "/9"). */
  suffix?: string;
}

const SIZE = 184;
const STROKE = 16;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;

/**
 * Anillo de puntuación tipo panel premium (estilo MyFitnessPal): número
 * grande en el centro, anillo de progreso animado en color de semáforo y la
 * categoría debajo. Sustituye al medidor antiguo.
 */
export function ScoreRing({ value, max, categoria, color, suffix }: Props) {
  const progress = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);
  const fraction = Math.min(1, Math.max(0.04, value / max));

  useEffect(() => {
    // Cuenta el número hacia arriba mientras el anillo se llena (delight premium).
    const id = progress.addListener(({ value: v }) => setDisplay(Math.round((v / fraction) * value)));
    Animated.timing(progress, {
      toValue: fraction,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => progress.removeListener(id);
  }, [fraction, value, progress]);

  const dashoffset = progress.interpolate({ inputRange: [0, 1], outputRange: [C, 0] });

  return (
    <View style={{ width: SIZE, height: SIZE }}>
      <Svg width={SIZE} height={SIZE}>
        <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={colors.surfaceMuted} strokeWidth={STROKE} fill="none" />
        <AnimatedCircle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke={color}
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={C}
          strokeDashoffset={dashoffset}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={[styles.value, { color }]}>
          {Math.min(Math.round(value), display)}
          {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
        </Text>
        <Text style={[styles.categoria, { color }]} numberOfLines={1}>
          {categoria}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  value: { fontSize: 58, fontWeight: '900', lineHeight: 62 },
  suffix: { fontSize: 22, fontWeight: '800', color: colors.textMuted },
  categoria: { ...type.heading, marginTop: 2 },
});
