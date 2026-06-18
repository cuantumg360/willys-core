import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/Icon';
import { t } from '@/i18n';
import { usePurchases } from '@/services/purchases';
import { freeScansLeft, useAppStore } from '@/store/useAppStore';
import { colors, gradients, shadow, spacing, type } from '@/theme';

// Liquid Glass real (iOS 26) si está disponible; si no (Expo Go / iOS antiguo),
// respaldo con BlurView (cristal esmerilado). Carga segura: nunca rompe.
/* eslint-disable @typescript-eslint/no-require-imports */
let GlassViewComp: any;
let LIQUID = false;
try {
  const g = require('expo-glass-effect');
  GlassViewComp = g.GlassView;
  LIQUID = typeof g.isLiquidGlassAvailable === 'function' ? g.isLiquidGlassAvailable() : false;
} catch {
  /* no disponible */
}
/* eslint-enable @typescript-eslint/no-require-imports */

/**
 * Fondo de la barra. Liquid Glass real solo cuando el sistema lo soporta de
 * verdad (iOS 26 dev build); en cualquier otro caso, blanco sólido limpio
 * (como MyFitnessPal). Nada de blur a medias que se vea mal.
 */
function GlassBackground() {
  if (LIQUID && GlassViewComp) {
    return <GlassViewComp glassEffectStyle="regular" style={StyleSheet.absoluteFill} />;
  }
  return <View style={styles.glassSolid} pointerEvents="none" />;
}

interface TabDef {
  name: string;
  symbol: string;
  emoji: string;
  label: string;
}

// Orden visual: dos tabs · botón central de escaneo · dos tabs.
const LEFT: TabDef[] = [
  { name: 'inicio', symbol: 'house.fill', emoji: '🏠', label: t('tab.inicio') },
  { name: 'salud', symbol: 'heart.fill', emoji: '❤️', label: t('tab.salud') },
];
const RIGHT: TabDef[] = [
  { name: 'historial', symbol: 'clock.fill', emoji: '🕒', label: t('history.title') },
  { name: 'ajustes', symbol: 'gearshape.fill', emoji: '⚙️', label: t('settings.title') },
];

/**
 * Barra inferior flotante estilo "premium" (tipo MyFitnessPal): píldora
 * blanca elevada con sombra y un botón central de escaneo destacado. El
 * botón central no es una ruta, es la acción principal de la app.
 */
export function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const premium = usePurchases((s) => s.premium);
  const freeScansUsed = useAppStore((s) => s.freeScansUsed);

  const activeName = state.routes[state.index]?.name;

  const go = (name: string) => {
    const route = state.routes.find((r) => r.name === name);
    if (!route) return;
    const isFocused = activeName === name;
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (!isFocused && !event.defaultPrevented) navigation.navigate(name as never);
  };

  const scan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const canScan = premium || freeScansLeft(freeScansUsed) > 0;
    router.push(canScan ? '/escaner/condicion_corporal' : '/paywall?context=limite');
  };

  const renderTab = (tab: TabDef) => {
    const focused = activeName === tab.name;
    const color = focused ? colors.primary : colors.textMuted;
    return (
      <Pressable key={tab.name} style={styles.tab} onPress={() => go(tab.name)} hitSlop={6}>
        <Icon symbol={tab.symbol as never} emoji={tab.emoji} size={23} color={color} />
        <Text style={[styles.label, { color }]} numberOfLines={1}>
          {tab.label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.wrap, { paddingBottom: insets.bottom + spacing.sm }]} pointerEvents="box-none">
      <View style={styles.shadowWrap}>
        <View style={styles.pill}>
          <GlassBackground />
          {LEFT.map(renderTab)}

        <View style={styles.fabSlot}>
          <Pressable onPress={scan} style={styles.fabPress} hitSlop={8}>
            <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fab}>
              <Icon symbol="viewfinder" emoji="📸" size={26} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.fabLabel}>{t('tab.scan')}</Text>
          </Pressable>
        </View>

          {RIGHT.map(renderTab)}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  shadowWrap: {
    width: '100%',
    borderRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 14,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 30,
    paddingHorizontal: spacing.sm,
    height: 66,
    width: '100%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  glassSolid: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.surface },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  label: { ...type.small, fontSize: 11, fontWeight: '700' },
  fabSlot: { width: 74, alignItems: 'center' },
  fabPress: { alignItems: 'center', gap: 3 },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -26,
    borderWidth: 4,
    borderColor: colors.surface,
    ...shadow.card,
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  fabLabel: { ...type.small, fontSize: 11, fontWeight: '800', color: colors.primary, marginTop: -2 },
});
