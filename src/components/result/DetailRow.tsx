import { StyleSheet, Text, View } from 'react-native';

import { AnalysisDetail } from '@/services/analysis/types';
import { colors, radius, spacing, type } from '@/theme';

const ICONS = { positivo: '✓', negativo: '✗', neutro: '•' } as const;
const ICON_COLORS = { positivo: colors.good, negativo: colors.bad, neutro: colors.textMuted } as const;
const ICON_BG = { positivo: colors.goodSoft, negativo: colors.badSoft, neutro: colors.surfaceMuted } as const;

/** Ingrediente o rasgo relevante del análisis, con icono semáforo. */
export function DetailRow({ detail }: { detail: AnalysisDetail }) {
  return (
    <View style={styles.row}>
      <View style={[styles.icon, { backgroundColor: ICON_BG[detail.tipo] }]}>
        <Text style={[styles.iconText, { color: ICON_COLORS[detail.tipo] }]}>
          {ICONS[detail.tipo]}
        </Text>
      </View>
      <View style={styles.texts}>
        <Text style={[type.body, { fontWeight: '700' }]}>{detail.nombre}</Text>
        <Text style={type.small}>{detail.nota}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  icon: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  iconText: { fontSize: 15, fontWeight: '800' },
  texts: { flex: 1, gap: 2 },
});
