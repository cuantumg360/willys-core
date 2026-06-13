import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';

import { colors, spacing, type } from '@/theme';

const W = 300;
const H = 96;
const PAD = 14;

interface Props {
  /** Pesos en orden cronológico ascendente (mín. 2). */
  values: number[];
  caption: string;
}

/** Mini-gráfica de evolución del peso con auto-escala. */
export function WeightChart({ values, caption }: Props) {
  const points = values.slice(-10);
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;

  const xFor = (i: number) =>
    points.length === 1 ? W / 2 : PAD + (i / (points.length - 1)) * (W - PAD * 2);
  const yFor = (v: number) => H - PAD - ((v - min) / span) * (H - PAD * 2);

  const polyline = points.map((v, i) => `${xFor(i)},${yFor(v)}`).join(' ');

  return (
    <View style={styles.wrap}>
      <Svg width={W} height={H} style={{ alignSelf: 'center' }}>
        <Polyline points={polyline} stroke={colors.primary} strokeWidth={3} fill="none" />
        {points.map((v, i) => (
          <Circle key={i} cx={xFor(i)} cy={yFor(v)} r={4} fill={colors.primary} />
        ))}
      </Svg>
      <Text style={[type.small, { textAlign: 'center' }]}>{caption}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
});
