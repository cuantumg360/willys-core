import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme';

/** Espacio extra para que el contenido no quede tapado por la barra flotante. */
export const FLOATING_TAB_SPACE = 84;

interface Props extends PropsWithChildren {
  /** Con scroll (por defecto) o fijo. */
  scroll?: boolean;
  /** Reserva espacio inferior para la barra de tabs flotante. */
  floatingTabBar?: boolean;
  style?: ViewStyle;
}

/** Contenedor base de pantalla: fondo cálido, safe area y padding estándar. */
export function Screen({ children, scroll = true, floatingTabBar = false, style }: Props) {
  const insets = useSafeAreaInsets();
  const padding = {
    paddingTop: insets.top + spacing.md,
    paddingBottom: insets.bottom + spacing.lg + (floatingTabBar ? FLOATING_TAB_SPACE : 0),
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
