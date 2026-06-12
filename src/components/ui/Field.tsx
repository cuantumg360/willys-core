import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { colors, radius, spacing, type } from '@/theme';

interface Props extends TextInputProps {
  label?: string;
}

/** Campo de texto con la estética de la app (label opcional encima). */
export function Field({ label, style, ...inputProps }: Props) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.input, style]}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  label: { ...type.small, fontWeight: '600', color: colors.textMuted },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 17,
    color: colors.text,
  },
});
