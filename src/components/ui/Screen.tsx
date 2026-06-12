import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme';

interface Props extends PropsWithChildren {
  /** Con scroll (por defecto) o fijo. */
  scroll?: boolean;
  style?: ViewStyle;
}

/** Contenedor base de pantalla: fondo cálido, safe area y padding estándar. */
export function Screen({ children, scroll = true, style }: Props) {
  const insets = useSafeAreaInsets();
  const padding = {
    paddingTop: insets.top + spacing.md,
    paddingBottom: insets.bottom + spacing.lg,
  };

  if (!scroll) {
    return <View style={[styles.base, padding, style]}>{children}</View>;
  }
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.base, padding, style]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  base: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
});
