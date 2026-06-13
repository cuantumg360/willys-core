import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { bcsColor, colors, type } from '@/theme';

const W = 260;
const H = 150;
const CX = W / 2;
const CY = H - 6;
const R = 106;
const STROKE = 16;
const REVEAL_MS = 1100;
/** Hueco (en unidades BCS) entre tramos, para que se lean separados. */
const GAP = 0.12;

// Tramos del semáforo en la escala BCS 1-9 (4-5 = ideal).
const SEGMENTS: { from: number; to: number; color: string }[] = [
  { from: 1, to: 2.5, color: colors.bad },
  { from: 2.5, to: 3.5, color: colors.warn },
  { from: 3.5, to: 5.5, color: colors.good },
  { from: 5.5, to: 7.5, color: colors.warn },
  { from: 7.5, to: 9, color: colors.bad },
];

function angleFor(value: number, min: number, max: number): number {
  const ratio = (value - min) / (max - min);
  return 180 - 180 * Math.min(1, Math.max(0, ratio));
}

function point(angleDeg: number, r: number) {
  const rad = (Math.PI * angleDeg) / 180;
  return { x: CX + r * Math.cos(rad), y: CY - r * Math.sin(rad) };
}

function arcPath(fromAngle: number, toAngle: number): string {
  const start = point(fromAngle, R);
  const end = point(toAngle, R);
  return `M ${start.x} ${start.y} A ${R} ${R} 0 0 1 ${end.x} ${end.y}`;
}

/**
 * Medidor semicircular tipo semáforo para la escala BCS 1-9. El número
 * vive limpio en el centro del hueco y un marcador se desliza por el arco
 * hasta el valor (sin aguja, para que nada se solape).
 */
export function Gauge({ value, categoria }: { value: number; categoria: string }) {
  const anim = useRef(new Animated.Value(1)).current;
  const [display, setDisplay] = useState(1);

  useEffect(() => {
    const id = anim.addListener(({ value: v }) => setDisplay(v));
    anim.setValue(1);
    Animated.timing(anim, {
      toValue: value,
      duration: REVEAL_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => anim.removeListener(id);
  }, [value, anim]);

  const valueColor = bcsColor(value);
  const marker = point(angleFor(display, 1, 9), R);
  const shown = Number.isInteger(value) ? String(Math.round(display)) : display.toFixed(1);

  return (
    <View style={styles.wrap}>
      <View style={{ width: W, height: H }}>
        <Svg width={W} height={H}>
          {SEGMENTS.map((seg) => (
            <Path
              key={`${seg.from}`}
              d={arcPath(angleFor(seg.from + GAP, 1, 9), angleFor(seg.to - GAP, 1, 9))}
              stroke={seg.color}
              strokeWidth={STROKE}
              strokeLinecap="round"
              fill="none"
            />
          ))}
          {/* Marcador del valor sobre el arco */}
          <Circle cx={marker.x} cy={marker.y} r={13} fill={colors.surface} />
          <Circle cx={marker.x} cy={marker.y} r={9} fill={valueColor} />
        </Svg>

        <View style={styles.center}>
          <Text style={[styles.value, { color: valueColor }]}>{shown}</Text>
          <Text style={styles.outOf}>de 9</Text>
        </View>
      </View>

      <Text style={[styles.categoria, { color: valueColor }]}>{categoria}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 4 },
  center: { position: 'absolute', left: 0, right: 0, top: 58, alignItems: 'center' },
  value: { fontSize: 52, fontWeight: '800', lineHeight: 54 },
  outOf: { fontSize: 13, fontWeight: '600', color: colors.textMuted, marginTop: 2 },
  categoria: { ...type.heading, fontSize: 20 },
});
