import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Polyline, Rect } from 'react-native-svg';

import { t } from '@/i18n';
import { colors, radius, spacing, type } from '@/theme';

const W = 300;
const H = 110;
const PAD = 12;

interface Props {
  /** Puntuaciones BCS en orden cronológico (mín. 2). */
  values: number[];
  petName: string;
}

/** Mini-gráfica de evolución del BCS con banda verde del rango ideal (4-5). */
export function TrendChart({ values, petName }: Props) {
  const points = values.slice(-8);
  const yFor = (bcs: number) => H - PAD - ((bcs - 1) / 8) * (H - PAD * 2);
  const xFor = (i: number) =>
    points.length === 1 ? W / 2 : PAD + (i / (points.length - 1)) * (W - PAD * 2);

  const polyline = points.map((v, i) => `${xFor(i)},${yFor(v)}`).join(' ');

  return (
    <View style={styles.card}>
      <Text style={type.heading}>{t('history.trend.title', { name: petName })}</Text>
      <Svg width={W} height={H} style={{ alignSelf: 'center' }}>
        <Rect
          x={0}
          y={yFor(5)}
          width={W}
          height={yFor(4) - yFor(5)}
          fill={colors.goodSoft}
          rx={4}
        />
        <Polyline points={polyline} stroke={colors.primary} strokeWidth={3} fill="none" />
        {points.map((v, i) => (
          <Circle key={i} cx={xFor(i)} cy={yFor(v)} r={5} fill={colors.primary} />
        ))}
      </Svg>
      <Text style={type.small}>{t('history.trend.caption')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
});
