import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { bcsColor, colors, type } from '@/theme';

const W = 280;
const H = 160;
const CX = W / 2;
const CY = H - 14;
const R = 116;
const STROKE = 22;

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

/** Gauge semicircular tipo semáforo para la escala BCS 1-9. */
export function Gauge({ value, categoria }: { value: number; categoria: string }) {
  const needleAngle = angleFor(value, 1, 9);
  const tip = point(needleAngle, R - STROKE / 2 - 8);
  const valueColor = bcsColor(value);

  return (
    <View style={styles.wrap}>
      <Svg width={W} height={H}>
        {SEGMENTS.map((seg) => (
          <Path
            key={`${seg.from}`}
            d={arcPath(angleFor(seg.from, 1, 9), angleFor(seg.to, 1, 9))}
            stroke={seg.color}
            strokeWidth={STROKE}
            strokeLinecap="butt"
            fill="none"
          />
        ))}
        <Line x1={CX} y1={CY} x2={tip.x} y2={tip.y} stroke={colors.text} strokeWidth={4} strokeLinecap="round" />
        <Circle cx={CX} cy={CY} r={8} fill={colors.text} />
      </Svg>
      <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
      <Text style={[styles.categoria, { color: valueColor }]}>{categoria}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  value: { fontSize: 44, fontWeight: '800', marginTop: -52 },
  categoria: { ...type.heading, marginTop: 2 },
});
