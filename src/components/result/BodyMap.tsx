import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';

import { t, type TKey } from '@/i18n';
import { colors, gradients, radius, spacing, type } from '@/theme';

type ViewMode = 'side' | 'top';
type Level = 0 | 1 | 2;

const LEVEL_COLOR: Record<Level, string> = { 0: colors.good, 1: colors.warn, 2: colors.bad };
const LEVEL_KEY: Record<Level, TKey> = {
  0: 'result.bodymap.level.low',
  1: 'result.bodymap.level.mid',
  2: 'result.bodymap.level.high',
};

interface Zone {
  id: string;
  /** Posición en fracción de la imagen (0–1). */
  fx: number;
  fy: number;
  /** Cuánto se ve afectada esta zona al subir el BCS (0–1). */
  weight: number;
}

// Vista lateral (perro mirando a la derecha, como la guía de la cámara).
const SIDE_ZONES: Zone[] = [
  { id: 'papada', fx: 0.82, fy: 0.5, weight: 0.7 },
  { id: 'lomo', fx: 0.5, fy: 0.32, weight: 0.55 },
  { id: 'costillas', fx: 0.55, fy: 0.55, weight: 0.75 },
  { id: 'barriga', fx: 0.44, fy: 0.74, weight: 1 },
  { id: 'cola', fx: 0.16, fy: 0.46, weight: 0.85 },
];

// Vista superior (cabeza arriba, cola abajo).
const TOP_ZONES: Zone[] = [
  { id: 'cuello', fx: 0.5, fy: 0.24, weight: 0.5 },
  { id: 'costillas', fx: 0.5, fy: 0.43, weight: 0.7 },
  { id: 'cintura', fx: 0.5, fy: 0.6, weight: 1 },
  { id: 'abdomen', fx: 0.5, fy: 0.72, weight: 1 },
  { id: 'cola', fx: 0.5, fy: 0.87, weight: 0.85 },
];

interface Props {
  bcs: number;
  sidePhoto?: string;
  topPhoto?: string;
}

/**
 * Mapa corporal INTERACTIVO sobre la FOTO REAL del perro: cada perro tiene
 * su propia imagen (nada genérico). El dueño cambia entre vista lateral y
 * superior, y toca cada zona para ver dónde acumula grasa. La foto se
 * oscurece con un tratamiento de "escáner" y las zonas brillan por
 * gravedad (semáforo) según el BCS.
 */
export function BodyMap({ bcs, sidePhoto, topPhoto }: Props) {
  const pulse = useRef(new Animated.Value(0)).current;
  const scan = useRef(new Animated.Value(0)).current;
  const [view, setView] = useState<ViewMode>('side');
  const [selected, setSelected] = useState<string | null>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  const overall = Math.min(1, Math.max(0, (bcs - 4.5) / 4.5));
  const zones = view === 'side' ? SIDE_ZONES : TOP_ZONES;
  const photo = view === 'side' ? (sidePhoto ?? topPhoto) : (topPhoto ?? sidePhoto);

  const levelOf = (z: Zone): Level => {
    const sev = Math.min(1, overall * (0.55 + z.weight * 0.75));
    return sev < 0.33 ? 0 : sev < 0.66 ? 1 : 2;
  };

  const worst = useMemo(() => {
    let best = zones[0];
    let bestSev = -1;
    for (const z of zones) {
      const sev = overall * (0.55 + z.weight * 0.75);
      if (sev > bestSev) {
        bestSev = sev;
        best = z;
      }
    }
    return best.id;
  }, [view, overall]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeId = selected ?? worst;
  const activeZone = zones.find((z) => z.id === activeId) ?? zones[0];
  const activeLevel = levelOf(activeZone);

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    const scanLoop = Animated.loop(
      Animated.timing(scan, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    );
    pulseLoop.start();
    scanLoop.start();
    return () => {
      pulseLoop.stop();
      scanLoop.stop();
    };
  }, [pulse, scan]);

  const onLayout = (e: LayoutChangeEvent) =>
    setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });
  const scanY = scan.interpolate({ inputRange: [0, 1], outputRange: [box.h * 0.12, box.h * 0.86] });

  const selectZone = (id: string) => {
    Haptics.selectionAsync();
    setSelected(id);
  };
  const switchView = (next: ViewMode) => {
    if (next === view) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setView(next);
    setSelected(null);
  };

  return (
    <View style={styles.wrap}>
      <LinearGradient colors={gradients.dark} style={styles.card}>
        <View style={styles.head}>
          <Text style={styles.title}>{t('result.bodymap.title')}</Text>
          <View style={styles.toggle}>
            <TogglePill label={t('result.bodymap.viewSide')} active={view === 'side'} onPress={() => switchView('side')} />
            <TogglePill label={t('result.bodymap.viewTop')} active={view === 'top'} onPress={() => switchView('top')} />
          </View>
        </View>

        {/* Escenario: foto real del perro + zonas + capa táctil */}
        <View style={styles.stage} onLayout={onLayout}>
          {photo ? (
            <Image source={{ uri: photo }} style={StyleSheet.absoluteFill} contentFit="cover" transition={180} />
          ) : (
            <LinearGradient colors={['#23332C', '#10201A']} style={StyleSheet.absoluteFill} />
          )}
          {/* Velo oscuro para efecto escáner */}
          <LinearGradient
            colors={['rgba(8,20,15,0.45)', 'rgba(8,20,15,0.25)', 'rgba(8,20,15,0.55)']}
            style={StyleSheet.absoluteFill}
          />

          {box.w > 0 &&
            zones.map((z) => {
              const level = levelOf(z);
              const isActive = z.id === activeId;
              const r = 24 * (0.85 + z.weight * 0.35);
              const cx = z.fx * box.w;
              const cy = z.fy * box.h;
              return (
                <Glow
                  key={z.id}
                  pulse={pulse}
                  color={LEVEL_COLOR[level]}
                  level={level}
                  r={r}
                  cx={cx}
                  cy={cy}
                  active={isActive}
                />
              );
            })}

          {/* Línea de escaneo */}
          {box.h > 0 && (
            <Animated.View style={[styles.scanWrap, { transform: [{ translateY: scanY }] }]} pointerEvents="none">
              <LinearGradient
                colors={['transparent', 'rgba(124,242,200,0.9)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.scanLine}
              />
            </Animated.View>
          )}

          {/* Capa táctil */}
          {box.w > 0 &&
            zones.map((z) => {
              const hit = 52;
              return (
                <Pressable
                  key={`hit-${z.id}`}
                  onPress={() => selectZone(z.id)}
                  style={[styles.hit, { left: z.fx * box.w - hit / 2, top: z.fy * box.h - hit / 2, width: hit, height: hit }]}
                  hitSlop={2}
                />
              );
            })}
        </View>

        {/* Panel de detalle */}
        <View style={styles.detail}>
          <View style={styles.detailHead}>
            <Text style={styles.detailZone}>{t(`result.bodymap.z.${activeZone.id}` as TKey)}</Text>
            <View style={[styles.levelTag, { backgroundColor: LEVEL_COLOR[activeLevel] }]}>
              <Text style={styles.levelTagText}>{t(LEVEL_KEY[activeLevel])}</Text>
            </View>
          </View>
          <Text style={styles.detailDesc}>{t(`result.bodymap.d.${activeZone.id}` as TKey)}</Text>
        </View>

        <Text style={styles.hint}>{t('result.bodymap.tapHint')}</Text>
      </LinearGradient>
    </View>
  );
}

/** Punto de calor animado (glow) sobre una zona. */
function Glow({
  pulse,
  color,
  level,
  r,
  cx,
  cy,
  active,
}: {
  pulse: Animated.Value;
  color: string;
  level: Level;
  r: number;
  cx: number;
  cy: number;
  active: boolean;
}) {
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.12] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35 + level * 0.12, 0.6 + level * 0.16] });
  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: cx - r,
          top: cy - r,
          width: r * 2,
          height: r * 2,
          borderRadius: r,
          backgroundColor: color,
          opacity,
          transform: [{ scale }],
        }}
      />
      {/* Núcleo brillante */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: cx - r * 0.4,
          top: cy - r * 0.4,
          width: r * 0.8,
          height: r * 0.8,
          borderRadius: r * 0.4,
          backgroundColor: color,
        }}
      />
      {active && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: cx - r - 3,
            top: cy - r - 3,
            width: (r + 3) * 2,
            height: (r + 3) * 2,
            borderRadius: r + 3,
            borderWidth: 2,
            borderColor: '#FFFFFF',
          }}
        />
      )}
    </>
  );
}

function TogglePill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.pill, active && styles.pillActive]} hitSlop={6}>
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  card: {
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    overflow: 'hidden',
    width: '100%',
  },
  head: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: { ...type.heading, color: '#FFFFFF' },
  toggle: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: radius.pill, padding: 3 },
  pill: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.pill },
  pillActive: { backgroundColor: '#FFFFFF' },
  pillText: { ...type.small, fontWeight: '700', color: 'rgba(255,255,255,0.8)' },
  pillTextActive: { color: colors.text },
  stage: {
    width: '100%',
    height: 280,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: '#10201A',
  },
  scanWrap: { position: 'absolute', left: 0, right: 0, height: 14, justifyContent: 'center' },
  scanLine: { height: 2, borderRadius: 2 },
  hit: { position: 'absolute', borderRadius: 999 },
  detail: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  detailHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  detailZone: { ...type.body, fontWeight: '800', color: '#FFFFFF', flex: 1 },
  levelTag: { borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  levelTagText: { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },
  detailDesc: { ...type.small, color: 'rgba(255,255,255,0.82)', lineHeight: 18 },
  hint: { ...type.small, color: 'rgba(255,255,255,0.6)', marginTop: spacing.sm, textAlign: 'center' },
});
