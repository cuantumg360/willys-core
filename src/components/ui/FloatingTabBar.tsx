import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/Icon';
import { t } from '@/i18n';
import { colors, gradients, shadow, spacing, type } from '@/theme';

// Liquid Glass real (iOS 26) si está disponible; si no, blanco sólido limpio.
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

// Pestañas planas dentro de la píldora (estilo MyFitnessPal).
const TABS: TabDef[] = [
  { name: 'inicio', symbol: 'house.fill', emoji: '🏠', label: t('tab.inicio') },
  { name: 'salud', symbol: 'heart.fill', emoji: '❤️', label: t('tab.salud') },
  { name: 'historial', symbol: 'clock.fill', emoji: '🕒', label: t('history.title') },
  { name: 'ajustes', symbol: 'gearshape.fill', emoji: '⚙️', label: t('settings.title') },
];

/**
 * Barra inferior estilo MyFitnessPal: píldora blanca con pestañas planas y un
 * botón redondo independiente a la derecha que abre el Asistente IA (chat).
 */
export function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const activeName = state.routes[state.index]?.name;

  const go = (name: string) => {
    const route = state.routes.find((r) => r.name === name);
    if (!route) return;
    const isFocused = activeName === name;
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (!isFocused && !event.defaultPrevented) navigation.navigate(name as never);
  };

  const openChat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/chat' as never);
  };

  return (
    <View style={[styles.wrap, { paddingBottom: insets.bottom + spacing.sm }]} pointerEvents="box-none">
      <View style={styles.shadowWrap}>
        <View style={styles.pill}>
          <GlassBackground />
          {TABS.map((tab) => {
            const focused = activeName === tab.name;
            const color = focused ? colors.primary : colors.textMuted;
            return (
              <Pressable key={tab.name} style={styles.tab} onPress={() => go(tab.name)} hitSlop={6}>
                <Icon symbol={tab.symbol as never} emoji={tab.emoji} size={22} color={color} />
                <Text style={[styles.label, { color }]} numberOfLines={1}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Botón de Chat IA a la derecha del todo */}
      <Pressable onPress={openChat} hitSlop={8} style={styles.fabPress}>
        <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fab}>
          <Icon symbol="bubble.left.fill" emoji="🤖" size={24} color="#FFFFFF" />
        </LinearGradient>
        <Text style={styles.fabLabel}>{t('chat.title')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  shadowWrap: {
    flex: 1,
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
    paddingHorizontal: spacing.xs,
    height: 66,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  glassSolid: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.surface },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  label: { ...type.small, fontSize: 10, fontWeight: '700' },
  fabPress: { alignItems: 'center', gap: 2 },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  fabLabel: { fontSize: 10, fontWeight: '800', color: colors.primary },
});
