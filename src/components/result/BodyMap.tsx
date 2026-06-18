import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { t, type TKey } from '@/i18n';
import { colors, gradients, radius, spacing, type } from '@/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

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
  cx: number;
  cy: number;
  r: number;
  /** Cuánto se ve afectada esta zona al subir el BCS (0–1). */
  weight: number;
}

const DIMS: Record<ViewMode, { w: number; h: number }> = {
  side: { w: 260, h: 188 },
  top: { w: 220, h: 290 },
};

// Vista lateral (perfil): la más intuitiva para el dueño (barriga, papada…).
const SIDE_ZONES: Zone[] = [
  { id: 'papada', cx: 205, cy: 92, r: 17, weight: 0.7 },
  { id: 'pecho', cx: 188, cy: 116, r: 20, weight: 0.6 },
  { id: 'lomo', cx: 120, cy: 74, r: 22, weight: 0.55 },
  { id: 'costillas', cx: 146, cy: 108, r: 22, weight: 0.75 },
  { id: 'barriga', cx: 118, cy: 132, r: 26, weight: 1 },
  { id: 'cola', cx: 56, cy: 92, r: 18, weight: 0.85 },
];

// Vista superior (cenital): muestra la cintura y la simetría.
const TOP_ZONES: Zone[] = [
  { id: 'cuello', cx: 110, cy: 70, r: 24, weight: 0.5 },
  { id: 'costillas', cx: 80, cy: 112, r: 22, weight: 0.7 },
  { id: 'cintura', cx: 76, cy: 156, r: 25, weight: 1 },
  { id: 'cintura', cx: 144, cy: 156, r: 25, weight: 1 },
  { id: 'abdomen', cx: 110, cy: 176, r: 28, weight: 1 },
  { id: 'cola', cx: 110, cy: 214, r: 22, weight: 0.85 },
];

interface Props {
  bcs: number;
}

/**
 * Mapa corporal INTERACTIVO: silueta del perro con las zonas donde acumula
 * grasa. El dueño puede cambiar entre vista lateral y superior y tocar cada
 * zona para ver exactamente dónde se acumula la grasa y qué significa. La
 * intensidad/el color de cada zona dependen del BCS (semáforo good/warn/bad).
 */
export function BodyMap({ bcs }: Props) {
  const pulse = useRef(new Animated.Value(0)).current;
  const scan = useRef(new Animated.Value(0)).current;
  const [view, setView] = useState<ViewMode>('side');
  const [selected, setSelected] = useState<string | null>(null);

  // 0 (ideal ~4.5) → 1 (obesidad 9). Cuánta grasa hay en total.
  const overall = Math.min(1, Math.max(0, (bcs - 4.5) / 4.5));

  const zones = view === 'side' ? SIDE_ZONES : TOP_ZONES;
  const dims = DIMS[view];

  const levelOf = (z: Zone): Level => {
    const sev = Math.min(1, overall * (0.55 + z.weight * 0.75));
    return sev < 0.33 ? 0 : sev < 0.66 ? 1 : 2;
  };

  // Al cambiar de vista, preselecciona la zona más afectada para que el
  // panel de detalle nunca esté vacío.
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
        Animated.timing(pulse, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
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

  const scanY = scan.interpolate({ inputRange: [0, 1], outputRange: [12, dims.h - 18] });

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
        {/* Cabecera: título + selector de vista */}
        <View style={styles.head}>
          <Text style={styles.title}>{t('result.bodymap.title')}</Text>
          <View style={styles.toggle}>
            <TogglePill label={t('result.bodymap.viewSide')} active={view === 'side'} onPress={() => switchView('side')} />
            <TogglePill label={t('result.bodymap.viewTop')} active={view === 'top'} onPress={() => switchView('top')} />
          </View>
        </View>

        {/* Escenario: silueta + glows + capa táctil */}
        <View style={[styles.stage, { width: dims.w, height: dims.h }]}>
          <Svg width={dims.w} height={dims.h} viewBox={`0 0 ${dims.w} ${dims.h}`}>
            <Defs>
              <RadialGradient id="g0" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={LEVEL_COLOR[0]} stopOpacity="0.95" />
                <Stop offset="100%" stopColor={LEVEL_COLOR[0]} stopOpacity="0" />
              </RadialGradient>
              <RadialGradient id="g1" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={LEVEL_COLOR[1]} stopOpacity="0.95" />
                <Stop offset="100%" stopColor={LEVEL_COLOR[1]} stopOpacity="0" />
              </RadialGradient>
              <RadialGradient id="g2" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={LEVEL_COLOR[2]} stopOpacity="0.95" />
                <Stop offset="100%" stopColor={LEVEL_COLOR[2]} stopOpacity="0" />
              </RadialGradient>
            </Defs>

            {view === 'side' ? <SideSilhouette /> : <TopSilhouette />}

            {/* Glows de grasa por zona */}
            {zones.map((z, i) => {
              const level = levelOf(z);
              const isActive = z.id === activeId;
              return (
                <G key={`${z.id}-${i}`}>
                  <AnimatedCircle
                    cx={z.cx}
                    cy={z.cy}
                    r={z.r * (0.75 + 0.35 * (level / 2 + 0.3))}
                    fill={`url(#g${level})`}
                    opacity={pulse.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.22 + level * 0.16, 0.42 + level * 0.22],
                    })}
                  />
                  {isActive && (
                    <Circle
                      cx={z.cx}
                      cy={z.cy}
                      r={z.r * 0.92}
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth={2}
                      strokeOpacity={0.9}
                    />
                  )}
                </G>
              );
            })}
          </Svg>

          {/* Línea de escaneo en movimiento */}
          <Animated.View style={[styles.scanWrap, { transform: [{ translateY: scanY }] }]} pointerEvents="none">
            <LinearGradient
              colors={['transparent', 'rgba(255,255,255,0.85)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.scanLine}
            />
          </Animated.View>

          {/* Capa táctil: un botón por zona (área de toque cómoda) */}
          {zones.map((z, i) => {
            const hit = Math.max(z.r * 2, 44);
            return (
              <Pressable
                key={`hit-${z.id}-${i}`}
                onPress={() => selectZone(z.id)}
                style={[styles.hit, { left: z.cx - hit / 2, top: z.cy - hit / 2, width: hit, height: hit }]}
                hitSlop={4}
              />
            );
          })}
        </View>

        {/* Panel de detalle de la zona seleccionada */}
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

function TogglePill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.pill, active && styles.pillActive]} hitSlop={6}>
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </Pressable>
  );
}

/** Silueta lateral (perfil) estilizada de un perro mirando a la derecha. */
function SideSilhouette() {
  const fill = 'rgba(255,255,255,0.13)';
  const stroke = 'rgba(255,255,255,0.24)';
  return (
    <G>
      {/* Patas (detrás del cuerpo) */}
      <Rect x={78} y={132} width={15} height={46} rx={7} fill={fill} />
      <Rect x={158} y={132} width={15} height={46} rx={7} fill={fill} />
      {/* Cola */}
      <Path d="M52 96 C 36 92, 26 80, 22 66" stroke={stroke} strokeWidth={7} strokeLinecap="round" fill="none" />
      {/* Cuerpo + cabeza */}
      <Path
        d="M50 100
           C 40 80, 56 66, 82 66
           L 150 66
           C 170 66, 178 56, 188 46
           C 197 38, 214 40, 219 52
           L 240 54
           C 249 54, 249 66, 240 68
           L 216 70
           C 211 82, 201 86, 198 100
           C 196 116, 192 132, 172 134
           L 86 134
           C 64 134, 50 122, 50 100 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={1.5}
      />
      {/* Oreja */}
      <Path d="M196 48 C 200 36, 210 34, 214 44 C 210 50, 202 52, 196 48 Z" fill="rgba(255,255,255,0.10)" />
      {/* Ojo (detalle) */}
      <Circle cx={224} cy={62} r={2.4} fill="rgba(255,255,255,0.45)" />
    </G>
  );
}

/** Silueta superior (cenital) de un perro: cabeza, cuerpo con cintura y cola. */
function TopSilhouette() {
  const fill = 'rgba(255,255,255,0.13)';
  const stroke = 'rgba(255,255,255,0.22)';
  return (
    <G>
      <Ellipse cx={94} cy={34} rx={10} ry={15} fill="rgba(255,255,255,0.10)" transform="rotate(-18 94 34)" />
      <Ellipse cx={126} cy={34} rx={10} ry={15} fill="rgba(255,255,255,0.10)" transform="rotate(18 126 34)" />
      <Circle cx={110} cy={44} r={19} fill="rgba(255,255,255,0.12)" />
      <Path
        d="M110 60
           C 88 62, 77 80, 79 100
           C 81 118, 88 132, 84 152
           C 81 172, 82 198, 96 218
           C 104 230, 116 230, 124 218
           C 138 198, 139 172, 136 152
           C 132 132, 139 118, 141 100
           C 143 80, 132 62, 110 60 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={1.5}
      />
      <Path d="M110 224 C 108 242, 113 254, 119 262" stroke="rgba(255,255,255,0.18)" strokeWidth={5} strokeLinecap="round" fill="none" />
    </G>
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
  toggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: radius.pill,
    padding: 3,
  },
  pill: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.pill },
  pillActive: { backgroundColor: '#FFFFFF' },
  pillText: { ...type.small, fontWeight: '700', color: 'rgba(255,255,255,0.8)' },
  pillTextActive: { color: colors.text },
  stage: { alignSelf: 'center' },
  scanWrap: { position: 'absolute', left: 0, right: 0, height: 16, justifyContent: 'center' },
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
