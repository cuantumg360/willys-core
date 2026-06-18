import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, Ellipse, Path, RadialGradient, Stop } from 'react-native-svg';

import { t } from '@/i18n';
import { bcsColor, gradients, radius, spacing, type } from '@/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const W = 230;
const H = 300;

// Zonas donde un perro acumula grasa (vista cenital). Peso = cuánto se ven
// afectadas al subir el BCS.
const ZONES: { cx: number; cy: number; r: number; weight: number }[] = [
  { cx: 115, cy: 78, r: 26, weight: 0.5 }, // cuello / hombros
  { cx: 84, cy: 120, r: 24, weight: 0.7 }, // costado izq (costillas/lomo)
  { cx: 146, cy: 120, r: 24, weight: 0.7 }, // costado der
  { cx: 80, cy: 165, r: 26, weight: 1 }, // cintura/flanco izq
  { cx: 150, cy: 165, r: 26, weight: 1 }, // cintura/flanco der
  { cx: 115, cy: 185, r: 30, weight: 1 }, // abdomen
  { cx: 115, cy: 225, r: 24, weight: 0.85 }, // base de la cola
];

interface Props {
  bcs: number;
}

/**
 * Mapa corporal animado: silueta del perro vista desde arriba con las zonas
 * de acumulación de grasa brillando "en vivo" (pulso + línea de escaneo).
 * La intensidad y el color dependen del BCS. Da el efecto de un escáner
 * médico premium sin necesidad de un modelo 3D real.
 */
export function BodyMap({ bcs }: Props) {
  const pulse = useRef(new Animated.Value(0)).current;
  const scan = useRef(new Animated.Value(0)).current;
  const color = bcsColor(bcs);

  // 0 (ideal ~4.5) → 1 (obesidad 9). Marca cuánta grasa hay.
  const overall = Math.min(1, Math.max(0, (bcs - 4.5) / 4.5));

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

  const scanY = scan.interpolate({ inputRange: [0, 1], outputRange: [40, H - 60] });

  return (
    <View style={styles.wrap}>
      <LinearGradient colors={gradients.dark} style={styles.card}>
        <View style={{ width: W, height: H }}>
          <Svg width={W} height={H} viewBox="0 0 230 300">
            <Defs>
              <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={color} stopOpacity="0.9" />
                <Stop offset="100%" stopColor={color} stopOpacity="0" />
              </RadialGradient>
            </Defs>

            {/* Silueta del perro (vista cenital): cabeza, orejas, cuerpo con
                cintura, cola y patas. */}
            <Ellipse cx="98" cy="38" rx="11" ry="16" fill="rgba(255,255,255,0.10)" transform="rotate(-18 98 38)" />
            <Ellipse cx="132" cy="38" rx="11" ry="16" fill="rgba(255,255,255,0.10)" transform="rotate(18 132 38)" />
            <Circle cx="115" cy="48" r="20" fill="rgba(255,255,255,0.12)" />
            <Path
              d="M115 64
                 C 92 66, 80 84, 82 104
                 C 84 124, 92 138, 88 158
                 C 85 178, 86 206, 100 226
                 C 108 238, 122 238, 130 226
                 C 144 206, 145 178, 142 158
                 C 138 138, 146 124, 148 104
                 C 150 84, 138 66, 115 64 Z"
              fill="rgba(255,255,255,0.13)"
              stroke="rgba(255,255,255,0.22)"
              strokeWidth={1.5}
            />
            <Path d="M115 232 C 113 250, 118 262, 124 270" stroke="rgba(255,255,255,0.18)" strokeWidth={5} strokeLinecap="round" fill="none" />

            {/* Glows de grasa */}
            {ZONES.map((z, i) => (
              <AnimatedCircle
                key={i}
                cx={z.cx}
                cy={z.cy}
                r={z.r * (0.7 + 0.4 * Math.min(1, overall + 0.25) * z.weight)}
                fill="url(#glow)"
                opacity={pulse.interpolate({
                  inputRange: [0, 1],
                  outputRange: [
                    0.18 + overall * z.weight * 0.4,
                    0.4 + overall * z.weight * 0.55,
                  ],
                })}
              />
            ))}
          </Svg>

          {/* Línea de escaneo en movimiento */}
          <Animated.View style={[styles.scanWrap, { transform: [{ translateY: scanY }] }]}>
            <LinearGradient
              colors={['transparent', color, 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.scanLine}
            />
          </Animated.View>
        </View>

        <View style={styles.legendRow}>
          <View style={[styles.dot, { backgroundColor: color }]} />
          <Text style={styles.caption}>{t('result.bodymap.caption')}</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  card: {
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    overflow: 'hidden',
  },
  scanWrap: { position: 'absolute', left: 0, right: 0, height: 20, justifyContent: 'center' },
  scanLine: { height: 2.5, borderRadius: 2, opacity: 0.9 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  dot: { width: 9, height: 9, borderRadius: 5 },
  caption: { ...type.small, color: 'rgba(255,255,255,0.75)' },
});
