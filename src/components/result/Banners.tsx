import { StyleSheet, Text, View } from 'react-native';

import { t } from '@/i18n';
import { colors, radius, spacing, type } from '@/theme';

/**
 * Banner prioritario cuando la IA marca requiere_veterinario: true.
 * Requisito legal/de producto: debe verse antes que el resto del detalle.
 */
export function VetBanner() {
  return (
    <View style={styles.vet}>
      <Text style={styles.vetIcon}>🩺</Text>
      <Text style={[type.body, styles.vetText]}>{t('result.vetBanner')}</Text>
    </View>
  );
}

/** Disclaimer obligatorio, visible en TODOS los resultados. */
export function Disclaimer() {
  return (
    <View style={styles.disclaimer}>
      <Text style={type.small}>{t('result.disclaimer')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  vet: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.badSoft,
    borderWidth: 1,
    borderColor: colors.bad,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  vetIcon: { fontSize: 24 },
  vetText: { flex: 1, fontWeight: '600' },
  disclaimer: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.md,
  },
});
